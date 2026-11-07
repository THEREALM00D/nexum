import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

/** Date de modification (ms) du fichier le plus récent du dossier, ou null. */
export function newestMtime(dir: string): number | null {
  if (!existsSync(dir)) return null;
  let newest: number | null = null;
  const walk = (d: string): void => {
    let names: string[];
    try {
      names = readdirSync(d);
    } catch {
      return;
    }
    for (const name of names) {
      const full = join(d, name);
      try {
        const s = statSync(full);
        if (s.isDirectory()) walk(full);
        else if (newest === null || s.mtimeMs > newest) newest = s.mtimeMs;
      } catch {
        // Fichier supprimé entre la lecture du dossier et stat : le jeu
        // écrit, la prochaine sonde le verra.
      }
    }
  };
  walk(dir);
  return newest;
}

export interface StableSave {
  /** Dernière écriture du jeu (ms), null si le dossier est vide. */
  newest: number | null;
  /** false : le jeu écrivait encore au bout de `maxMs`. */
  stable: boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Attend que le jeu ait fini d'écrire sa sauvegarde : aucun fichier du
 * dossier modifié depuis `quietMs`. Évite de zipper un fichier à moitié
 * écrit (autosauvegarde du jeu ou sauvegarde qu'on vient de demander).
 *
 * `changedAfter` : après une sauvegarde demandée au jeu, on attend en plus
 * qu'un fichier ait été écrit depuis cette date (le jeu peut répondre avant
 * d'avoir commencé à écrire).
 */
export async function waitForStableSave(
  dir: string,
  {
    quietMs = 5000,
    maxMs = 30000,
    pollMs = 1000,
    changedAfter,
  }: {
    quietMs?: number;
    maxMs?: number;
    pollMs?: number;
    changedAfter?: number;
  } = {},
): Promise<StableSave> {
  const deadline = Date.now() + maxMs;
  for (;;) {
    const newest = newestMtime(dir);
    const written =
      changedAfter === undefined || (newest !== null && newest >= changedAfter);
    if (newest === null || (written && Date.now() - newest >= quietMs)) {
      return { newest, stable: true };
    }
    if (Date.now() >= deadline) return { newest, stable: false };
    await sleep(pollMs);
  }
}
