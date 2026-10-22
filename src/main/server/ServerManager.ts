import { spawn, ChildProcess, exec } from "child_process";
import { join } from "path";
import { existsSync } from "fs";
import { PalworldApiClient } from "../games/palworld/PalworldApiClient";
import { sendCtrlC } from "./windowsCtrlC";
import { LogFileTailer } from "../logs/LogFileTailer";
import type { LaunchSpec } from "../games/registry";
import type { ServerStatus } from "../../shared/types";
import type { SessionLogSink } from "../logs/SessionLogStore";
import { appError, appErrorLogText } from "../utils/appError";
import { exitText, lt, managerLine } from "../i18n/logStrings";

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

// Teste l'existence d'un PID sans lancer de processus : le signal 0 ne tue
// rien. EPERM = le process existe mais appartient à un autre utilisateur ou
// tourne en admin. Avant : si.processes(), soit un PowerShell (~1,5 s de CPU)
// à chaque vérification, toutes les 5 s pour un serveur adopté.
function pidExists(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return (err as NodeJS.ErrnoException).code === "EPERM";
  }
}

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
  private onLog: (line: string) => void = () => {};
  private tailer: LogFileTailer | null = null;

  /**
   * `sessionLog` : fichier de log persistant, un par session (démarrage →
   * arrêt). Optionnel pour ne pas imposer le disque aux usages sans fichier.
   * `onCrash` : appelé quand le serveur s'arrête seul avec une erreur (lancé
   * ou adopté), session déjà close. La relance éventuelle est décidée
   * ailleurs (`server/crashRestart.ts`) pour repasser par `startServer`.
   */
  constructor(
    private sessionLog?: SessionLogSink,
    private onCrash?: () => void,
  ) {}

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
    this.stopTailer();
    this.sessionLog?.end(crashed);
  }

  /** Suivi du fichier de log du jeu (`LaunchSpec.logFile`), à la place de stdout. */
  private startTailer(
    logFile: string | undefined,
    log: (line: string) => void,
  ): void {
    this.stopTailer();
    if (!logFile) return;
    this.tailer = new LogFileTailer(logFile, log);
    this.tailer.start();
  }

  private stopTailer(): void {
    this.tailer?.stop();
    this.tailer = null;
  }

  private getRunningPid(): number | null {
    return this.process?.pid ?? this.adoptedPid ?? null;
  }

  /** PID du processus racine du serveur (lancé ou adopté), null s'il ne tourne pas. */
  getPid(): number | null {
    return this.getRunningPid();
  }

  /**
   * Reprend un serveur lancé avant l'ouverture de Nexum. Le processus a été
   * identifié par `ServerManagerRegistry.tryAdoptAll` (nom ET dossier du
   * serveur) : avant, ce scan était refait ici sur le nom seul et adoptait le
   * premier processus venu (client du jeu, serveur d'un autre dossier).
   */
  adopt(pid: number, onLog: (line: string) => void, logFile?: string): boolean {
    if (this.process || this.adoptedPid) return false;
    this.adoptedPid = pid;
    this.status = "running";
    const log = this.beginSession(onLog);
    log(managerLine(lt().adoptedDetected(pid)));
    log(
      logFile
        ? managerLine(lt().adoptedWithLogFile)
        : managerLine(lt().adoptedNoOutput),
    );
    this.startTailer(logFile, log);
    this.startAdoptedPoll();
    return true;
  }

  private startAdoptedPoll(): void {
    if (this.adoptedPollInterval) clearInterval(this.adoptedPollInterval);
    this.adoptedPollInterval = setInterval(() => {
      if (!this.adoptedPid || pidExists(this.adoptedPid)) return;
      this.onLog(managerLine(lt().adoptedGone(this.adoptedPid)));
      this.adoptedPid = null;
      this.status = this.status === "stopping" ? "stopped" : "crashed";
      this.stopAdoptedPoll();
      this.endSession(this.status === "crashed");
      if (this.status === "crashed") this.onCrash?.();
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
      if (!pidExists(pid)) return true;
      await new Promise((r) => setTimeout(r, 500));
    }
    return false;
  }

  async start(
    serverPath: string,
    spec: LaunchSpec,
    onLog: (line: string) => void,
  ): Promise<{ success: boolean; error?: string }> {
    const { exeName, args, env, logFile } = spec;
    if (this.status === "running" || this.status === "starting") {
      return { success: false, error: appError("SERVER_ALREADY_RUNNING") };
    }

    const exe = join(serverPath, exeName);
    if (!existsSync(exe)) {
      return {
        success: false,
        error: appError("SERVER_EXE_NOT_FOUND", {
          exe: exeName,
          path: serverPath,
        }),
      };
    }
    try {
      const refused = spec.prepare?.();
      if (refused) return { success: false, error: refused };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }

    this.status = "starting";
    // Nouvelle session à chaque démarrage (manuel, planifié, relance auto) :
    // un fichier neuf, et la vue de l'app repart de zéro.
    const log = this.beginSession(onLog);
    log(managerLine(lt().starting(exeName)));
    log(managerLine(lt().args(redactArgs(args).join(" "))));

    try {
      this.process = spawn(exe, args, {
        cwd: serverPath,
        detached: false,
        env: { ...process.env, ...env },
        stdio: ["ignore", "pipe", "pipe"],
      });

      this.process.on("spawn", () => {
        if (this.status === "starting") this.status = "running";
        log(managerLine(lt().processStarted));
      });

      // Avec un fichier de log suivi, stdout (incomplet) est lu mais ignoré :
      // un pipe jamais vidé finirait par bloquer le serveur.
      this.startTailer(logFile, log);
      this.process.stdout?.on("data", (data: Buffer) => {
        if (logFile) return;
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
        this.stopTailer(); // dernières lignes du jeu avant celle de Nexum
        const crashed = this.status === "crashed";
        log(managerLine(exitText(code, crashed)));
        this.endSession(crashed);
        if (wasRunning && crashed) this.onCrash?.();
      });

      this.process.on("error", (err) => {
        this.status = "crashed";
        this.process = null;
        log(managerLine(lt().processError(err.message)));
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
        this.onLog(managerLine(lt().announceSent(message)));
      }
      this.onLog(managerLine(lt().saving));
      await client.save();
      this.onLog(managerLine(lt().saved));
      await client.shutdown(waittime, "");
      this.onLog(managerLine(lt().shutdownSent(waittime)));
      return true;
    } catch (err) {
      this.onLog(
        managerLine(
          lt().apiUnavailable(appErrorLogText((err as Error).message)),
        ),
      );
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

  /**
   * Si le process tourne toujours après le délai d'attente accordé, force
   * l'arrêt via taskkill au lieu de rapporter un faux succès qui laisserait
   * le statut bloqué sur "stopping" indéfiniment.
   */
  private async ensureStopped(pid: number): Promise<boolean> {
    if (!pidExists(pid)) return true;
    this.onLog(managerLine(lt().notResponding));
    this.forceKill(pid);
    const timeoutMs = 6000;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (!pidExists(pid)) break;
      await new Promise((r) => setTimeout(r, 500));
    }
    const alive = pidExists(pid);
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
      return { success: false, error: appError("SERVER_NOT_RUNNING") };
    }

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
        : { success: false, error: appError("SERVER_STOP_TIMEOUT") };
    };

    if (cfg?.restApiEnabled && cfg.restApiPort && cfg.adminPassword) {
      const client = new PalworldApiClient(cfg.restApiPort, cfg.adminPassword);
      const waittime = cfg.shutdownWaittime ?? 0;
      const message = cfg.shutdownMessage ?? "";
      const apiOk = await this.stopViaApi(client, waittime, message);

      if (apiOk && waittime > 0) {
        this.onLog(managerLine(lt().waitingGraceful(waittime)));
        await waitForExit((waittime + 10) * 1000);
        return finalize();
      }

      if (!apiOk) {
        this.onLog(managerLine(lt().forceKill));
        this.forceKill(pid);
        await waitForExit(6000);
        return finalize();
      }
    }

    if (cfg?.gracefulSignal && process.platform === "win32") {
      this.onLog(managerLine(lt().ctrlC));
      await sendCtrlC(pid);
      await waitForExit(GRACEFUL_SIGNAL_TIMEOUT_MS);
      return finalize();
    }

    this.onLog(
      adopted ? managerLine(lt().stoppingAdopted) : managerLine(lt().stopping),
    );
    this.forceKill(pid);
    await waitForExit(6000);
    return finalize();
  }

  async restart(
    serverPath: string,
    spec: LaunchSpec,
    onLog: (line: string) => void,
    cfg?: StopConfig,
  ): Promise<{ success: boolean; error?: string }> {
    if (this.getRunningPid()) {
      await this.stop(cfg);
      await new Promise((r) => setTimeout(r, 1500));
    }
    return this.start(serverPath, spec, onLog);
  }

  getStatus(): ServerStatus {
    return this.status;
  }
}
