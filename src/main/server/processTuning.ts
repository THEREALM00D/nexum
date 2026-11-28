import { execFile } from "child_process";
import { cpus } from "os";
import type { CpuPriority } from "../../shared/types";
import type { IpcContext } from "../ipc/context";
import { formatCoreList, MAX_AFFINITY_CORES } from "../../shared/processTuning";
import { lt, managerLine } from "../i18n/logStrings";

/** Le lanceur (Palworld, Astroneer, Dragonwilds) crée son `…-Shipping.exe` après. */
const CHILD_DELAY_MS = 15 * 1000;

const PRIORITY_CLASS: Record<CpuPriority, string> = {
  low: "Idle",
  belowNormal: "BelowNormal",
  normal: "Normal",
  aboveNormal: "AboveNormal",
  high: "High",
};

/** Cœurs que ce PC peut donner à un processus (un groupe : 64 au plus). */
const usableCores = () => Math.min(cpus().length, MAX_AFFINITY_CORES);

/** Masque d'affinité signé 64 bits (`[IntPtr]` de PowerShell). */
function maskOf(cores: number[]): string {
  const mask = cores.reduce((sum, core) => sum | (1n << BigInt(core)), 0n);
  return BigInt.asIntN(64, mask).toString();
}

/**
 * Cœurs choisis qui existent sur ce PC, ou null (tous). Un réglage d'un
 * autre PC ou d'un ancien processeur donnait un masque refusé par Windows.
 */
function chosenCores(cores: number[] | undefined): number[] | null {
  const count = usableCores();
  const valid = (cores ?? []).filter(
    (core) => Number.isInteger(core) && core >= 0 && core < count,
  );
  return valid.length > 0 ? valid : null;
}

/**
 * Script PowerShell : priorité et affinité du processus et de ses enfants
 * directs (c'est le `…-Shipping.exe` qui fait le travail, et la priorité
 * n'est héritée que pour Basse / Sous la normale), sans `conhost.exe` (la
 * console du serveur, comptée sinon dans « N processus »). Ne change que ce
 * qui diffère. Que des nombres et des noms fixes dans le script ; sortie en
 * UTF-8 (sinon les accents d'un message d'erreur Windows en français se
 * perdaient). Renvoie `réglés;modifiés;échecs;message`.
 */
function tuningScript(
  pid: number,
  priorityClass: string,
  mask: string | null,
): string {
  const affinity = mask
    ? `if ([long]$process.ProcessorAffinity -ne ${mask}) { $process.ProcessorAffinity = [IntPtr][long]${mask}; $did = $true }`
    : "";
  return [
    "[Console]::OutputEncoding = [Text.Encoding]::UTF8",
    "$ErrorActionPreference = 'Stop'",
    "$ok = 0; $changed = 0; $failed = 0; $message = ''",
    "try {",
    `  $ids = @(${pid}) + @(Get-CimInstance Win32_Process -Filter \"ParentProcessId=${pid} AND Name<>'conhost.exe'\" | ForEach-Object { $_.ProcessId })`,
    "  foreach ($id in $ids) { try {",
    "    $process = Get-Process -Id $id; $did = $false",
    `    if ($process.PriorityClass -ne '${priorityClass}') { $process.PriorityClass = '${priorityClass}'; $did = $true }`,
    `    ${affinity}`,
    "    $ok++; if ($did) { $changed++ }",
    "  } catch { $failed++; $message = $_.Exception.Message } }",
    "} catch { $failed++; $message = $_.Exception.Message }",
    'Write-Output "$ok;$changed;$failed;$message"',
  ].join("\n");
}

function runPowerShell(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      "powershell",
      ["-NoProfile", "-NonInteractive", "-Command", script],
      { windowsHide: true, timeout: 20_000 },
      (error, stdout, stderr) => {
        // Jamais le message d'execFile : il contient tout le script.
        if (error)
          reject(
            new Error(stderr.trim() || String(error.code ?? "PowerShell")),
          );
        else resolve(stdout.trim());
      },
    );
  });
}

/**
 * Applique la priorité et les cœurs du serveur (`Server.cpuPriority`,
 * `Server.cpuCores`) à son processus et à ses enfants directs. Avec les
 * réglages par défaut : rien, sauf `resetDefaults` (serveur adopté, qui peut
 * garder des réglages d'avant). Un échec (serveur lancé en admin, autre
 * utilisateur) est écrit dans ses logs, sans bloquer. Renvoie le nombre de
 * processus réglés, -1 en cas d'échec (pas de 2e essai : il échouerait pareil).
 */
async function applyProcessTuning(
  ctx: IpcContext,
  serverId: string,
  expectedPid: number,
  options: { alreadyTuned?: number; resetDefaults?: boolean } = {},
): Promise<number> {
  const server = ctx.servers
    .list()
    .find((candidate) => candidate.id === serverId);
  if (!server || process.platform !== "win32") return 0;
  const priority = server.cpuPriority ?? "normal";
  const cores = chosenCores(server.cpuCores);
  const isDefault = priority === "normal" && cores === null;
  if (isDefault && !options.resetDefaults) return 0;
  const manager = ctx.serverManagers.getOrCreate(serverId);
  // Arrêté ou relancé entre-temps : un autre processus, réglé par son démarrage.
  if (manager.getPid() !== expectedPid) return 0;

  // Retour aux réglages par défaut : le masque de tous les cœurs.
  const allCores = Array.from({ length: usableCores() }, (_, core) => core);
  const mask = cores ? maskOf(cores) : isDefault ? maskOf(allCores) : null;
  try {
    const output = await runPowerShell(
      tuningScript(expectedPid, PRIORITY_CLASS[priority], mask),
    );
    const [tuned, changed, failed, ...message] = output.split(";");
    const tunedCount = Number(tuned);
    if (Number(failed) > 0) {
      manager.log(managerLine(lt().processTuningFailed(message.join(";"))));
      return -1;
    }
    if (isDefault) {
      if (Number(changed) > 0)
        manager.log(managerLine(lt().processTuningReset(Number(changed))));
      return tunedCount;
    }
    if (tunedCount <= (options.alreadyTuned ?? 0)) return tunedCount;
    manager.log(
      managerLine(
        lt().processTuningApplied(
          lt().cpuPriorityNames[priority],
          cores === null ? null : formatCoreList(cores),
          tunedCount,
        ),
      ),
    );
    return tunedCount;
  } catch (error) {
    manager.log(
      managerLine(lt().processTuningFailed((error as Error).message)),
    );
    return -1;
  }
}

/**
 * Après un démarrage ou une adoption : tout de suite, puis 15 s plus tard
 * (le processus enfant n'existe pas encore au lancement, et un enfant déjà
 * créé ne prend pas les réglages appliqués ensuite à son parent). Adoption :
 * un serveur repassé aux réglages par défaut est remis en Normale.
 */
export function scheduleProcessTuning(
  ctx: IpcContext,
  serverId: string,
  { adopted = false } = {},
): void {
  const pid = ctx.serverManagers.getOrCreate(serverId).getPid();
  if (!pid) return;
  void applyProcessTuning(ctx, serverId, pid, {
    resetDefaults: adopted,
  }).then((tuned) => {
    if (tuned <= 0) return;
    setTimeout(
      () =>
        void applyProcessTuning(ctx, serverId, pid, { alreadyTuned: tuned }),
      CHILD_DELAY_MS,
    );
  });
}
