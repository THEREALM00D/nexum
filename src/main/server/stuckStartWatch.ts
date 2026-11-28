import type { Server } from "../../shared/types";
import type { IpcContext } from "../ipc/context";
import { appErrorLogText } from "../utils/appError";
import { lt, managerLine } from "../i18n/logStrings";
import { isRestartPending } from "../scheduler/restartCountdown";
import { notifyStartFailed } from "./serverAlerts";
import { startServer } from "./startServer";
import { RESTART_DELAY_MS } from "./crashRestart";
import { MAX_RESTARTS, recordRestartAttempt } from "./restartAttempts";
import { reportWatchdogEvent } from "./watchdogEvents";

const TICK_MS = 30 * 1000;

/**
 * Serveur lancé dont la ligne « prêt » du jeu (`LaunchSpec.readyLine`) n'est
 * pas passée après `stuckStartMinutes` : tué puis relancé 10 s plus tard,
 * compté avec les relances après plantage (3 en 30 min, puis laissé arrêté).
 */
async function restartStuckServer(
  ctx: IpcContext,
  server: Server,
  minutes: number,
): Promise<void> {
  const manager = ctx.serverManagers.getOrCreate(server.id);
  const { attempt, gaveUp } = recordRestartAttempt(server.id);
  manager.log(
    managerLine(
      gaveUp
        ? lt().stuckStartGaveUp(minutes, MAX_RESTARTS)
        : lt().stuckStartKilled(minutes, attempt, MAX_RESTARTS),
    ),
  );
  await manager.kill();
  if (gaveUp) {
    reportWatchdogEvent(server, {
      kind: "stuckGaveUp",
      minutes,
      maxAttempts: MAX_RESTARTS,
    });
    return;
  }
  reportWatchdogEvent(server, {
    kind: "stuckStart",
    minutes,
    attempt,
    maxAttempts: MAX_RESTARTS,
  });

  setTimeout(async () => {
    // Entre-temps : démarré à la main, serveur supprimé ou option décochée.
    const current = ctx.servers
      .list()
      .find((candidate) => candidate.id === server.id);
    if (
      !current ||
      (current.stuckStartMinutes ?? 0) <= 0 ||
      manager.getStatus() !== "stopped"
    )
      return;
    const sendLog = (line: string) => ctx.broadcastLog(server.id, line);
    const result = await startServer(ctx, server.id, sendLog).catch(
      (error: Error) => ({ success: false, error: error.message }),
    );
    if (result.success) {
      // Dans la nouvelle session : « Voir les logs » dit pourquoi il a redémarré.
      manager.log(managerLine(lt().stuckStartRestarted(attempt, MAX_RESTARTS)));
      return;
    }
    const error = result.error ?? "";
    manager.logStartFailure(
      managerLine(lt().autoRestartFailed(appErrorLogText(error))),
      sendLog,
    );
    notifyStartFailed(current, "stuckRestart", error);
  }, RESTART_DELAY_MS);
}

/** Vérifie toutes les 30 s les serveurs qui ont l'option « démarrage bloqué ». */
export function startStuckStartWatch(ctx: IpcContext): void {
  // Un démarrage n'est traité qu'une fois (clé : serveur + heure du lancement).
  const handled = new Set<string>();
  setInterval(() => {
    const now = Date.now();
    for (const server of ctx.servers.list()) {
      const minutes = server.stuckStartMinutes ?? 0;
      if (minutes <= 0) continue;
      const manager = ctx.serverManagers.getOrCreate(server.id);
      if (manager.getStatus() !== "running") continue;
      const startup = manager.getStartup();
      if (!startup || startup.ready) continue;
      if (now - startup.startedAt < minutes * 60_000) continue;
      // Déjà pris par un redémarrage planifié ou une action groupée.
      if (isRestartPending(server.id)) continue;
      const key = `${server.id}:${startup.startedAt}`;
      if (handled.has(key)) continue;
      handled.add(key);
      void restartStuckServer(ctx, server, minutes).catch(() => {});
    }
  }, TICK_MS);
}
