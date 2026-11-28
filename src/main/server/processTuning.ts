import { execFile } from "child_process";
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

/** Masque d'affinité signé 64 bits (`[IntPtr]` de PowerShell), ou null : tous. */
function affinityMask(cores: number[] | undefined): string | null {
  const valid = (cores ?? []).filter(
    (core) => Number.isInteger(core) && core >= 0 && core < MAX_AFFINITY_CORES,
  );
  if (valid.length === 0) return null;
  const mask = valid.reduce((sum, core) => sum | (1n << BigInt(core)), 0n);
  return BigInt.asIntN(64, mask).toString();
}

/**
 * Script PowerShell : priorité et affinité du processus et de ses enfants
 * directs (c'est le `…-Shipping.exe` qui fait le travail, et la priorité
 * n'est héritée que pour Basse / Sous la normale), sans `conhost.exe` (la
 * console du serveur, comptée sinon dans « N processus »). Que des nombres et des
 * noms fixes dans le script. Renvoie `ok;échecs;message`.
 */
function tuningScript(
  pid: number,
  priorityClass: string | null,
  mask: string | null,
): string {
  const setters = [
    priorityClass ? `$process.PriorityClass = '${priorityClass}'` : "",
    mask ? `$process.ProcessorAffinity = [IntPtr][long]${mask}` : "",
  ]
    .filter(Boolean)
    .join("; ");
  return [
    "$ErrorActionPreference = 'Stop'",
    `$ids = @(${pid}) + @(Get-CimInstance Win32_Process -Filter \"ParentProcessId=${pid} AND Name<>'conhost.exe'\" | ForEach-Object { $_.ProcessId })`,
    "$ok = 0; $failed = 0; $message = ''",
    `foreach ($id in $ids) { try { $process = Get-Process -Id $id; ${setters}; $ok++ } catch { $failed++; $message = $_.Exception.Message } }`,
    'Write-Output "$ok;$failed;$message"',
  ].join("\n");
}

function runPowerShell(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      "powershell",
      ["-NoProfile", "-NonInteractive", "-Command", script],
      { windowsHide: true, timeout: 20_000 },
      (error, stdout) => (error ? reject(error) : resolve(stdout.trim())),
    );
  });
}

/**
 * Applique la priorité et les cœurs du serveur (`Server.cpuPriority`,
 * `Server.cpuCores`) à son processus et à ses enfants directs. Rien avec les
 * réglages par défaut. Un échec (serveur lancé en admin, autre utilisateur)
 * est écrit dans ses logs, sans bloquer.
 */
async function applyProcessTuning(
  ctx: IpcContext,
  serverId: string,
  expectedPid: number,
  /** Processus déjà réglés : la ligne n'est réécrite que si un enfant s'ajoute. */
  alreadyTuned = 0,
): Promise<number> {
  const server = ctx.servers
    .list()
    .find((candidate) => candidate.id === serverId);
  if (!server || process.platform !== "win32") return 0;
  const priority = server.cpuPriority ?? "normal";
  const mask = affinityMask(server.cpuCores);
  if (priority === "normal" && mask === null) return 0;
  const manager = ctx.serverManagers.getOrCreate(serverId);
  // Arrêté ou relancé entre-temps : un autre processus, réglé par son démarrage.
  if (manager.getPid() !== expectedPid) return 0;

  try {
    const output = await runPowerShell(
      tuningScript(
        expectedPid,
        priority === "normal" ? null : PRIORITY_CLASS[priority],
        mask,
      ),
    );
    const [ok, failed, ...message] = output.split(";");
    const tuned = Number(ok);
    if (Number(failed) > 0 && tuned === 0) {
      manager.log(managerLine(lt().processTuningFailed(message.join(";"))));
      return 0;
    }
    if (tuned <= alreadyTuned) return tuned;
    manager.log(
      managerLine(
        lt().processTuningApplied(
          lt().cpuPriorityNames[priority],
          mask === null ? null : formatCoreList(server.cpuCores ?? []),
          tuned,
        ),
      ),
    );
    return tuned;
  } catch (error) {
    manager.log(
      managerLine(lt().processTuningFailed((error as Error).message)),
    );
    return 0;
  }
}

/**
 * Après un démarrage ou une adoption : tout de suite, puis 15 s plus tard
 * (le processus enfant n'existe pas encore au lancement, et un enfant déjà
 * créé ne prend pas les réglages appliqués ensuite à son parent).
 */
export function scheduleProcessTuning(ctx: IpcContext, serverId: string): void {
  const pid = ctx.serverManagers.getOrCreate(serverId).getPid();
  if (!pid) return;
  void applyProcessTuning(ctx, serverId, pid).then((tuned) =>
    setTimeout(
      () => void applyProcessTuning(ctx, serverId, pid, tuned),
      CHILD_DELAY_MS,
    ),
  );
}
