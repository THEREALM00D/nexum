import { join } from "path";
import type {
  ArkSettingChange,
  ArkSettingsState,
} from "../../../../shared/types";
import {
  ARK_SETTINGS,
  ARK_SETTINGS_BY_ID,
  arkSettingId,
  type ArkSettingDef,
} from "../../../../shared/arkSettings";
import { AppError } from "../../../utils/appError";
import {
  GAME_INI_REL_PATH,
  GAME_USER_SETTINGS_REL_PATH,
} from "../gameUserSettingsIni";
import { readArkIni, writeArkIni, type ArkIniFile } from "./arkIniFile";
import { normalizeSettingValue } from "./settingValue";
import {
  otherSettingDef,
  otherSettings,
  type IniFileKind,
} from "./otherSettings";

const FILE_PATHS: Record<IniFileKind, string> = {
  gus: GAME_USER_SETTINGS_REL_PATH,
  game: GAME_INI_REL_PATH,
};

const readFile = (serverPath: string, kind: IniFileKind): ArkIniFile =>
  readArkIni(join(serverPath, FILE_PATHS[kind]));

/** Valeurs écrites des réglages du catalogue, et réglages inconnus des fichiers. */
export function readArkSettings(
  serverPath: string,
  launchOptions: Record<string, string>,
): ArkSettingsState {
  const files = {
    gus: readFile(serverPath, "gus"),
    game: readFile(serverPath, "game"),
  };
  const values: Record<string, string> = {};
  for (const setting of ARK_SETTINGS) {
    const value =
      setting.file === "cli"
        ? launchOptions[setting.key]
        : files[setting.file].doc.get(setting.section, setting.key);
    if (value !== undefined) values[arkSettingId(setting)] = value;
  }
  return {
    values,
    unknown: [
      ...otherSettings(files.gus, "gus"),
      ...otherSettings(files.game, "game"),
    ],
  };
}

/** Réglage d'un changement : du catalogue, ou « autre » (otherSettings.ts). */
function resolveSetting(id: unknown): ArkSettingDef {
  if (typeof id !== "string") throw new AppError("ARK_SETTING_UNKNOWN");
  const setting = ARK_SETTINGS_BY_ID.get(id) ?? otherSettingDef(id);
  if (!setting) throw new AppError("ARK_SETTING_UNKNOWN", { key: id });
  return setting;
}

/**
 * Applique les changements (null = retirer, le jeu reprend sa valeur par
 * défaut) aux fichiers, copie `.backup` avant chaque écriture. Tout est
 * validé avant d'écrire quoi que ce soit. Renvoie les nouvelles options de
 * lancement (arkConfig.launchOptions).
 */
export function writeArkSettings(
  serverPath: string,
  changes: ArkSettingChange[],
  launchOptions: Record<string, string>,
): Record<string, string> {
  if (!Array.isArray(changes)) throw new AppError("ARK_SETTING_UNKNOWN");
  const prepared = changes.map((change) => {
    const setting = resolveSetting(change?.id);
    if (change.value !== null && typeof change.value !== "string") {
      throw new AppError("ARK_SETTING_INVALID", {
        key: setting.key,
        value: String(change.value),
      });
    }
    const value =
      change.value === null
        ? null
        : normalizeSettingValue(setting, change.value);
    // Option sans valeur décochée = absente de la ligne de commande.
    const removed =
      value === null || (setting.type === "flag" && value === "False");
    return { setting, value: removed ? null : value };
  });

  const nextOptions = { ...launchOptions };
  const touched = new Map<IniFileKind, ArkIniFile>();
  for (const { setting, value } of prepared) {
    if (setting.file === "cli") {
      if (value === null) delete nextOptions[setting.key];
      else nextOptions[setting.key] = value;
      continue;
    }
    const file =
      touched.get(setting.file) ?? readFile(serverPath, setting.file);
    touched.set(setting.file, file);
    if (value === null) file.doc.remove(setting.section, setting.key);
    else file.doc.set(setting.section, setting.key, value);
  }
  for (const [kind, file] of touched) {
    writeArkIni(join(serverPath, FILE_PATHS[kind]), file);
  }
  return nextOptions;
}
