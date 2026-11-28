import { join } from "path";
import { ipcMain } from "electron/main";
import type { IpcContext } from "../../../ipc/context";
import type { ArkModsCleanup } from "../../../../shared/types";
import { appError } from "../../../utils/appError";
import { lt, managerLine } from "../../../i18n/logStrings";
import { readModLibrary } from "../mods/modLibrary";
import { folderInUse, usedModIds } from "../mods/usedMods";
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
 * Dossiers supprimables : mods qu'aucun serveur du même dossier n'utilise
 * (`usedModIds` : listes, désactivés compris, arguments perso,
 * `TotalConversionMod`), plus `.temp`.
 */
async function cleanupTargets(ctx: IpcContext, serverId: string) {
  const serverPath = ctx.getServerPath(serverId);
  const used = usedModIds(ctx, serverId);
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

const failure = (code: "NO_SERVER_PATH" | "ARK_MODS_SERVER_RUNNING") => ({
  success: false,
  error: appError(code),
});

// « Nettoyer le dossier des mods » de la page Mods. serverId explicite.
// Seulement les mods hors liste : CFCore supprime lui-même l'ancienne
// version d'un mod mis à jour (vérifié), et retélécharge un mod de la liste
// dont le dossier manque (`Missing module`, vérifié).
export function registerArkModsCleanupHandlers(ctx: IpcContext): void {
  ipcMain.handle(
    "ark:mods:cleanupPreview",
    async (_, serverId: string): Promise<ArkModsCleanup> => {
      // Sans chemin (serveur supprimé), modsDir serait relatif au dossier
      // courant du processus.
      if (!ctx.getServerPath(serverId))
        return { mods: [], tempSize: 0, total: 0 };
      return (await cleanupTargets(ctx, serverId)).preview;
    },
  );

  ipcMain.handle(
    "ark:mods:cleanup",
    async (_, serverId: string): Promise<Result> => {
      if (!ctx.getServerPath(serverId)) return failure("NO_SERVER_PATH");
      // Un serveur du même dossier qui tourne tient ces fichiers ouverts et
      // télécharge dans `.temp` au démarrage.
      if (folderInUse(ctx, serverId)) return failure("ARK_MODS_SERVER_RUNNING");
      const { preview, names, serverPath } = await cleanupTargets(
        ctx,
        serverId,
      );
      // Revérifié : le calcul des tailles prend du temps, et un serveur
      // planté est relancé 10 s après (crashRestart.ts).
      if (folderInUse(ctx, serverId)) return failure("ARK_MODS_SERVER_RUNNING");
      try {
        await removeModFolders(serverPath, names);
      } catch (error) {
        return { success: false, error: cleanFailed(error) };
      }
      ctx.serverManagers
        .getOrCreate(serverId)
        .logOutsideSession(
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
