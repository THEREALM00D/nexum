import { BrowserWindow } from "electron/main";
import type { IpcContext } from "../ipc/context";
import type { GameUpdateNotice } from "../../shared/types";
import { STEAM_APP_IDS } from "../steamcmd/SteamCMD";

/**
 * Vérifie, en arrière-plan, si le serveur qui vient de démarrer est à jour
 * (le jeu, pas Nexum) : un serveur en retard d'une version refuse les joueurs
 * qui ont mis leur jeu à jour.
 *
 * Ne bloque ni ne ralentit jamais le démarrage : appelée APRÈS `start()`, sans
 * être attendue. Si Steam ne répond pas ou si la version installée est
 * illisible, on ne dit rien (pas de fausse alerte). Le résultat va dans la
 * session de log (lisible même après un démarrage avec Windows, sans fenêtre)
 * et, si une mise à jour existe, au renderer qui affiche une notification.
 */
export async function checkGameUpdateOnStart(
  ctx: IpcContext,
  id: string,
): Promise<void> {
  // Sans SteamCMD (ex : serveur importé depuis la bibliothèque Steam),
  // impossible d'interroger Steam.
  if (!ctx.steamcmd.isInstalled()) return;

  const server = ctx.servers.list().find((s) => s.id === id);
  const gameType = server?.gameType ?? "palworld";
  const result = await ctx.steamcmd.checkForUpdate(
    ctx.getServerPath(id),
    STEAM_APP_IDS[gameType],
  );
  const mgr = ctx.serverManagers.getOrCreate(id);

  if (result.upToDate && result.installedBuild) {
    mgr.log(`[Manager] Serveur à jour (build ${result.installedBuild}).`);
    return;
  }
  // Échec de la vérification (Steam injoignable, manifest introuvable) :
  // requiredBuild reste null → on ne conclut rien.
  if (!result.installedBuild || !result.requiredBuild) return;

  mgr.log(
    `[Manager] Mise à jour du serveur disponible (build installé ${result.installedBuild}, dernier build ${result.requiredBuild}) : les joueurs qui ont mis le jeu à jour ne pourront pas se connecter. ` +
      (result.steamLibrary
        ? "Serveur installé via la bibliothèque Steam : mettez-le à jour depuis Steam."
        : "Mettez-le à jour depuis la page Installation de Nexum."),
  );

  const notice: GameUpdateNotice = {
    serverId: id,
    installedBuild: result.installedBuild,
    latestBuild: result.requiredBuild,
    steamLibrary: result.steamLibrary,
  };
  BrowserWindow.getAllWindows().forEach((w) =>
    w.webContents.send("server:gameUpdateAvailable", notice),
  );
}
