import type { IpcContext } from "../ipc/context";
import type { StopConfig } from "../server/ServerManager";
import { restartServer, startServer } from "../server/startServer";
import { isSteamLibraryInstall, STEAM_APP_IDS } from "../steamcmd/SteamCMD";
import { backupBeforeUpdate } from "../backup/serverBackup";
import { appErrorLogText } from "../utils/appError";
import { lt, managerLine } from "../i18n/logStrings";

interface PendingUpdate {
  installedBuild: string;
  latestBuild: string;
}

/** Config d'arrêt du serveur, avec l'annonce et le délai du redémarrage planifié. */
function stopConfigForRestart(ctx: IpcContext, serverId: string): StopConfig {
  const restart = ctx.getServerConfig(serverId).restart;
  return {
    ...ctx.getStopConfig(serverId),
    shutdownWaittime: restart.warningMinutes * 60,
    shutdownMessage: restart.message.replace(
      "{minutes}",
      String(restart.warningMinutes),
    ),
  };
}

/**
 * Mise à jour du jeu à installer, ou null : à jour, vérification impossible
 * (Steam injoignable — jamais lu comme « pas à jour », voir
 * `checkGameUpdateOnStart`) ou serveur que Nexum ne met pas à jour.
 */
async function findPendingUpdate(
  ctx: IpcContext,
  serverId: string,
  log: (line: string) => void,
): Promise<PendingUpdate | null> {
  const server = ctx.servers.list().find((s) => s.id === serverId);
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
 * rendu à écrire dans la session qui suit : les lignes écrites serveur arrêté
 * n'ont pas de session de log et la vue est vidée au démarrage.
 */
async function updateStoppedServer(
  ctx: IpcContext,
  serverId: string,
  update: PendingUpdate,
): Promise<string[]> {
  const report: string[] = [];
  try {
    await backupBeforeUpdate(ctx, serverId, (line) => report.push(line));
  } catch (e) {
    report.push(
      managerLine(
        lt().updateBackupFailed(appErrorLogText((e as Error).message)),
      ),
    );
    return report;
  }

  const server = ctx.servers.list().find((s) => s.id === serverId);
  if (!server) return report;
  // Progression affichée en direct (vidée au démarrage qui suit).
  const res = await ctx.steamcmd.installGame(
    server.gameType,
    server.path,
    (msg) => ctx.broadcastLog(serverId, msg),
  );
  report.push(
    res.success
      ? managerLine(
          lt().updatedByScheduledRestart(
            update.installedBuild,
            update.latestBuild,
          ),
        )
      : managerLine(
          lt().updateFailed(appErrorLogText(res.error ?? "SteamCMD")),
        ),
  );
  return report;
}

/**
 * Redémarrage planifié d'un serveur. Avec l'option « mettre à jour le jeu »
 * et une mise à jour disponible : arrêt (annonce comprise), sauvegarde du
 * monde, mise à jour SteamCMD, puis démarrage — sinon simple redémarrage,
 * par le même chemin que le bouton Redémarrer.
 */
export async function runScheduledRestart(
  ctx: IpcContext,
  serverId: string,
): Promise<void> {
  const mgr = ctx.serverManagers.getOrCreate(serverId);
  if (mgr.getStatus() !== "running") return;
  // Toujours un vrai callback de log : sans lui, la console restait figée
  // après un redémarrage planifié.
  const log = (line: string) => ctx.broadcastLog(serverId, line);
  const stopConfig = stopConfigForRestart(ctx, serverId);

  const update = ctx.getServerConfig(serverId).restart.updateGame
    ? await findPendingUpdate(ctx, serverId, (line) => mgr.log(line))
    : null;
  if (!update) {
    await restartServer(ctx, serverId, log, stopConfig);
    return;
  }

  mgr.log(
    managerLine(
      lt().scheduledRestartWithUpdate(
        update.installedBuild,
        update.latestBuild,
      ),
    ),
  );
  const stopped = await mgr.stop(stopConfig);
  if (!stopped.success) {
    mgr.log(
      managerLine(
        lt().updateCancelledNotStopped(appErrorLogText(stopped.error ?? "")),
      ),
    );
    return;
  }
  await new Promise((r) => setTimeout(r, 1500));

  const report = await updateStoppedServer(ctx, serverId, update);
  const res = await startServer(ctx, serverId, log);
  if (res.success) {
    report.forEach((line) => mgr.log(line));
  } else {
    [
      ...report,
      managerLine(
        lt().startFailedAfterUpdate(appErrorLogText(res.error ?? "")),
      ),
    ].forEach(log);
  }
}
