import { existsSync, readdirSync } from "fs";
import { join } from "path";
import type { ArkModSettings } from "../../../../shared/types";
import { readIniText } from "../../../utils/iniText";
import {
  GAME_INI_REL_PATH,
  GAME_USER_SETTINGS_REL_PATH,
} from "../gameUserSettingsIni";
import { SECTION_RE } from "../config/iniLine";

// Sections que le jeu écrit lui-même : le reste vient des mods (ou d'une
// carte : [Ragnarok]). Sans casse, comme le jeu.
const GAME_SECTIONS = new Set([
  "serversettings",
  "sessionsettings",
  "scalabilitygroups",
  "messageoftheday",
  "startup",
]);
const isModSection = (section: string) => {
  const lower = section.trim().toLowerCase();
  return !lower.startsWith("/script/") && !GAME_SECTIONS.has(lower);
};

function modSections(path: string): string[] {
  const text = readIniText(path)?.text ?? "";
  const sections = text
    .split(/\r?\n/)
    .map((line) => line.match(SECTION_RE)?.[1]?.trim())
    .filter((section): section is string => !!section && isModSection(section));
  return [...new Set(sections)];
}

const entriesOf = (folder: string): string[] => {
  try {
    return existsSync(folder)
      ? readdirSync(folder, { withFileTypes: true }).map((entry) =>
          entry.isDirectory() ? `${entry.name}/` : entry.name,
        )
      : [];
  } catch {
    return [];
  }
};

/**
 * Réglages des mods gardés tels quels, puisque Nexum reprend le dossier en
 * place : sections des INI, fichiers que les mods écrivent dans
 * `Saved/SaveGames`, plugins ServerAPI. Pour le résumé de l'import (vérifié
 * sur une vraie install moddée).
 */
export function findModSettings(serverPath: string): ArkModSettings {
  const saved = join(serverPath, "ShooterGame", "Saved");
  return {
    iniSections: [
      ...modSections(join(serverPath, GAME_USER_SETTINGS_REL_PATH)),
      ...modSections(join(serverPath, GAME_INI_REL_PATH)),
    ],
    files: entriesOf(join(saved, "SaveGames")).map(
      (name) => `SaveGames/${name}`,
    ),
    // ⚠️ Plugins chargés seulement si le serveur est lancé par
    // AsaApiLoader.exe : Nexum lance ArkAscendedServer.exe.
    serverApiPlugins: existsSync(
      join(serverPath, "ShooterGame", "Binaries", "Win64", "AsaApiLoader.exe"),
    )
      ? entriesOf(
          join(
            serverPath,
            "ShooterGame",
            "Binaries",
            "Win64",
            "ArkApi",
            "Plugins",
          ),
        )
          .filter((name) => name.endsWith("/"))
          .map((name) => name.slice(0, -1))
      : [],
  };
}
