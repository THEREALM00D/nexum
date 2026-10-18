import { homedir } from "os";
import { basename, dirname, join, resolve } from "path";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  statSync,
} from "fs";
import type { DragonwildsWorld } from "../../../shared/types";
import { dragonwildsServerConfig } from "./serverConfig";
import { readWorldName } from "./saveHeader";

/** Mondes solo du client du jeu sur ce PC. */
export const SOLO_SAVES_DIR = join(
  process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local"),
  "RSDragonwilds",
  "Saved",
  "SaveGames",
);

export const serverSavesDir = (serverPath: string) =>
  dragonwildsServerConfig.getSavePath(serverPath);

/**
 * Mondes d'un dossier (sous-dossiers compris : l'organisation du dossier du
 * client n'est pas documentée). `.sav` de monde seulement : le serveur garde
 * la version précédente en `<fichier>.sav.backup`, et les sauvegardes de
 * personnage n'ont pas de nom de monde.
 */
export function listWorlds(dir: string): DragonwildsWorld[] {
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir, { recursive: true })
      .map((f) => join(dir, String(f)))
      .filter((p) => p.toLowerCase().endsWith(".sav"))
      .flatMap((p) => {
        const worldName = readWorldName(p);
        if (!worldName) return [];
        const st = statSync(p);
        return [
          {
            worldName,
            fileName: basename(p),
            path: p,
            sizeBytes: st.size,
            lastModified: st.mtimeMs,
          },
        ];
      })
      .sort((a, b) => b.lastModified - a.lastModified);
  } catch {
    return [];
  }
}

/**
 * Copie un monde dans le dossier du serveur et renvoie son nom (à mettre
 * dans DefaultWorldName). Le serveur choisit le monde par le nom inscrit
 * dans la sauvegarde : un autre fichier du serveur portant le même nom est
 * mis de côté (`Saved/SaveGames-replaced/<date>/`, hors du dossier lu par le
 * serveur) pour que ce soit bien le monde importé qui se charge. Les mondes
 * du serveur ont été sauvegardés en ZIP avant (handlers/worlds.ts).
 */
export function importWorldToServer(
  sourcePath: string,
  serverPath: string,
): string {
  const worldName = sourcePath.toLowerCase().endsWith(".sav")
    ? readWorldName(sourcePath)
    : null;
  if (!worldName) {
    throw new Error(
      "Ce fichier n'est pas une sauvegarde de monde Dragonwilds.",
    );
  }
  const dir = serverSavesDir(serverPath);
  const dest = join(dir, basename(sourcePath));
  const sameFile = (a: string, b: string) =>
    resolve(a).toLowerCase() === resolve(b).toLowerCase();
  if (sameFile(dest, sourcePath)) return worldName;

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const replacedDir = join(dirname(dir), "SaveGames-replaced", stamp);
  for (const w of listWorlds(dir)) {
    if (w.worldName === worldName && !sameFile(w.path, dest)) {
      mkdirSync(replacedDir, { recursive: true });
      renameSync(w.path, join(replacedDir, w.fileName));
    }
  }
  mkdirSync(dir, { recursive: true });
  copyFileSync(sourcePath, dest);
  return worldName;
}
