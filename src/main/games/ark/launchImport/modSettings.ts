import { existsSync, readdirSync } from "fs";
import { join } from "path";
import type { ArkModSettings } from "../../../../shared/types";
import {
  GAME_INI_REL_PATH,
  GAME_USER_SETTINGS_REL_PATH,
} from "../gameUserSettingsIni";
import { readArkIni } from "../config/arkIniFile";
import { isModSection } from "../config/modSections";

function modSections(path: string): string[] {
  return readArkIni(path).doc.sections().filter(isModSection);
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
