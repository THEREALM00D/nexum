import { join } from "path";
import { ipcMain } from "electron/main";
import type { IpcContext } from "../../../ipc/context";
import type {
  ArkGameLists,
  ArkListName,
  ArkSettingChange,
  ArkSettingsState,
} from "../../../../shared/types";
import { appError } from "../../../utils/appError";
import { readIniText, writeIniText } from "../../../utils/iniText";
import { backupBeforeWrite } from "../../../utils/ini";
import {
  GAME_INI_REL_PATH,
  GAME_USER_SETTINGS_REL_PATH,
} from "../gameUserSettingsIni";
import { readArkSettings, writeArkSettings } from "../config/settingsStore";
import { readGameLists, writeGameList } from "../config/lists/gameLists";

type Result = { success: boolean; error?: string };
type RawFile = "gus" | "game";

const RAW_PATHS: Record<RawFile, string> = {
  gus: GAME_USER_SETTINGS_REL_PATH,
  game: GAME_INI_REL_PATH,
};

// Onglets Réglages de jeu et Fichiers bruts de la page Config ARK. Toujours
// un serverId explicite. ⚠️ Le serveur réécrit GameUserSettings.ini ET
// Game.ini à l'arrêt avec ce qu'il a lu au démarrage (vérifié) : écriture
// refusée tant qu'il tourne.
export function registerArkSettingsHandlers(ctx: IpcContext): void {
  const lockedError = (serverId: string): string | null => {
    const status = ctx.serverManagers.getOrCreate(serverId).getStatus();
    return status === "stopped" || status === "crashed"
      ? null
      : appError("CONFIG_LOCKED");
  };

  ipcMain.handle("ark:settings:read", (_, serverId: string): ArkSettingsState =>
    readArkSettings(
      ctx.getServerPath(serverId),
      ctx.getArkConfig(serverId).launchOptions,
    ),
  );

  ipcMain.handle(
    "ark:settings:write",
    (_, serverId: string, changes: ArkSettingChange[]): Result => {
      const locked = lockedError(serverId);
      if (locked) return { success: false, error: locked };
      try {
        const launchOptions = writeArkSettings(
          ctx.getServerPath(serverId),
          Array.isArray(changes) ? changes : [],
          ctx.getArkConfig(serverId).launchOptions,
        );
        ctx.updateArkConfig(serverId, { launchOptions });
        return { success: true };
      } catch (error) {
        return { success: false, error: String((error as Error).message) };
      }
    },
  );

  ipcMain.handle("ark:lists:read", (_, serverId: string): ArkGameLists =>
    readGameLists(ctx.getServerPath(serverId)),
  );

  ipcMain.handle(
    "ark:lists:write",
    (_, serverId: string, list: ArkListName, data: unknown): Result => {
      const locked = lockedError(serverId);
      if (locked) return { success: false, error: locked };
      try {
        writeGameList(ctx.getServerPath(serverId), list, data);
        return { success: true };
      } catch (error) {
        return { success: false, error: String((error as Error).message) };
      }
    },
  );

  ipcMain.handle(
    "ark:rawIni:read",
    (_, serverId: string, file: RawFile): string => {
      if (!(file in RAW_PATHS)) return "";
      const path = join(ctx.getServerPath(serverId), RAW_PATHS[file]);
      return readIniText(path)?.text ?? "";
    },
  );

  // Texte écrit tel quel (encodage et fins de ligne du fichier gardés),
  // après une copie `.backup`.
  ipcMain.handle(
    "ark:rawIni:write",
    (_, serverId: string, file: RawFile, text: string): Result => {
      const locked = lockedError(serverId);
      if (locked) return { success: false, error: locked };
      if (!(file in RAW_PATHS) || typeof text !== "string") {
        return {
          success: false,
          error: appError("ARK_SETTING_UNKNOWN", { key: String(file) }),
        };
      }
      const path = join(ctx.getServerPath(serverId), RAW_PATHS[file]);
      const current = readIniText(path);
      backupBeforeWrite(path);
      writeIniText(path, text, current ?? { encoding: "utf8", eol: "\r\n" });
      return { success: true };
    },
  );
}
