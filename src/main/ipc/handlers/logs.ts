import { ipcMain, dialog, app } from "electron/main";
import { shell } from "electron";
import { mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import { basename, join } from "path";
import type { IpcContext } from "../context";

export function registerLogsHandlers(ctx: IpcContext): void {
  const resolveId = (id: string | undefined): string => {
    const resolved = id ?? ctx.getActiveServer()?.id;
    if (!resolved) throw new Error("Aucun serveur actif configuré");
    return resolved;
  };

  // Sessions conservées sur disque (une par démarrage), plus récentes d'abord.
  ipcMain.handle("logs:listSessions", (_, serverId?: string) =>
    ctx.sessionLogs.list(resolveId(serverId)),
  );

  ipcMain.handle("logs:readSession", (_, name: string, serverId?: string) =>
    ctx.sessionLogs.read(resolveId(serverId), name),
  );

  ipcMain.handle("logs:openDir", async (_, serverId?: string) => {
    const dir = ctx.sessionLogs.dir(resolveId(serverId));
    mkdirSync(dir, { recursive: true });
    await shell.openPath(dir);
  });

  // Export du log (page Logs) : « Enregistrer sous » natif, dossier
  // Documents par défaut. Renvoie le chemin écrit, ou null si annulé.
  ipcMain.handle(
    "logs:saveToFile",
    async (_, content: string, defaultName: string) => {
      const result = await dialog.showSaveDialog({
        defaultPath: join(app.getPath("documents"), basename(defaultName)),
        filters: [{ name: "Text", extensions: ["txt"] }],
      });
      if (result.canceled || !result.filePath) return null;
      await writeFile(result.filePath, content, "utf-8");
      return result.filePath;
    },
  );
}
