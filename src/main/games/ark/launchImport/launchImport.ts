import { join } from "path";
import type {
  ArkLaunchConfig,
  ArkLaunchImport,
} from "../../../../shared/types";
import { GUS_SECTION } from "../../../../shared/arkSettings";
import { AppError } from "../../../utils/appError";
import { readArkIni, writeArkIni } from "../config/arkIniFile";
import { GAME_USER_SETTINGS_REL_PATH } from "../gameUserSettingsIni";
import { isSaveDirectory, validateArkLaunch } from "../launchConfig";
import { mapLaunchLine, type IniSetting } from "./mapLaunchLine";
import { parseLaunchLine } from "./parseLaunchLine";
import { findWorldLocations } from "./worldLocations";
import { findModSettings } from "./modSettings";

// MaxPlayers y est réécrit au démarrage avec la valeur effective (vérifié) :
// bonne valeur de repli quand la ligne n'a pas -WinLiveMaxPlayers.
const SESSION_SECTION = "/Script/Engine.GameSession";

const gusPath = (serverPath: string) =>
  join(serverPath, GAME_USER_SETTINGS_REL_PATH);

const toNumber = (value: string | undefined) =>
  value === undefined || value.trim() === "" ? undefined : Number(value);

function mapLine(serverPath: string, line: string) {
  const { doc } = readArkIni(gusPath(serverPath));
  const rconPort = toNumber(doc.get(GUS_SECTION, "RCONPort"));
  const maxPlayers = toNumber(doc.get(SESSION_SECTION, "MaxPlayers"));
  return mapLaunchLine(parseLaunchLine(line), {
    rconPort: Number.isInteger(rconPort) ? rconPort : undefined,
    maxPlayers: Number.isInteger(maxPlayers) ? maxPlayers : undefined,
  });
}

/**
 * Aperçu de l'import : config obtenue, monde le plus récent présélectionné
 * (sinon le dossier de la ligne), réglages qui iront dans l'INI.
 * Les conflits de ports sont ajoutés par le handler (il connaît les autres
 * serveurs).
 */
export function previewLaunchImport(
  serverPath: string,
  line: string,
): Omit<ArkLaunchImport, "conflicts"> {
  const mapped = mapLine(serverPath, line);
  const worlds = findWorldLocations(serverPath, mapped.launch.map);
  const notices = [...mapped.notices];
  if (worlds.length === 0) {
    notices.push({ code: "worldNotFound", detail: mapped.launch.map });
  }
  return {
    launch: {
      ...mapped.launch,
      saveDirectory: worlds[0]?.saveDirectory ?? mapped.lineSaveDirectory,
    },
    iniKeys: mapped.ini.map((setting) => setting.key),
    lineSaveDirectory: mapped.lineSaveDirectory,
    worlds,
    notices,
    modSettings: findModSettings(serverPath),
  };
}

/**
 * Config à enregistrer et réglages écrits dans GameUserSettings.ini (copie
 * `.backup`). La ligne est relue ici, jamais reprise du renderer ; seul le
 * dossier du monde vient du choix de l'utilisateur.
 */
export function applyLaunchImport(
  serverPath: string,
  line: string,
  saveDirectory: unknown,
): ArkLaunchConfig {
  if (typeof line !== "string" || !isSaveDirectory(saveDirectory)) {
    throw new AppError("ARK_SAVE_DIR_INVALID", {
      name: String(saveDirectory),
    });
  }
  const mapped = mapLine(serverPath, line);
  const launch = { ...mapped.launch, saveDirectory };
  // Même contrôle que l'onglet Général (ports identiques, carte…) : rien
  // n'est écrit si la config serait refusée là-bas.
  const invalid = validateArkLaunch(launch);
  if (invalid) throw new Error(invalid);
  writeIniSettings(serverPath, mapped.ini);
  return launch;
}

function writeIniSettings(serverPath: string, settings: IniSetting[]): void {
  if (settings.length === 0) return;
  const path = gusPath(serverPath);
  const file = readArkIni(path);
  const before = file.doc.toText();
  for (const { section, key, value } of settings) {
    file.doc.set(section, key, value);
  }
  // Valeurs déjà dans le fichier (cas courant : le serveur y recopie les
  // options `?`) : rien n'est écrit, la copie `.backup` existante reste.
  if (file.doc.toText() !== before) writeArkIni(path, file);
}
