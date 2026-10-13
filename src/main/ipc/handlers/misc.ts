import { ipcMain, BrowserWindow, dialog } from "electron/main";
import { shell } from "electron";
import type { IpcContext } from "../context";
import {
  getLaunchAtLogin,
  setLaunchAtLogin,
} from "../../startup/launchAtLogin";

export function registerMiscHandlers(ctx: IpcContext): void {
  // Window controls
  ipcMain.handle("window:minimize", () => {
    BrowserWindow.getFocusedWindow()?.minimize();
  });
  ipcMain.handle("window:maximize", () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win?.isMaximized()) win.unmaximize();
    else win?.maximize();
  });
  ipcMain.handle("window:close", () => {
    BrowserWindow.getFocusedWindow()?.close();
  });

  // Dialog
  ipcMain.handle("dialog:selectFolder", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle(
    "dialog:selectFile",
    async (_, filters?: { name: string; extensions: string[] }[]) => {
      const result = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters,
      });
      return result.canceled ? null : result.filePaths[0];
    },
  );

  // Shell
  ipcMain.handle("shell:openPath", (_, path: string) => shell.openPath(path));
  ipcMain.handle("shell:showItemInFolder", (_, path: string) =>
    shell.showItemInFolder(path),
  );
  ipcMain.handle("shell:openExternal", (_, url: string) =>
    shell.openExternal(url),
  );

  // App
  ipcMain.handle("app:getVersion", () => ctx.app.getVersion());
  ipcMain.handle("app:getLaunchAtLogin", () => getLaunchAtLogin());
  // Fermer la fenêtre = rester dans la zone de notification (voir main/index.ts)
  ipcMain.handle("app:getCloseToTray", () =>
    ctx.store.get("closeToTray", true),
  );
  ipcMain.handle("app:setCloseToTray", (_, enabled: boolean) => {
    ctx.store.set("closeToTray", enabled);
    return enabled;
  });
  // Langue de l'UI, pour les textes du menu de l'icône (le main n'a pas i18n)
  ipcMain.handle("app:setLanguage", (_, lang: string) => {
    if (lang === "fr" || lang === "en") ctx.store.set("language", lang);
  });
  ipcMain.handle("app:setLaunchAtLogin", (_, enabled: boolean) =>
    setLaunchAtLogin(enabled),
  );

  // Persistent config (legacy compat : retourne/configure le serveur actif)
  ipcMain.handle("config:getServerPath", () => ctx.getActiveServerPath());
  ipcMain.handle("config:setServerPath", (_, path: string) => {
    ctx.setActiveServerPath(path);
  });

  // System monitoring — filtré sur le process du jeu du serveur actif
  // (chaque jeu a son propre nom d'exécutable, cf. PROCESS_NAME_PREFIXES).
  ipcMain.handle("monitor:getStats", () =>
    ctx.systemMonitor.getStats(ctx.getActiveServer()?.gameType ?? "palworld"),
  );
  ipcMain.handle("monitor:startPolling", (event) => {
    ctx.systemMonitor.startPolling(
      2000,
      (stats) => {
        event.sender.send("monitor:stats", stats);
      },
      () => ctx.getActiveServer()?.gameType ?? "palworld",
    );
  });
  ipcMain.handle("monitor:stopPolling", () => ctx.systemMonitor.stopPolling());
}
