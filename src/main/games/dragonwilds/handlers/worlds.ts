import { existsSync, readdirSync } from "fs";
import { ipcMain } from "electron/main";
import type { IpcContext } from "../../../ipc/context";
import {
  readDedicatedServerIni,
  writeDedicatedServerIni,
} from "../dedicatedServerIni";
import {
  SOLO_SAVES_DIR,
  importWorldToServer,
  listWorlds,
  serverSavesDir,
} from "../worlds";
import { AppError } from "../../../utils/appError";

function requireStopped(ctx: IpcContext): string {
  const serverPath = ctx.getActiveServerPath();
  if (!serverPath) throw new AppError("NO_SERVER_PATH");
  const status = ctx.serverManagers.getActive()?.getStatus() ?? "stopped";
  if (status !== "stopped" && status !== "crashed") {
    throw new AppError("STOP_BEFORE_WORLD_CHANGE");
  }
  return serverPath;
}

export function registerDragonwildsWorldHandlers(ctx: IpcContext): void {
  ipcMain.handle("dragonwilds:listWorlds", () => {
    const serverPath = ctx.getActiveServerPath();
    return {
      // Monde chargé au prochain démarrage : celui dont le nom inscrit dans
      // la sauvegarde vaut DefaultWorldName.
      current: serverPath
        ? readDedicatedServerIni(serverPath).DefaultWorldName
        : "",
      server: serverPath ? listWorlds(serverSavesDir(serverPath)) : [],
      solo: listWorlds(SOLO_SAVES_DIR),
      soloDir: SOLO_SAVES_DIR,
    };
  });

  // Charger un monde déjà présent dans le dossier du serveur (par le nom
  // inscrit dans sa sauvegarde, celui que le serveur cherche).
  ipcMain.handle("dragonwilds:useWorld", (_, worldName: string) => {
    const serverPath = requireStopped(ctx);
    const known = listWorlds(serverSavesDir(serverPath)).some(
      (w) => w.worldName === worldName,
    );
    if (!known) throw new AppError("WORLD_NOT_FOUND", { name: worldName });
    writeDedicatedServerIni(serverPath, { DefaultWorldName: worldName });
  });

  // Importer un monde (solo ou d'un autre PC) : sauvegarde ZIP des mondes du
  // serveur d'abord, puis copie et sélection du monde importé.
  ipcMain.handle("dragonwilds:importWorld", async (_, sourcePath: string) => {
    const serverPath = requireStopped(ctx);
    const savesDir = serverSavesDir(serverPath);
    if (existsSync(savesDir) && readdirSync(savesDir).length > 0) {
      const dir = ctx.getBackupDir();
      await ctx.backup.create(serverPath, dir, savesDir);
      ctx.backup.rotate(dir, ctx.getServerConfig().backup.backupKeep);
    }
    const worldName = importWorldToServer(sourcePath, serverPath);
    writeDedicatedServerIni(serverPath, { DefaultWorldName: worldName });
    return worldName;
  });
}
