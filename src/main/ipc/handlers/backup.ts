import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";
import type { BackupConfig } from "../../../shared/types";
import { getGameSavePath } from "../../games/registry";
import { backupBeforeUpdate, backupServer } from "../../backup/serverBackup";
import { AppError } from "../../utils/appError";

export function registerBackupHandlers(ctx: IpcContext): void {
  ipcMain.handle("backup:getConfig", (): BackupConfig => {
    const cfg = ctx.getServerConfig().backup;
    return { ...cfg, backupDir: ctx.getBackupDir() };
  });

  ipcMain.handle("backup:setConfig", (_, cfg: BackupConfig) => {
    ctx.updateServerConfig(undefined, { backup: cfg });
    ctx.applyBackupScheduler();
  });

  ipcMain.handle("backup:list", () => ctx.backup.list(ctx.getBackupDir()));

  ipcMain.handle("backup:create", () => {
    const server = ctx.getActiveServer();
    if (!server) throw new AppError("NO_SERVER_PATH");
    return backupServer(ctx, server.id);
  });

  // Avant une mise à jour des mods (le renderer sait seul si une
  // installation est une mise à jour). null = rien à sauvegarder.
  ipcMain.handle("backup:beforeUpdate", (_, serverId?: string) => {
    const id = serverId ?? ctx.getActiveServer()?.id;
    if (!id) return null;
    const mgr = ctx.serverManagers.getOrCreate(id);
    return backupBeforeUpdate(ctx, id, (line) => mgr.log(line));
  });

  ipcMain.handle("backup:restore", async (_, backupPath: string) => {
    const serverPath = ctx.getActiveServerPath();
    if (!serverPath) throw new Error("Aucun chemin serveur configuré");
    if (ctx.serverManagers.getActive()?.getStatus() === "running") {
      throw new Error("Arrêtez le serveur avant de restaurer une sauvegarde");
    }
    const server = ctx.getActiveServer();
    const saveDir = server
      ? getGameSavePath(server.gameType, serverPath, ctx.getServerConfig())
      : undefined;
    await ctx.backup.restore(serverPath, backupPath, saveDir);
  });

  ipcMain.handle("backup:delete", (_, backupPath: string) => {
    ctx.backup.delete(backupPath);
  });
}
