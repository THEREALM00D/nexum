import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import type { ArkWorldLocation } from "../../../../shared/types";
import { isSaveDirectory } from "../launchConfig";

// Dossiers de Saved qui ne sont jamais un dossier de monde.
const NOT_WORLDS = new Set([
  "config",
  "logs",
  "crashes",
  "cache",
  "savegames",
  "servermetrics",
]);

/**
 * Dossiers qui contiennent déjà `<Carte>/<Carte>.ark` : `Saved/SavedArks`
 * et chaque `Saved/<AltSaveDirectoryName>` (vérifié). ⚠️ La ligne ne suffit
 * pas : sur une vraie install, `?AltSaveDirectoryName` était sur la ligne
 * mais le monde le plus récent dans SavedArks (outil changé entre-temps).
 * Plus récent d'abord.
 */
export function findWorldLocations(
  serverPath: string,
  map: string,
): ArkWorldLocation[] {
  const saved = join(serverPath, "ShooterGame", "Saved");
  if (!existsSync(saved)) return [];
  const locations: ArkWorldLocation[] = [];
  for (const entry of readdirSync(saved, { withFileTypes: true })) {
    if (!entry.isDirectory() || NOT_WORLDS.has(entry.name.toLowerCase()))
      continue;
    const saveDirectory =
      entry.name.toLowerCase() === "savedarks" ? "" : entry.name;
    if (!isSaveDirectory(saveDirectory)) continue;
    const worldFolder = join(saved, entry.name, map);
    const worldFile = join(worldFolder, `${map}.ark`);
    if (!existsSync(worldFile)) continue;
    try {
      const files = readdirSync(worldFolder);
      locations.push({
        saveDirectory,
        modifiedAt: statSync(worldFile).mtimeMs,
        profiles: files.filter((file) => /\.arkprofile$/i.test(file)).length,
        tribes: files.filter((file) => /\.arktribe$/i.test(file)).length,
      });
    } catch {
      // Dossier illisible (droits, fichier verrouillé) : pas proposé.
    }
  }
  return locations.sort((left, right) => right.modifiedAt - left.modifiedAt);
}
