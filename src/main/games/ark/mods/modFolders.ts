import { join } from "path";
import { readdir, rm, stat } from "fs/promises";

// Mods téléchargés par le serveur (CFCore) : un dossier `<modId>_<fileId>`
// par mod. Vérifié sur 14 installs : CFCore supprime lui-même l'ancienne
// version à chaque mise à jour (« Cleaning up (modId, fileId) »), il ne reste
// que les mods retirés de la liste, plus `.temp`, son dossier de travail.
const MODS_DIR = ["ShooterGame", "Binaries", "Win64", "ShooterGame", "Mods"];
const MOD_FOLDER = /^(\d+)_\d+$/;
export const TEMP_FOLDER = ".temp";

export const modsDir = (serverPath: string) =>
  join(serverPath, ...MODS_DIR, "83374");

/** Taille d'un dossier (octets), 0 s'il est illisible. */
export async function folderSize(path: string): Promise<number> {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    let total = 0;
    for (const entry of entries) {
      const child = join(path, entry.name);
      if (entry.isDirectory()) total += await folderSize(child);
      else if (entry.isFile()) total += (await stat(child)).size;
    }
    return total;
  } catch {
    return 0;
  }
}

/** Dossiers de mods présents, par ID (noms des dossiers). Vide si absent. */
export async function readModFolders(
  serverPath: string,
): Promise<Map<number, string[]>> {
  const folders = new Map<number, string[]>();
  try {
    for (const entry of await readdir(modsDir(serverPath), {
      withFileTypes: true,
    })) {
      const match = entry.isDirectory() ? entry.name.match(MOD_FOLDER) : null;
      if (!match) continue;
      const id = Number(match[1]);
      folders.set(id, [...(folders.get(id) ?? []), entry.name]);
    }
  } catch {
    // Dossier absent : le serveur n'a encore téléchargé aucun mod.
  }
  return folders;
}

/** Taille totale des dossiers d'un mod. */
export async function modSize(
  serverPath: string,
  names: string[],
): Promise<number> {
  let total = 0;
  for (const name of names)
    total += await folderSize(join(modsDir(serverPath), name));
  return total;
}

/** Supprime ces dossiers de `Mods/83374` (noms déjà validés). */
export async function removeModFolders(
  serverPath: string,
  names: string[],
): Promise<void> {
  for (const name of names)
    await rm(join(modsDir(serverPath), name), { recursive: true, force: true });
}
