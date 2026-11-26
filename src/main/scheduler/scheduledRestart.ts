import type { IpcContext } from "../ipc/context";
import { restartServer, startServer } from "../server/startServer";
import {
  findPendingUpdate,
  updateStoppedServer,
  type PendingUpdate,
} from "../server/serverUpdate";
import { appErrorLogText } from "../utils/appError";
import { lt, managerLine } from "../i18n/logStrings";
import {
  runCountdown,
  withRestartLock,
  type Countdown,
} from "./restartCountdown";

/** Mise à jour tentée par un redémarrage : installée ou non. Null : aucune tentée. */
export type UpdateOutcome = "updated" | "failed" | null;

/**
 * Redémarrage planifié d'un serveur : annonces jusqu'à `stopAt`, puis
 * arrêt. Avec l'option « mettre à jour le jeu » (ou une mise à jour déjà
 * trouvée, `update`) : arrêt, sauvegarde du monde, mise à jour SteamCMD,
 * puis démarrage. Sinon simple redémarrage, par le même chemin que le
 * bouton Redémarrer. Un seul compte à rebours à la fois par serveur.
 */
export async function runScheduledRestart(
  ctx: IpcContext,
  serverId: string,
  countdown: Countdown,
  update?: PendingUpdate,
): Promise<UpdateOutcome> {
  const manager = ctx.serverManagers.getOrCreate(serverId);
  if (manager.getStatus() !== "running") return null;
  let outcome: UpdateOutcome = null;
  await withRestartLock(serverId, async () => {
    const pid = manager.getPid();
    const stopConfig = await runCountdown(ctx, serverId, countdown);
    if (!stopConfig) return;
    // Toujours un vrai callback de log : sans lui, la console restait figée
    // après un redémarrage planifié.
    const log = (line: string) => ctx.broadcastLog(serverId, line);
    const pendingUpdate =
      update ??
      (ctx.getServerConfig(serverId).restart.updateGame
        ? await findPendingUpdate(ctx, serverId, (line) => manager.log(line))
        : null);
    // Arrêté à la main pendant la vérification (jusqu'à 30 s) : un
    // redémarrage le relancerait.
    if (manager.getStatus() !== "running" || manager.getPid() !== pid) return;
    if (!pendingUpdate) {
      await restartServer(ctx, serverId, log, stopConfig);
      return;
    }

    outcome = "failed";
    manager.log(
      managerLine(
        lt().scheduledRestartWithUpdate(
          pendingUpdate.installedBuild,
          pendingUpdate.latestBuild,
        ),
      ),
    );
    const stopped = await manager.stop(stopConfig);
    if (!stopped.success) {
      manager.log(
        managerLine(
          lt().updateCancelledNotStopped(appErrorLogText(stopped.error ?? "")),
        ),
      );
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { report, updated } = await updateStoppedServer(
      ctx,
      serverId,
      pendingUpdate,
    );
    if (updated) outcome = "updated";
    const result = await startServer(ctx, serverId, log);
    if (result.success) {
      report.forEach((line) => manager.log(line));
    } else {
      [
        ...report,
        managerLine(
          lt().startFailedAfterUpdate(appErrorLogText(result.error ?? "")),
        ),
      ].forEach(log);
    }
  });
  return outcome;
}
