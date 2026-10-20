import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";
import type { GameType } from "../../../shared/types";
import { STEAM_APP_IDS } from "../../steamcmd/SteamCMD";
import { backupBeforeUpdate } from "../../backup/serverBackup";
import { appError } from "../../utils/appError";

/**
 * Sauvegarde le monde du serveur actif avant de lancer SteamCMD (rien pour
 * une première installation). Renvoie l'erreur à afficher si la sauvegarde
 * échoue : la mise à jour n'est alors pas lancée.
 */
async function backupActiveServer(
  ctx: IpcContext,
  onProgress: (msg: string) => void,
): Promise<string | null> {
  const server = ctx.getActiveServer();
  if (!server) return null;
  try {
    await backupBeforeUpdate(ctx, server.id, onProgress);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

export function registerSteamHandlers(ctx: IpcContext): void {
  ipcMain.handle("steamcmd:isInstalled", () => ctx.steamcmd.isInstalled());

  ipcMain.handle("steamcmd:install", async (event) => {
    return ctx.steamcmd.install((progress) => {
      event.sender.send("steamcmd:progress", progress);
    });
  });

  // Un seul canal pour tous les jeux (avant : un par jeu, et un renderer qui
  // retombait sans bruit sur Palworld pour un jeu oublié).
  ipcMain.handle(
    "steamcmd:installGame",
    async (event, gameType: GameType, installPath: string) => {
      if (!(gameType in STEAM_APP_IDS)) {
        return {
          success: false,
          error: appError("UNKNOWN_GAME", { game: String(gameType) }),
        };
      }
      ctx.setActiveServerPath(installPath);
      const onProgress = (msg: string) =>
        event.sender.send("steamcmd:progress", msg);
      // Dossier qui contient déjà le serveur : c'est une mise à jour.
      const backupError = await backupActiveServer(ctx, onProgress);
      if (backupError) return { success: false, error: backupError };
      return ctx.steamcmd.installGame(gameType, installPath, onProgress);
    },
  );

  // Mise à jour du serveur actif.
  ipcMain.handle("steamcmd:updateGame", async (event) => {
    const gameType = ctx.getActiveServer()?.gameType ?? "palworld";
    const installPath = ctx.getActiveServerPath();
    if (!installPath) {
      return { success: false, error: appError("NO_SERVER_PATH") };
    }
    const onProgress = (msg: string) =>
      event.sender.send("steamcmd:progress", msg);
    const backupError = await backupActiveServer(ctx, onProgress);
    if (backupError) return { success: false, error: backupError };
    return ctx.steamcmd.installGame(gameType, installPath, onProgress);
  });

  ipcMain.handle("steamcmd:checkForUpdate", async () => {
    const installPath = ctx.getActiveServerPath();
    const gameType = ctx.getActiveServer()?.gameType ?? "palworld";
    return ctx.steamcmd.checkForUpdate(installPath, STEAM_APP_IDS[gameType]);
  });
}
