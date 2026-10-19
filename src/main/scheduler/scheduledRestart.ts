import type { IpcContext } from "../ipc/context";
import type { StopConfig } from "../server/ServerManager";
import { restartServer, startServer } from "../server/startServer";
import { isSteamLibraryInstall, STEAM_APP_IDS } from "../steamcmd/SteamCMD";
import { backupBeforeUpdate } from "../backup/serverBackup";
import { appErrorLogText } from "../utils/appError";

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
    log(
      "[Manager] Mise à jour automatique ignorée : serveur installé via la bibliothèque Steam, c'est Steam qui le met à jour.",
    );
    return null;
  }
  if (!ctx.steamcmd.isInstalled()) {
    log(
      "[Manager] Mise à jour automatique ignorée : SteamCMD n'est pas installé.",
    );
    return null;
  }
  const result = await ctx.steamcmd.checkForUpdate(
    server.path,
    STEAM_APP_IDS[server.gameType],
  );
  if (!result.installedBuild || !result.requiredBuild) {
    if (result.upToDate) log("[Manager] Jeu à jour : simple redémarrage.");
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
      `[Manager] Mise à jour du jeu annulée, la sauvegarde a échoué : ${appErrorLogText((e as Error).message)}. Le serveur a redémarré sur la version installée.`,
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
      ? `[Manager] Jeu mis à jour par le redémarrage planifié (build ${update.installedBuild} → ${update.latestBuild}).`
      : `[Manager] Échec de la mise à jour du jeu (${res.error ?? "SteamCMD"}) : le serveur a redémarré sur la version installée.`,
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
    `[Manager] Redémarrage planifié avec mise à jour du jeu (build ${update.installedBuild} → ${update.latestBuild}).`,
  );
  const stopped = await mgr.stop(stopConfig);
  if (!stopped.success) {
    mgr.log(
      `[Manager] Mise à jour annulée, le serveur ne s'est pas arrêté : ${stopped.error ?? ""}`,
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
      `[Manager] Démarrage impossible après la mise à jour : ${appErrorLogText(res.error ?? "")}`,
    ].forEach(log);
  }
}
