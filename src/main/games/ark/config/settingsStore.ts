import { join } from "path";
import type {
  ArkSettingChange,
  ArkSettingsState,
  ArkUnknownSetting,
} from "../../../../shared/types";
import {
  ARK_SETTINGS,
  ARK_SETTINGS_BY_ID,
  GAME_SECTION,
  GUS_SECTION,
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
  GENERAL_TAB_KEYS,
  LIST_EDITOR_KEYS,
  RAW_ONLY_LIST_KEYS,
} from "./listKeys";

type IniFileKind = "gus" | "game";

const FILE_PATHS: Record<IniFileKind, string> = {
  gus: GAME_USER_SETTINGS_REL_PATH,
  game: GAME_INI_REL_PATH,
};
const UNKNOWN_SECTIONS: Record<IniFileKind, string> = {
  gus: GUS_SECTION,
  game: GAME_SECTION,
};

const lower = (keys: string[]) => new Set(keys.map((key) => key.toLowerCase()));
const KNOWN_KEYS: Record<IniFileKind, Set<string>> = {
  gus: lower([
    ...ARK_SETTINGS.filter((setting) => setting.file === "gus").map(
      (setting) => setting.key,
    ),
    ...GENERAL_TAB_KEYS,
  ]),
  game: lower([
    ...ARK_SETTINGS.filter((setting) => setting.file === "game").map(
      (setting) => setting.key,
    ),
    ...LIST_EDITOR_KEYS,
    ...RAW_ONLY_LIST_KEYS,
  ]),
};
const KEY_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

const readFile = (serverPath: string, kind: IniFileKind): ArkIniFile =>
  readArkIni(join(serverPath, FILE_PATHS[kind]));

/**
 * Clés simples d'une section que le catalogue ne connaît pas (réglage ajouté
 * par une mise à jour du jeu, ou écrit à la main). Les clés répétées ou
 * indexées sont des listes : éditeur brut seulement.
 */
function unknownSettings(
  file: ArkIniFile,
  kind: IniFileKind,
): ArkUnknownSetting[] {
  const section = UNKNOWN_SECTIONS[kind];
  return file.doc.keys(section).flatMap((key) => {
    if (!KEY_NAME.test(key) || KNOWN_KEYS[kind].has(key.toLowerCase()))
      return [];
    if (file.doc.getAll(section, key).length > 1) return [];
    return [
      {
        id: `${kind}:${section}:${key}`,
        file: kind,
        key,
        value: file.doc.get(section, key) ?? "",
      },
    ];
  });
}

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
      ...unknownSettings(files.gus, "gus"),
      ...unknownSettings(files.game, "game"),
    ],
  };
}

/**
 * Réglage d'un changement : du catalogue, ou « autre » d'une section connue.
 * ⚠️ Un « autre » ne peut pas être une clé connue (réglage du catalogue sous
 * une autre casse, onglet Général, liste) : écrite en texte libre, elle
 * échapperait à sa validation ou effacerait une liste.
 */
function resolveSetting(id: unknown): ArkSettingDef {
  if (typeof id !== "string") throw new AppError("ARK_SETTING_UNKNOWN");
  const known = ARK_SETTINGS_BY_ID.get(id);
  if (known) return known;
  const [kind, ...rest] = id.split(":");
  const key = rest.pop() ?? "";
  const section = rest.join(":");
  const isOther =
    (kind === "gus" || kind === "game") &&
    section === UNKNOWN_SECTIONS[kind] &&
    KEY_NAME.test(key) &&
    !KNOWN_KEYS[kind].has(key.toLowerCase());
  if (!isOther) throw new AppError("ARK_SETTING_UNKNOWN", { key: id });
  return {
    key,
    file: kind,
    section,
    type: "string",
    default: "",
    group: "admin",
  };
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
