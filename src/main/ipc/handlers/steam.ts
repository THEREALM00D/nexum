import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";
import type { GameType } from "../../../shared/types";
import { STEAM_APP_IDS } from "../../steamcmd/SteamCMD";

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
        return { success: false, error: `Jeu inconnu : ${gameType}` };
      }
      ctx.setActiveServerPath(installPath);
      return ctx.steamcmd.installGame(gameType, installPath, (progress) => {
        event.sender.send("steamcmd:progress", progress);
      });
    },
  );

  // Mise à jour du serveur actif.
  ipcMain.handle("steamcmd:updateGame", async (event) => {
    const gameType = ctx.getActiveServer()?.gameType ?? "palworld";
    const installPath = ctx.getActiveServerPath();
    if (!installPath) {
      return { success: false, error: "Aucun chemin serveur configuré" };
    }
    return ctx.steamcmd.installGame(gameType, installPath, (progress) => {
      event.sender.send("steamcmd:progress", progress);
    });
  });

  ipcMain.handle("steamcmd:checkForUpdate", async () => {
    const installPath = ctx.getActiveServerPath();
    const gameType = ctx.getActiveServer()?.gameType ?? "palworld";
    return ctx.steamcmd.checkForUpdate(installPath, STEAM_APP_IDS[gameType]);
  });
}
