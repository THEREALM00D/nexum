import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";
import { STEAM_APP_IDS } from "../../steamcmd/SteamCMD";

export function registerSteamHandlers(ctx: IpcContext): void {
  ipcMain.handle("steamcmd:isInstalled", () => ctx.steamcmd.isInstalled());

  ipcMain.handle("steamcmd:install", async (event) => {
    return ctx.steamcmd.install((progress) => {
      event.sender.send("steamcmd:progress", progress);
    });
  });

  ipcMain.handle(
    "steamcmd:installPalworld",
    async (event, installPath: string) => {
      ctx.setActiveServerPath(installPath);
      return ctx.steamcmd.installPalworld(installPath, (progress) => {
        event.sender.send("steamcmd:progress", progress);
      });
    },
  );

  ipcMain.handle("steamcmd:updatePalworld", async (event) => {
    const installPath = ctx.getActiveServerPath();
    return ctx.steamcmd.installPalworld(installPath, (progress) => {
      event.sender.send("steamcmd:progress", progress);
    });
  });

  ipcMain.handle(
    "steamcmd:installValheim",
    async (event, installPath: string) => {
      ctx.setActiveServerPath(installPath);
      return ctx.steamcmd.installValheim(installPath, (progress) => {
        event.sender.send("steamcmd:progress", progress);
      });
    },
  );

  ipcMain.handle("steamcmd:updateValheim", async (event) => {
    const installPath = ctx.getActiveServerPath();
    return ctx.steamcmd.installValheim(installPath, (progress) => {
      event.sender.send("steamcmd:progress", progress);
    });
  });

  ipcMain.handle(
    "steamcmd:installAstroneer",
    async (event, installPath: string) => {
      ctx.setActiveServerPath(installPath);
      return ctx.steamcmd.installAstroneer(installPath, (progress) => {
        event.sender.send("steamcmd:progress", progress);
      });
    },
  );

  ipcMain.handle("steamcmd:updateAstroneer", async (event) => {
    const installPath = ctx.getActiveServerPath();
    return ctx.steamcmd.installAstroneer(installPath, (progress) => {
      event.sender.send("steamcmd:progress", progress);
    });
  });

  ipcMain.handle("steamcmd:checkForUpdate", async () => {
    const installPath = ctx.getActiveServerPath();
    const gameType = ctx.getActiveServer()?.gameType ?? "palworld";
    return ctx.steamcmd.checkForUpdate(installPath, STEAM_APP_IDS[gameType]);
  });
}
