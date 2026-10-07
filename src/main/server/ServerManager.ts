import { spawn, ChildProcess, exec } from "child_process";
import { join } from "path";
import { existsSync } from "fs";
import si from "systeminformation";
import { PalworldApiClient } from "../games/palworld/PalworldApiClient";
import { sendCtrlC } from "./windowsCtrlC";
import type { ServerStatus } from "../../shared/types";
import type { SessionLogSink } from "../logs/SessionLogStore";

export interface StopConfig {
  restApiEnabled?: boolean;
  restApiPort?: number;
  adminPassword?: string;
  shutdownWaittime?: number;
  shutdownMessage?: string;
  /**
   * Pas d'API REST pour ce jeu, mais un arrêt propre reste possible via un
   * signal CTRL+C émulé (recommandé par le manuel officiel Valheim) plutôt
   * qu'un taskkill direct, qui risque de corrompre la sauvegarde en cours.
   */
  gracefulSignal?: boolean;
}

// Délai accordé au process pour sauvegarder et quitter après un CTRL+C émulé
// avant de basculer sur un arrêt forcé.
const GRACEFUL_SIGNAL_TIMEOUT_MS = 30_000;

// Masque la valeur qui suit -password avant d'afficher les args dans les
// logs (utile pour diagnostiquer ce qui est réellement envoyé au process).
function redactArgs(args: string[]): string[] {
  return args.map((arg, i) => (args[i - 1] === "-password" ? "[hidden]" : arg));
}

export class ServerManager {
  private process: ChildProcess | null = null;
  private adoptedPid: number | null = null;
  private adoptedPollInterval: NodeJS.Timeout | null = null;
  private status: ServerStatus = "stopped";
  private autoRestart = false;
  private restartCount = 0;
  private readonly maxRestarts = 5;
  private onLog: (line: string) => void = () => {};

  /**
   * `sessionLog` : fichier de log persistant, un par session (démarrage →
   * arrêt). Optionnel pour ne pas imposer le disque aux usages sans fichier.
   */
  constructor(private sessionLog?: SessionLogSink) {}

  /** Écrit une ligne dans la console du serveur ET dans son fichier de session. */
  log(line: string): void {
    this.onLog(line);
  }

  /** Ouvre une nouvelle session de log et renvoie le logger à utiliser. */
  private beginSession(onLog: (line: string) => void): (line: string) => void {
    this.sessionLog?.begin();
    const log = (line: string) => {
      this.sessionLog?.line(line);
      onLog(line);
    };
    this.onLog = log;
    return log;
  }

  private endSession(crashed: boolean): void {
    this.sessionLog?.end(crashed);
  }

  private getRunningPid(): number | null {
    return this.process?.pid ?? this.adoptedPid ?? null;
  }

  async tryAdopt(
    onLog: (line: string) => void,
    processNamePrefix = "palserver",
  ): Promise<boolean> {
    if (this.process || this.adoptedPid) return false;
    try {
      const procs = await si.processes();
      const proc = procs.list.find((p) =>
        p.name.toLowerCase().startsWith(processNamePrefix),
      );
      if (!proc) return false;

      this.adoptedPid = proc.pid;
      this.status = "running";
      const log = this.beginSession(onLog);
      log(`[Manager] Processus existant détecté (PID ${proc.pid}).`);
      log(
        "[Manager] Serveur lancé avant l'ouverture de Nexum : sa sortie n'est pas récupérable, seules les lignes de Nexum sont enregistrées pour cette session.",
      );
      this.startAdoptedPoll();
      return true;
    } catch {
      return false;
    }
  }

  private startAdoptedPoll(): void {
    if (this.adoptedPollInterval) clearInterval(this.adoptedPollInterval);
    this.adoptedPollInterval = setInterval(async () => {
      if (!this.adoptedPid) return;
      try {
        const procs = await si.processes();
        const alive = procs.list.some((p) => p.pid === this.adoptedPid);
        if (!alive) {
          this.onLog(
            `[Manager] Processus adopté (PID ${this.adoptedPid}) disparu.`,
          );
          this.adoptedPid = null;
          this.status = this.status === "stopping" ? "stopped" : "crashed";
          this.stopAdoptedPoll();
          this.endSession(this.status === "crashed");
        }
      } catch {
        // ignore
      }
    }, 5000);
  }

  private stopAdoptedPoll(): void {
    if (this.adoptedPollInterval) {
      clearInterval(this.adoptedPollInterval);
      this.adoptedPollInterval = null;
    }
  }

  private async waitForPidExit(
    pid: number,
    timeoutMs: number,
  ): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const procs = await si.processes();
        if (!procs.list.some((p) => p.pid === pid)) return true;
      } catch {
        // ignore
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return false;
  }

  async start(
    serverPath: string,
    exeName: string,
    args: string[],
    onLog: (line: string) => void,
    env: Record<string, string> = {},
  ): Promise<{ success: boolean; error?: string }> {
    if (this.status === "running" || this.status === "starting") {
      return { success: false, error: "Server is already running" };
    }

    const exe = join(serverPath, exeName);
    if (!existsSync(exe)) {
      return { success: false, error: `${exeName} not found at: ${exe}` };
    }

    this.status = "starting";
    // Nouvelle session à chaque démarrage (manuel, planifié, relance auto) :
    // un fichier neuf, et la vue de l'app repart de zéro.
    const log = this.beginSession(onLog);
    log(`[Manager] Starting server (${exeName})...`);
    log(`[Manager] Args: ${redactArgs(args).join(" ")}`);

    try {
      this.process = spawn(exe, args, {
        cwd: serverPath,
        detached: false,
        env: { ...process.env, ...env },
        stdio: ["ignore", "pipe", "pipe"],
      });

      this.process.on("spawn", () => {
        if (this.status === "starting") this.status = "running";
        log("[Manager] Processus démarré.");
      });

      this.process.stdout?.on("data", (data: Buffer) => {
        const lines = data.toString().split("\n").filter(Boolean);
        lines.forEach((line) => log(line));
      });

      this.process.stderr?.on("data", (data: Buffer) => {
        const lines = data.toString().split("\n").filter(Boolean);
        lines.forEach((line) => log(`[ERR] ${line}`));
      });

      this.process.on("close", (code) => {
        const wasRunning = this.status === "running";
        // Si on était en train d'arrêter volontairement, on passe à 'stopped' quel que soit le code
        this.status =
          this.status === "stopping"
            ? "stopped"
            : code === 0
              ? "stopped"
              : "crashed";
        this.process = null;
        log(`[Manager] Server exited with code ${code}`);
        this.endSession(this.status === "crashed");

        if (
          wasRunning &&
          this.autoRestart &&
          this.restartCount < this.maxRestarts
        ) {
          this.restartCount++;
          // Écrit dans la console seulement : la session plantée est déjà
          // close, la relance ouvre la sienne.
          onLog(
            `[Manager] Auto-restarting... (attempt ${this.restartCount}/${this.maxRestarts})`,
          );
          setTimeout(
            () => this.start(serverPath, exeName, args, onLog, env),
            5000,
          );
        }
      });

      this.process.on("error", (err) => {
        this.status = "crashed";
        this.process = null;
        log(`[Manager] Process error: ${err.message}`);
        this.endSession(true);
      });

      return { success: true };
    } catch (err) {
      this.status = "crashed";
      this.endSession(true);
      return { success: false, error: String(err) };
    }
  }

  private async stopViaApi(
    client: PalworldApiClient,
    waittime: number,
    message: string,
  ): Promise<boolean> {
    try {
      if (message) {
        await client.announce(message);
        this.onLog(`[Manager] Annonce envoyée: ${message}`);
      }
      this.onLog("[Manager] Sauvegarde en cours...");
      await client.save();
      this.onLog("[Manager] Sauvegarde terminée.");
      await client.shutdown(waittime, "");
      this.onLog(`[Manager] Shutdown API envoyé (attente ${waittime}s).`);
      return true;
    } catch (err) {
      this.onLog(`[Manager] API indisponible: ${(err as Error).message}`);
      return false;
    }
  }

  private forceKill(pid: number): void {
    if (process.platform === "win32") {
      exec(`taskkill /F /T /PID ${pid}`, (err) => {
        if (err) {
          try {
            this.process?.kill("SIGKILL");
          } catch {}
        }
      });
    } else {
      try {
        process.kill(pid, "SIGKILL");
      } catch {}
    }
  }

  private async isPidAlive(pid: number): Promise<boolean> {
    try {
      const procs = await si.processes();
      return procs.list.some((p) => p.pid === pid);
    } catch {
      return true;
    }
  }

  /**
   * Si le process tourne toujours après le délai d'attente accordé, force
   * l'arrêt via taskkill au lieu de rapporter un faux succès qui laisserait
   * le statut bloqué sur "stopping" indéfiniment.
   */
  private async ensureStopped(pid: number): Promise<boolean> {
    if (!(await this.isPidAlive(pid))) return true;
    this.onLog(
      "[Manager] Le processus ne répond pas, arrêt forcé via taskkill...",
    );
    this.forceKill(pid);
    const timeoutMs = 6000;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (!(await this.isPidAlive(pid))) break;
      await new Promise((r) => setTimeout(r, 500));
    }
    const alive = await this.isPidAlive(pid);
    if (!alive) {
      this.adoptedPid = null;
      this.process = null;
      this.status = "stopped";
      this.stopAdoptedPoll();
      this.endSession(false);
    }
    return !alive;
  }

  async stop(cfg?: StopConfig): Promise<{ success: boolean; error?: string }> {
    const pid = this.getRunningPid();
    if (!pid || this.status === "stopped") {
      return { success: false, error: "Server is not running" };
    }

    this.autoRestart = false;
    this.status = "stopping";
    const adopted = !this.process && this.adoptedPid !== null;
    // Processus lancé par nous : sa fin est connue de façon fiable (événement
    // `close` / exitCode). Ne JAMAIS repasser par la liste des processus dans
    // ce cas : si.processes() peut échouer ou être en retard (appels
    // concurrents du monitoring), ce qui faisait croire à un serveur bloqué et
    // lançait un taskkill /F /T sur un PID déjà terminé — voire réattribué
    // par Windows à un autre programme.
    const child = this.process;
    const childExited = () =>
      child !== null && (child.exitCode !== null || child.signalCode !== null);

    const waitForExit = (timeoutMs: number): Promise<void> => {
      if (child) {
        if (childExited()) return Promise.resolve();
        return new Promise((resolve) => {
          let done = false;
          const finish = () => {
            if (!done) {
              done = true;
              resolve();
            }
          };
          child.once("close", finish);
          setTimeout(finish, timeoutMs);
        });
      }
      return this.waitForPidExit(pid, timeoutMs).then((exited) => {
        if (exited) {
          this.adoptedPid = null;
          this.status = "stopped";
          this.stopAdoptedPoll();
          this.endSession(false);
        }
      });
    };

    const finalize = async (): Promise<{
      success: boolean;
      error?: string;
    }> => {
      if (childExited()) {
        this.status = "stopped";
        return { success: true };
      }
      const stopped = await this.ensureStopped(pid);
      return stopped
        ? { success: true }
        : { success: false, error: "Le serveur ne répond pas à l'arrêt" };
    };

    if (cfg?.restApiEnabled && cfg.restApiPort && cfg.adminPassword) {
      const client = new PalworldApiClient(cfg.restApiPort, cfg.adminPassword);
      const waittime = cfg.shutdownWaittime ?? 0;
      const message = cfg.shutdownMessage ?? "";
      const apiOk = await this.stopViaApi(client, waittime, message);

      if (apiOk && waittime > 0) {
        this.onLog(`[Manager] Attente arrêt gracieux (${waittime}s)...`);
        await waitForExit((waittime + 10) * 1000);
        return finalize();
      }

      if (!apiOk) {
        this.onLog("[Manager] Arrêt forcé via taskkill...");
        this.forceKill(pid);
        await waitForExit(6000);
        return finalize();
      }
    }

    if (cfg?.gracefulSignal && process.platform === "win32") {
      this.onLog("[Manager] Envoi d'un arrêt propre (CTRL+C)...");
      await sendCtrlC(pid);
      await waitForExit(GRACEFUL_SIGNAL_TIMEOUT_MS);
      return finalize();
    }

    this.onLog(
      adopted
        ? "[Manager] Arrêt du processus adopté..."
        : "[Manager] Arrêt du serveur...",
    );
    this.forceKill(pid);
    await waitForExit(6000);
    return finalize();
  }

  async restart(
    serverPath: string,
    exeName: string,
    args: string[],
    onLog: (line: string) => void,
    cfg?: StopConfig,
    env: Record<string, string> = {},
  ): Promise<{ success: boolean; error?: string }> {
    if (this.getRunningPid()) {
      await this.stop(cfg);
      await new Promise((r) => setTimeout(r, 1500));
    }
    this.restartCount = 0;
    return this.start(serverPath, exeName, args, onLog, env);
  }

  getStatus(): ServerStatus {
    return this.status;
  }

  setAutoRestart(enabled: boolean): void {
    this.autoRestart = enabled;
    this.restartCount = 0;
  }
}
