import { ipcMain, dialog, app } from "electron/main";
import { writeFile } from "fs/promises";
import { join } from "path";
import type {
  ServerArchiveImportChoice,
  SettingsImportChoice,
  TransferServerPaths,
} from "../../../shared/types";
import type { IpcContext } from "../context";
import {
  buildSettingsFile,
  importSettingsFile,
  previewSettingsFile,
} from "../../transfer/settingsTransfer";
import { writeServerArchive } from "../../transfer/serverArchive";
import {
  cancelServerImport,
  clearTransferTmp,
  importServerArchive,
  previewServerArchive,
  serverWorldConflict,
} from "../../transfer/serverArchiveImport";
import { dateStamp, safeFileName } from "../../transfer/transferFormat";

// « Enregistrer sous » natif, dossier Documents par défaut (comme l'export
// des logs). Renvoie le chemin choisi, ou null si annulé.
async function askSavePath(
  defaultName: string,
  filter: { name: string; extensions: string[] },
): Promise<string | null> {
  const result = await dialog.showSaveDialog({
    defaultPath: join(app.getPath("documents"), defaultName),
    filters: [filter],
  });
  return result.canceled || !result.filePath ? null : result.filePath;
}

/** Changer de PC : export / import des réglages et d'un serveur (src/main/transfer/). */
export function registerTransferHandlers(ctx: IpcContext): void {
  // Extraction d'un import abandonné (Nexum fermé pendant le dialogue)
  clearTransferTmp(ctx);

  ipcMain.handle(
    "transfer:exportSettings",
    async (_, includePasswords: boolean) => {
      const out = await askSavePath(`nexum-settings-${dateStamp()}.json`, {
        name: "JSON",
        extensions: ["json"],
      });
      if (!out) return null;
      await writeFile(out, await buildSettingsFile(ctx, includePasswords));
      return out;
    },
  );
  ipcMain.handle("transfer:previewSettings", (_, filePath: string) =>
    previewSettingsFile(filePath),
  );
  ipcMain.handle("transfer:importSettings", (_, choice: SettingsImportChoice) =>
    importSettingsFile(ctx, choice),
  );

  ipcMain.handle(
    "transfer:exportServer",
    async (_, serverId: string, includePasswords: boolean) => {
      const name = ctx.servers.list().find((s) => s.id === serverId)?.name;
      const out = await askSavePath(
        `${safeFileName(name ?? "")}-${dateStamp()}.nexum-server.zip`,
        { name: "ZIP", extensions: ["zip"] },
      );
      if (!out) return null;
      await writeServerArchive(ctx, serverId, includePasswords, out);
      return out;
    },
  );
  ipcMain.handle("transfer:previewServer", (_, zipPath: string) =>
    previewServerArchive(ctx, zipPath),
  );
  ipcMain.handle(
    "transfer:serverWorldConflict",
    (_, token: string, paths: TransferServerPaths) =>
      serverWorldConflict(ctx, token, paths),
  );
  ipcMain.handle(
    "transfer:importServer",
    (_, choice: ServerArchiveImportChoice) => importServerArchive(ctx, choice),
  );
  ipcMain.handle("transfer:cancelServerImport", (_, token: string) =>
    cancelServerImport(ctx, token),
  );
}
