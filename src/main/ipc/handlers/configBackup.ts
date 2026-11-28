import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";
import type {
  ConfigBackupEntry,
  ConfigBackupSettings,
  ConfigFileDiff,
} from "../../../shared/types";
import { appError, AppError } from "../../utils/appError";
import { onBeforeConfigWrite } from "../../utils/ini";
import { configBackupQuietly } from "../../backup/config/configBackupQuietly";
import {
  createConfigBackup,
  deleteConfigBackup,
  listConfigBackups,
} from "../../backup/config/configBackups";
import { configTargets } from "../../backup/config/configSnapshot";
import { diffConfigBackup } from "../../backup/config/configDiff";
import {
  restoreConfigBackup,
  serversOwningConfig,
} from "../../backup/config/configRestore";

type Result = { success: boolean; id?: string | null; error?: string };

/** Une seule copie par enregistrement (ARK écrit GameUserSettings.ini puis Game.ini). */
const SAVE_GROUP_MS = 5000;

/** Erreur codée telle quelle, erreur du disque → CONFIG_BACKUP_FAILED. */
function failure(error: unknown): Result {
  if (error instanceof AppError)
    return { success: false, error: error.message };
  const fsError = error as NodeJS.ErrnoException;
  return {
    success: false,
    error: appError("CONFIG_BACKUP_FAILED", {
      path: fsError?.path ?? "",
      detail: fsError?.code ?? String(error),
    }),
  };
}

// Onglet Configuration de la page Sauvegardes (tous les jeux). serverId explicite.
export function registerConfigBackupHandlers(ctx: IpcContext): void {
  // « Avant chaque enregistrement » : toute écriture de config de Nexum passe
  // par backupBeforeWrite, qui prévient ici.
  const lastSaveBackup = new Map<string, number>();
  onBeforeConfigWrite((filePath) => {
    for (const serverId of serversOwningConfig(ctx, filePath)) {
      if (!ctx.getServerConfig(serverId).configBackup.beforeSave) continue;
      const last = lastSaveBackup.get(serverId) ?? 0;
      if (Date.now() - last < SAVE_GROUP_MS) continue;
      lastSaveBackup.set(serverId, Date.now());
      configBackupQuietly(ctx, serverId, "beforeSave");
    }
  });

  ipcMain.handle(
    "configBackup:getConfig",
    (_, serverId: string): ConfigBackupSettings =>
      ctx.getServerConfig(serverId).configBackup,
  );
  ipcMain.handle(
    "configBackup:setConfig",
    (_, serverId: string, settings: ConfigBackupSettings) =>
      ctx.updateServerConfig(serverId, { configBackup: settings }).configBackup,
  );
  // Fichiers sauvegardés pour ce jeu (aide de la carte Réglages).
  ipcMain.handle("configBackup:files", (_, serverId: string): string[] =>
    configTargets(ctx, serverId).map((target) =>
      target.isDirectory ? `${target.key}/` : target.key,
    ),
  );
  ipcMain.handle(
    "configBackup:list",
    (_, serverId: string): ConfigBackupEntry[] =>
      listConfigBackups(ctx, serverId),
  );
  ipcMain.handle("configBackup:create", (_, serverId: string): Result => {
    try {
      return { success: true, id: createConfigBackup(ctx, serverId, "manual") };
    } catch (error) {
      return failure(error);
    }
  });
  ipcMain.handle(
    "configBackup:restore",
    (_, serverId: string, id: unknown): Result => {
      try {
        restoreConfigBackup(ctx, serverId, id);
        return { success: true };
      } catch (error) {
        return failure(error);
      }
    },
  );
  ipcMain.handle(
    "configBackup:delete",
    (_, serverId: string, id: unknown): Result => {
      try {
        deleteConfigBackup(ctx, serverId, id);
        return { success: true };
      } catch (error) {
        return failure(error);
      }
    },
  );
  ipcMain.handle(
    "configBackup:diff",
    (_, serverId: string, id: unknown): ConfigFileDiff[] =>
      diffConfigBackup(ctx, serverId, id),
  );
}
