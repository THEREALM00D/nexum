import type { IpcContext } from "../ipc/context";
import { warningsUpTo } from "../../shared/restartSchedule";
import { lt, managerLine } from "../i18n/logStrings";
import { findPendingUpdate } from "../server/serverUpdate";
import { runScheduledRestart } from "./scheduledRestart";
import { isRestartPending } from "./restartCountdown";

/**
 * Build dont l'installation a échoué, par serveur (sauvegarde ou SteamCMD en
 * échec) : pas de nouvel essai automatique pour lui, sinon chaque
 * vérification relançait annonces, arrêt et redémarrage sur l'ancienne
 * version. Un autre build, ou le redémarrage de Nexum, rouvre l'essai.
 */
const failedBuilds = new Map<string, string>();

/**
 * Vérification de la version du jeu pendant que le serveur tourne
 * (`RestartConfig.checkUpdates`, toutes les `checkUpdatesHours`). Rien
 * n'est écrit quand le jeu est à jour, ni pour une install de la
 * bibliothèque Steam ou sans SteamCMD : sinon une ligne par vérification.
 * Mise à jour trouvée : annonces pendant `updateWarningMinutes`, puis arrêt,
 * sauvegarde, mise à jour et démarrage (`runScheduledRestart`).
 */
export async function checkUpdateWhileRunning(
  ctx: IpcContext,
  serverId: string,
): Promise<void> {
  const manager = ctx.serverManagers.getOrCreate(serverId);
  const ready = () =>
    manager.getStatus() === "running" &&
    ctx.getServerConfig(serverId).restart.checkUpdates &&
    !isRestartPending(serverId);
  if (!ready()) return;
  const update = await findPendingUpdate(ctx, serverId, () => {});
  if (!update || !ready()) return;
  if (failedBuilds.get(serverId) === update.latestBuild) return;

  const { restart } = ctx.getServerConfig(serverId);
  const minutes = restart.updateWarningMinutes;
  manager.log(
    managerLine(
      lt().updateFoundWhileRunning(
        update.installedBuild,
        update.latestBuild,
        minutes,
      ),
    ),
  );
  // Non attendu : la file des vérifications (une à la fois) ne doit pas
  // rester bloquée pendant le compte à rebours de ce serveur.
  runScheduledRestart(
    ctx,
    serverId,
    {
      stopAt: Date.now() + minutes * 60_000,
      warnings: warningsUpTo(restart.warnings, minutes),
      kind: "update",
      stillWanted: () => ctx.getServerConfig(serverId).restart.checkUpdates,
    },
    update,
  )
    .then((outcome) => {
      if (outcome === "updated") failedBuilds.delete(serverId);
      if (outcome !== "failed") return;
      failedBuilds.set(serverId, update.latestBuild);
      // Écrit après le redémarrage : dans la nouvelle session.
      manager.log(managerLine(lt().updateRetryPaused(update.latestBuild)));
    })
    .catch(() => {});
}
