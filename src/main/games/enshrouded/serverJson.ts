import { join } from "path";
import type {
  EnshroudedGameSettingValue,
  EnshroudedSettings,
  EnshroudedUserGroup,
} from "../../../shared/types";
import { backupBeforeWrite } from "../../utils/ini";
import { readIniText, writeIniText, type IniFormat } from "../../utils/iniText";
import { AppError } from "../../utils/appError";
import {
  DEFAULT_GAME_SETTINGS,
  DEFAULT_SETTINGS,
  DURATION_KEYS,
  NS_PER_MINUTE,
  TOP_LEVEL_KEYS,
} from "./defaults";

export { DEFAULT_SETTINGS };

export const SERVER_JSON = "enshrouded_server.json";

type Json = Record<string, unknown>;

// Format du fichier écrit par le serveur : UTF-8 sans BOM, LF, tabulations.
const NEW_FORMAT: IniFormat = { encoding: "utf8", eol: "\n" };
const NEW_INDENT = "\t";

const jsonPath = (serverPath: string) => join(serverPath, SERVER_JSON);

interface ServerJson {
  data: Json;
  format: IniFormat;
  indent: string;
}

/** Indentation du fichier (celle de la 1re ligne indentée), tabulation sinon. */
function detectIndent(text: string): string {
  return text.match(/^[ \t]+(?=\S)/m)?.[0] ?? NEW_INDENT;
}

/**
 * Contenu d'enshrouded_server.json, ou null s'il n'existe pas encore (le
 * serveur le crée à son premier lancement). Un JSON illisible lève
 * ENSHROUDED_CONFIG_INVALID : le serveur refuserait de démarrer.
 */
export function readServerJson(serverPath: string): ServerJson | null {
  const file = readIniText(jsonPath(serverPath));
  if (!file) return null;
  try {
    const data = JSON.parse(file.text) as unknown;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("not an object");
    }
    return {
      data: data as Json,
      format: file,
      indent: detectIndent(file.text),
    };
  } catch (err) {
    throw new AppError("ENSHROUDED_CONFIG_INVALID", {
      detail: (err as Error).message,
    });
  }
}

/**
 * Réécrit le fichier à partir de l'objet lu puis modifié : les clés que
 * Nexum ne gère pas (ajoutées à chaque mise à jour du jeu) restent en place,
 * dans le même ordre. Sauvegarde `.backup` avant.
 */
function writeServerJson(
  serverPath: string,
  file: ServerJson | null,
  data: Json,
) {
  const path = jsonPath(serverPath);
  backupBeforeWrite(path);
  const text = JSON.stringify(data, null, file?.indent ?? NEW_INDENT) + "\n";
  writeIniText(path, text, file?.format ?? NEW_FORMAT);
}

const asObject = (v: unknown): Json =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : {};

/** Clés éditées par la page Config (durées en minutes). */
export function readSettings(
  serverPath: string,
): Omit<EnshroudedSettings, "customArgs"> {
  const data = readServerJson(serverPath)?.data ?? {};
  const settings = { ...DEFAULT_SETTINGS } as Record<string, unknown>;
  for (const key of TOP_LEVEL_KEYS) {
    if (data[key] !== undefined) settings[key] = data[key];
  }
  // Toutes les clés de gameSettings, connues ou non : renvoyées telles
  // quelles à l'enregistrement.
  const gameSettings = { ...DEFAULT_GAME_SETTINGS };
  for (const [key, value] of Object.entries(asObject(data.gameSettings))) {
    gameSettings[key] =
      DURATION_KEYS.has(key) && typeof value === "number"
        ? value / NS_PER_MINUTE
        : (value as EnshroudedGameSettingValue);
  }
  settings.gameSettings = gameSettings;
  return settings as Omit<EnshroudedSettings, "customArgs">;
}

export function writeSettings(
  serverPath: string,
  settings: Omit<EnshroudedSettings, "customArgs">,
): void {
  const file = readServerJson(serverPath);
  const data: Json = { ...(file?.data ?? {}) };
  for (const key of TOP_LEVEL_KEYS) data[key] = settings[key];
  const gameSettings: Json = { ...asObject(data.gameSettings) };
  for (const [key, value] of Object.entries(settings.gameSettings)) {
    gameSettings[key] =
      DURATION_KEYS.has(key) && typeof value === "number"
        ? Math.round(value * NS_PER_MINUTE)
        : value;
  }
  data.gameSettings = gameSettings;
  writeServerJson(serverPath, file, data);
}

const GROUP_DEFAULTS: Omit<EnshroudedUserGroup, "name" | "password"> = {
  canKickBan: false,
  canAccessInventories: false,
  canEditWorld: false,
  canEditBase: false,
  canExtendBase: false,
  reservedSlots: 0,
};

export function readUserGroups(serverPath: string): EnshroudedUserGroup[] {
  const data = readServerJson(serverPath)?.data ?? {};
  const groups = Array.isArray(data.userGroups) ? data.userGroups : [];
  return groups.map((g) => {
    const group = asObject(g);
    return {
      ...GROUP_DEFAULTS,
      ...group,
      name: String(group.name ?? ""),
      password: String(group.password ?? ""),
    } as EnshroudedUserGroup;
  });
}

/**
 * Remplace la liste des groupes. Les champs inconnus d'un groupe (ajoutés
 * par une mise à jour du jeu) sont repris du groupe de même nom ; un groupe
 * renommé les perd.
 */
export function writeUserGroups(
  serverPath: string,
  groups: EnshroudedUserGroup[],
): void {
  const file = readServerJson(serverPath);
  const data: Json = { ...(file?.data ?? {}) };
  const previous = (Array.isArray(data.userGroups) ? data.userGroups : []).map(
    asObject,
  );
  data.userGroups = groups.map((g) => ({
    ...previous.find((p) => p.name === g.name),
    ...g,
  }));
  writeServerJson(serverPath, file, data);
}
