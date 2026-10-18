import { join } from "path";
import { backupBeforeWrite } from "../../utils/ini";
import {
  patchIniSection,
  readIniSection,
  readIniText,
  writeIniText,
  type IniFormat,
} from "../../utils/iniText";

export const INI_REL_PATH = join(
  "RSDragonwilds",
  "Saved",
  "Config",
  "WindowsServer",
  "DedicatedServer.ini",
);
const SECTION = "/Script/Dominion.DedicatedServerSettings";

// Clés éditées par Nexum. Jamais touchées : ServerGuid (généré par le
// serveur), la liste des admins qu'il tient lui-même, bAllowSendingCrashDumps
// et toute clé inconnue. `AdministratorList` du modèle Docker officiel
// n'existe pas dans le binaire actuel (vérifié) : pas exposée.
export const INI_KEYS = [
  "OwnerId",
  "ServerName",
  "DefaultWorldName",
  "WorldPassword",
  "PlatformPolicy",
] as const;

const DEFAULTS: Record<string, string> = {
  OwnerId: "",
  ServerName: "",
  DefaultWorldName: "",
  WorldPassword: "",
  PlatformPolicy: "Crossplay",
};

// Même en-tête que le fichier écrit par le serveur à son premier lancement.
const NEW_FILE = ";METADATA=(Diff=true, UseCommands=true)\n";
const NEW_FORMAT: IniFormat = { encoding: "utf8", eol: "\r\n" };

const iniPath = (serverPath: string) => join(serverPath, INI_REL_PATH);

/** Valeurs brutes (chaînes) des clés éditables de DedicatedServer.ini. */
export function readDedicatedServerIni(
  serverPath: string,
): Record<string, string> {
  const file = readIniText(iniPath(serverPath));
  const values = file ? readIniSection(file.text, SECTION) : {};
  return Object.fromEntries(INI_KEYS.map((k) => [k, values[k] ?? DEFAULTS[k]]));
}

/**
 * Met à jour des clés de DedicatedServer.ini (sauvegarde `.backup` avant),
 * en gardant l'encodage du fichier et tout ce que Nexum ne gère pas. Un
 * retour à la ligne dans une valeur ajouterait une clé : retiré.
 */
export function writeDedicatedServerIni(
  serverPath: string,
  pairs: Record<string, string>,
): void {
  const path = iniPath(serverPath);
  backupBeforeWrite(path);
  const file = readIniText(path);
  const clean = Object.fromEntries(
    Object.entries(pairs).map(([k, v]) => [k, v.replace(/[\r\n]/g, "").trim()]),
  );
  const text = patchIniSection(file?.text ?? NEW_FILE, SECTION, clean);
  writeIniText(path, text, file ?? NEW_FORMAT);
}
