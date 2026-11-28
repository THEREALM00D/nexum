import { join } from "path";
import { ipcMain } from "electron/main";
import type { IpcContext } from "../../../ipc/context";
import type { ArkModsCleanup } from "../../../../shared/types";
import { appError } from "../../../utils/appError";
import { lt, managerLine } from "../../../i18n/logStrings";
import { splitArgsMods } from "../mods/argsMods";
import { readModLibrary } from "../mods/modLibrary";
import {
  folderSize,
  modSize,
  modsDir,
  readModFolders,
  removeModFolders,
  TEMP_FOLDER,
} from "../mods/modFolders";

type Result = { success: boolean; freed?: number; error?: string };

/**
 * Dossiers supprimables : mods ni dans la liste (désactivés compris) ni dans
 * un `-mods=` / `-passivemods=` des arguments perso, plus `.temp`.
 */
async function cleanupTargets(ctx: IpcContext, serverId: string) {
  const { mods, customArgs } = ctx.getArkConfig(serverId);
  const serverPath = ctx.getServerPath(serverId);
  const args = splitArgsMods(customArgs);
  const used = new Set([
    ...mods.map((mod) => mod.id),
    ...args.ids,
    ...args.passiveIds,
  ]);
  const library = readModLibrary(serverPath);
  const folders = await readModFolders(serverPath);
  const preview: ArkModsCleanup = { mods: [], tempSize: 0, total: 0 };
  const names: string[] = [];
  for (const [id, folderNames] of folders) {
    if (used.has(id)) continue;
    const size = await modSize(serverPath, folderNames);
    preview.mods.push({ id, name: library.get(id)?.name ?? "", size });
    names.push(...folderNames);
  }
  preview.tempSize = await folderSize(join(modsDir(serverPath), TEMP_FOLDER));
  if (preview.tempSize > 0) names.push(TEMP_FOLDER);
  preview.total =
    preview.tempSize + preview.mods.reduce((sum, mod) => sum + mod.size, 0);
  return { preview, names, serverPath };
}

/** Erreur du disque (fichier ouvert, droits) → code traduit. */
function cleanFailed(error: unknown): string {
  const fsError = error as NodeJS.ErrnoException;
  return appError("ARK_MODS_CLEAN_FAILED", {
    path: fsError?.path ?? "",
    detail: fsError?.code ?? String(error),
  });
}

// « Nettoyer le dossier des mods » de la page Mods. serverId explicite.
// Seulement les mods hors liste : CFCore supprime lui-même l'ancienne
// version d'un mod mis à jour (vérifié), et retélécharge un mod de la liste
// dont le dossier manque (`Missing module`, vérifié).
export function registerArkModsCleanupHandlers(ctx: IpcContext): void {
  ipcMain.handle(
    "ark:mods:cleanupPreview",
    async (_, serverId: string): Promise<ArkModsCleanup> =>
      (await cleanupTargets(ctx, serverId)).preview,
  );

  ipcMain.handle(
    "ark:mods:cleanup",
    async (_, serverId: string): Promise<Result> => {
      const manager = ctx.serverManagers.getOrCreate(serverId);
      const status = manager.getStatus();
      // Le serveur tient ses fichiers de mods ouverts et télécharge au démarrage.
      if (status !== "stopped" && status !== "crashed")
        return { success: false, error: appError("ARK_MODS_SERVER_RUNNING") };
      const { preview, names, serverPath } = await cleanupTargets(
        ctx,
        serverId,
      );
      try {
        await removeModFolders(serverPath, names);
      } catch (error) {
        return { success: false, error: cleanFailed(error) };
      }
      manager.logOutsideSession(
        [
          managerLine(
            lt().arkModsCleaned(
              preview.mods.length,
              preview.total / 1024 / 1024,
            ),
          ),
        ],
        (line) => ctx.broadcastLog(serverId, line),
      );
      return { success: true, freed: preview.total };
    },
  );
}
