import type {
  ArkImportNotice,
  ArkLaunchConfig,
} from "../../../../shared/types";
import { ARK_SETTINGS, GUS_SECTION } from "../../../../shared/arkSettings";
import { normalizeSettingValue } from "../config/settingValue";
import {
  ARK_MAP_NAME,
  ARK_MAX_PLAYERS,
  DEFAULT_ARK_CONFIG,
  isSaveDirectory,
} from "../launchConfig";
import type { ParsedLaunchLine } from "./parseLaunchLine";
import { mergeLineMods, parseModIds } from "../mods/modIds";

export interface IniSetting {
  section: string;
  key: string;
  value: string;
}

export interface MappedLaunchLine {
  launch: ArkLaunchConfig;
  ini: IniSetting[];
  lineSaveDirectory: string;
  notices: ArkImportNotice[];
}

/** Valeurs du serveur à reprendre quand la ligne ne les donne pas. */
export interface IniFallbacks {
  rconPort?: number;
  maxPlayers?: number;
}

const CLI_SETTINGS = new Map(
  ARK_SETTINGS.filter((setting) => setting.file === "cli").map((setting) => [
    setting.key.toLowerCase(),
    setting,
  ]),
);
const KEY_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
// `?SessionName` va dans sa section, les autres `?Clé` dans [ServerSettings] :
// le serveur les y recopie au démarrage (vérifié).
const SESSION_SECTION = "SessionSettings";

// Variable de .bat (%NOM%, %~dp0, %%) : la ligne n'a de sens qu'une fois
// le script exécuté. Écrite telle quelle, elle écraserait le vrai réglage.
const BATCH_VARIABLE = /%(~\w+|[^%\s]*%)/;

export const toInt = (
  value: string | null | undefined,
  min: number,
  max: number,
) => {
  const number = Number((value ?? "").trim());
  return Number.isInteger(number) && number >= min && number <= max
    ? number
    : undefined;
};

/**
 * Ligne de lancement → config Nexum, réglages à écrire dans
 * GameUserSettings.ini et ce qui n'a pas pu être repris. Rien n'est perdu
 * en silence : une option inconnue part dans les arguments perso, une
 * option qu'on ne peut pas reprendre (valeur illisible, variable de .bat,
 * espace) est signalée.
 */
export function mapLaunchLine(
  parsed: ParsedLaunchLine,
  fallbacks: IniFallbacks,
): MappedLaunchLine {
  const notices: ArkImportNotice[] = [];
  const ini: IniSetting[] = [];
  const launchOptions: Record<string, string> = {};
  const customArgs: string[] = [];
  const launch: ArkLaunchConfig = {
    ...DEFAULT_ARK_CONFIG,
    rconPort: fallbacks.rconPort ?? DEFAULT_ARK_CONFIG.rconPort,
    maxPlayers: fallbacks.maxPlayers ?? DEFAULT_ARK_CONFIG.maxPlayers,
  };
  let lineSaveDirectory = "";
  let urlGamePort: number | undefined;
  let dashGamePort: number | undefined;
  let urlMaxPlayers: number | undefined;
  let winLiveMaxPlayers: number | undefined;
  const invalid = (detail: string) =>
    notices.push({ code: "invalidValue", detail });
  /** Nombre lu, ou undefined avec une notice si la valeur est illisible. */
  const numberOf = (value: string | null, max: number, detail: string) => {
    const number = toInt(value, 1, max);
    if (number === undefined) invalid(detail);
    return number;
  };

  if (parsed.map === "") notices.push({ code: "noMap", detail: "" });
  else if (!ARK_MAP_NAME.test(parsed.map))
    notices.push({ code: "mapInvalid", detail: parsed.map });
  else launch.map = parsed.map;

  for (const { key, value } of parsed.query) {
    const lower = key.toLowerCase();
    const detail = `?${key}=${value ?? ""}`;
    if (lower === "listen") continue;
    if (value === null) {
      notices.push({ code: "queryFlag", detail: `?${key}` });
    } else if (BATCH_VARIABLE.test(value)) {
      notices.push({ code: "batchVariable", detail });
    } else if (lower === "port") {
      urlGamePort = numberOf(value, 65535, detail);
    } else if (lower === "queryport") {
      launch.queryPort = numberOf(value, 65535, detail) ?? launch.queryPort;
    } else if (lower === "rconport") {
      const rconPort = numberOf(value, 65535, detail);
      if (rconPort !== undefined) {
        launch.rconPort = rconPort;
        ini.push({
          section: GUS_SECTION,
          key: "RCONPort",
          value: `${rconPort}`,
        });
      }
    } else if (lower === "maxplayers") {
      urlMaxPlayers = numberOf(value, ARK_MAX_PLAYERS, detail);
    } else if (lower === "altsavedirectoryname") {
      if (isSaveDirectory(value.trim())) lineSaveDirectory = value.trim();
      else invalid(detail);
    } else if (!KEY_NAME.test(key)) {
      invalid(detail);
    } else {
      if (lower === "multihome") notices.push({ code: "multihome", detail });
      const section = lower === "sessionname" ? SESSION_SECTION : GUS_SECTION;
      ini.push({ section, key, value: value.replace(/[\r\n]/g, "") });
    }
  }

  // Mods de la ligne, rangés à la fin (actifs puis passifs, un ID dans les
  // deux reste actif).
  const lineMods: number[] = [];
  const linePassiveMods: number[] = [];
  for (const option of parsed.dash) {
    const lower = option.name.toLowerCase();
    const setting = CLI_SETTINGS.get(lower);
    if (BATCH_VARIABLE.test(option.raw)) {
      notices.push({ code: "batchVariable", detail: option.raw });
    } else if (lower === "port") {
      dashGamePort = numberOf(option.value, 65535, option.raw);
    } else if (lower === "winlivemaxplayers") {
      winLiveMaxPlayers = numberOf(option.value, ARK_MAX_PLAYERS, option.raw);
    } else if (lower === "nobattleye") {
      launch.battlEye = false;
    } else if (lower === "mods" || lower === "passivemods") {
      // Découpé aux virgules (`-mods="1, 2"` existe) ; un ID invalide
      // empêcherait le démarrage : écarté, mais signalé.
      const parsed = parseModIds(option.value ?? "");
      (lower === "mods" ? lineMods : linePassiveMods).push(...parsed.ids);
      if (parsed.invalid) invalid(option.raw);
    } else if (setting && setting.cliForm !== "query") {
      try {
        launchOptions[setting.key] = normalizeSettingValue(
          setting,
          setting.type === "flag" ? "True" : (option.value ?? ""),
        );
      } catch {
        const code = /\s/.test(option.raw) ? "valueWithSpace" : "invalidValue";
        notices.push({ code, detail: option.raw });
      }
    } else if (/\s/.test(option.raw)) {
      // Un argument perso est découpé aux espaces : il serait cassé.
      notices.push({ code: "valueWithSpace", detail: option.raw });
    } else {
      if (lower === "multihome")
        notices.push({ code: "multihome", detail: option.raw });
      customArgs.push(option.raw);
    }
  }
  for (const token of parsed.other) {
    if (BATCH_VARIABLE.test(token))
      notices.push({ code: "batchVariable", detail: token });
    else if (/\s/.test(token))
      notices.push({ code: "valueWithSpace", detail: token });
    else customArgs.push(token);
  }

  // ?Port l'emporte sur -port (vérifié) ; -WinLiveMaxPlayers est le seul
  // pris en compte, ?MaxPlayers ne sert qu'à défaut.
  launch.port = urlGamePort ?? dashGamePort ?? launch.port;
  if (urlMaxPlayers !== undefined && winLiveMaxPlayers === undefined) {
    notices.push({ code: "maxPlayersQuery", detail: "?MaxPlayers" });
  }
  launch.maxPlayers = winLiveMaxPlayers ?? urlMaxPlayers ?? launch.maxPlayers;
  if (launch.port === launch.queryPort)
    notices.push({ code: "portsSame", detail: `${launch.port}` });
  launch.launchOptions = launchOptions;
  launch.customArgs = customArgs.join(" ");
  launch.mods = mergeLineMods([], lineMods, linePassiveMods);
  return { launch, ini, lineSaveDirectory, notices };
}
