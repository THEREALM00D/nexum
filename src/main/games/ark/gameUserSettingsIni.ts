import { join } from "path";
import { backupBeforeWrite } from "../../utils/ini";
import {
  patchIniSection,
  readIniSection,
  readIniText,
  writeIniText,
  type IniFormat,
} from "../../utils/iniText";

export const GAME_USER_SETTINGS_REL_PATH = join(
  "ShooterGame",
  "Saved",
  "Config",
  "WindowsServer",
  "GameUserSettings.ini",
);
export const GAME_INI_REL_PATH = join(
  "ShooterGame",
  "Saved",
  "Config",
  "WindowsServer",
  "Game.ini",
);

// Clés éditées par Nexum, par section. MaxPlayers n'en fait pas partie : le
// serveur le réécrit au démarrage d'après -WinLiveMaxPlayers (vérifié), et
// sa section [/Script/Engine.GameSession] est écrite en double. RCONPort est
// recopié par le serveur depuis ?RCONPort : Nexum l'écrit aussi pour que le
// fichier dise le vrai port avant le premier démarrage.
const SECTION_KEYS = {
  ServerSettings: [
    "ServerPassword",
    "ServerAdminPassword",
    "ServerPVE",
    "RCONEnabled",
    "RCONPort",
  ],
  SessionSettings: ["SessionName"],
} as const;

export type GameUserSettingsKey =
  (typeof SECTION_KEYS)[keyof typeof SECTION_KEYS][number];

export const GAME_USER_SETTINGS_KEYS = Object.values(
  SECTION_KEYS,
).flat() as GameUserSettingsKey[];

// Valeurs d'un fichier absent (avant le 1er lancement) : celles qu'écrit le
// serveur, sauf RCON qui reste vide (= « activé par défaut », voir
// prepareArkStart).
const DEFAULTS: Record<GameUserSettingsKey, string> = {
  ServerPassword: "",
  ServerAdminPassword: "",
  ServerPVE: "False",
  RCONEnabled: "",
  RCONPort: "",
  SessionName: "",
};

// Même en-tête et mêmes fins de ligne (CRLF) que le fichier du serveur.
const NEW_FILE = ";METADATA=(Diff=true, UseCommands=true)\n";
const NEW_FORMAT: IniFormat = { encoding: "utf8", eol: "\r\n" };

const gameUserSettingsPath = (serverPath: string) =>
  join(serverPath, GAME_USER_SETTINGS_REL_PATH);

/** Valeurs brutes (chaînes) des clés gérées de GameUserSettings.ini. */
export function readGameUserSettings(
  serverPath: string,
): Record<GameUserSettingsKey, string> {
  const file = readIniText(gameUserSettingsPath(serverPath));
  const values = { ...DEFAULTS };
  if (!file) return values;
  for (const [section, keys] of Object.entries(SECTION_KEYS)) {
    const sectionValues = readIniSection(file.text, section);
    for (const key of keys) {
      if (sectionValues[key] !== undefined) values[key] = sectionValues[key];
    }
  }
  return values;
}

/**
 * Met à jour des clés gérées de GameUserSettings.ini (copie `.backup`
 * avant), en gardant l'encodage, les fins de ligne et tout ce que Nexum ne
 * gère pas. Un retour à la ligne dans une valeur ajouterait une clé : retiré.
 */
export function writeGameUserSettings(
  serverPath: string,
  pairs: Partial<Record<GameUserSettingsKey, string>>,
): void {
  const path = gameUserSettingsPath(serverPath);
  backupBeforeWrite(path);
  const file = readIniText(path);
  let text = file?.text ?? NEW_FILE;
  for (const [section, keys] of Object.entries(SECTION_KEYS)) {
    const sectionPairs: Record<string, string> = {};
    for (const key of keys as readonly GameUserSettingsKey[]) {
      const value = pairs[key];
      if (value !== undefined) {
        sectionPairs[key] = value.replace(/[\r\n]/g, "").trim();
      }
    }
    if (Object.keys(sectionPairs).length > 0) {
      text = patchIniSection(text, section, sectionPairs);
    }
  }
  writeIniText(path, text, file ?? NEW_FORMAT);
}

export interface RconSettings {
  /** Activé dans l'INI avec un mot de passe admin. */
  enabled: boolean;
  password: string;
  port: number;
}

/**
 * RCON tel que le serveur l'utilise. Le port vient de l'INI, où le serveur
 * recopie son ?RCONPort au démarrage : juste aussi pour un serveur adopté
 * lancé hors de Nexum avec un autre port. `fallbackPort` (config de Nexum)
 * sert si la clé manque.
 */
export function readRconSettings(
  serverPath: string,
  fallbackPort: number,
): RconSettings {
  const values = readGameUserSettings(serverPath);
  const password = values.ServerAdminPassword;
  const port = Number(values.RCONPort);
  return {
    enabled: values.RCONEnabled.toLowerCase() === "true" && password !== "",
    password,
    port:
      Number.isInteger(port) && port >= 1 && port <= 65535
        ? port
        : fallbackPort,
  };
}
