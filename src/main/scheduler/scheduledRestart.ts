import type { IpcContext } from "../ipc/context";
import { restartServer, startServer } from "../server/startServer";
import { isSteamLibraryInstall, STEAM_APP_IDS } from "../steamcmd/SteamCMD";
import { backupBeforeUpdate } from "../backup/serverBackup";
import { appErrorLogText } from "../utils/appError";
import { lt, managerLine } from "../i18n/logStrings";
import {
  runCountdown,
  withRestartLock,
  type Countdown,
} from "./restartCountdown";

export interface PendingUpdate {
  installedBuild: string;
  latestBuild: string;
}

/**
 * Mise à jour du jeu à installer, ou null : à jour, vérification impossible
 * (Steam injoignable — jamais lu comme « pas à jour », voir
 * `checkGameUpdateOnStart`) ou serveur que Nexum ne met pas à jour.
 */
export async function findPendingUpdate(
  ctx: IpcContext,
  serverId: string,
  log: (line: string) => void,
): Promise<PendingUpdate | null> {
  const server = ctx.servers
    .list()
    .find((candidate) => candidate.id === serverId);
  if (!server?.path) return null;
  if (isSteamLibraryInstall(server.path)) {
    log(managerLine(lt().autoUpdateSkippedSteam));
    return null;
  }
  if (!ctx.steamcmd.isInstalled()) {
    log(managerLine(lt().autoUpdateSkippedNoSteamCmd));
    return null;
  }
  const result = await ctx.steamcmd.checkForUpdate(
    server.path,
    STEAM_APP_IDS[server.gameType],
  );
  if (!result.installedBuild || !result.requiredBuild) {
    if (result.upToDate) log(managerLine(lt().gameUpToDateRestart));
    return null;
  }
  return {
    installedBuild: result.installedBuild,
    latestBuild: result.requiredBuild,
  };
}

/**
 * Sauvegarde puis mise à jour SteamCMD, serveur arrêté. Renvoie le compte
 * rendu à écrire dans la session qui suit (les lignes écrites serveur arrêté
 * n'ont pas de session de log et la vue est vidée au démarrage) et si le
 * jeu a bien été mis à jour.
 */
async function updateStoppedServer(
  ctx: IpcContext,
  serverId: string,
  update: PendingUpdate,
): Promise<{ report: string[]; updated: boolean }> {
  const report: string[] = [];
  try {
    await backupBeforeUpdate(ctx, serverId, (line) => report.push(line));
  } catch (error) {
    report.push(
      managerLine(
        lt().updateBackupFailed(appErrorLogText((error as Error).message)),
      ),
    );
    return { report, updated: false };
  }

  const server = ctx.servers
    .list()
    .find((candidate) => candidate.id === serverId);
  if (!server) return { report, updated: false };
  // Progression affichée en direct (vidée au démarrage qui suit).
  const result = await ctx.steamcmd.installGame(
    server.gameType,
    server.path,
    (line) => ctx.broadcastLog(serverId, line),
  );
  report.push(
    result.success
      ? managerLine(
          lt().updatedByScheduledRestart(
            update.installedBuild,
            update.latestBuild,
          ),
        )
      : managerLine(
          lt().updateFailed(appErrorLogText(result.error ?? "SteamCMD")),
        ),
  );
  return { report, updated: result.success };
}

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
