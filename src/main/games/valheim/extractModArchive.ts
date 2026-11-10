import { basename, join } from "path";
import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from "fs";
import extractZip from "extract-zip";
import { AppError } from "../../utils/appError";

// Fichier verrouillé (DLL chargée par le serveur lancé) : Windows refuse le
// renommage du dossier entier, rien n'est touché → message traduit plutôt
// que l'EPERM brut de Node.
function setAside(targetPath: string, asidePath: string): void {
  try {
    renameSync(targetPath, asidePath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EPERM" || code === "EBUSY" || code === "EACCES")
      throw new AppError("MOD_FILES_IN_USE", { name: basename(targetPath) });
    throw error;
  }
}

// Extrait l'archive d'un mod dans `targetPath` en « tout ou rien » : le ZIP
// est d'abord extrait dans un dossier temporaire de `tempRoot`, et le
// dossier du mod n'est remplacé qu'une fois l'extraction réussie. Sinon un
// échec laissait `BepInEx/plugins/<installDir>` vide (listé comme mod
// manuel) et, sur une mise à jour, supprimait l'ancienne version.
// `asideRoot` : dossier du même lecteur que `targetPath` mais hors de
// `plugins/` (BepInEx ne doit pas charger l'ancienne version mise de côté).
export async function extractModArchive(
  zipPath: string,
  targetPath: string,
  tempRoot: string,
  asideRoot: string,
): Promise<void> {
  const tempExtract = join(tempRoot, `_mod_extract_${Date.now()}`);
  try {
    mkdirSync(tempExtract, { recursive: true });
    await extractZip(zipPath, { dir: tempExtract });

    // Ancienne version mise de côté par un renommage : s'il échoue (DLL
    // verrouillée par le serveur lancé), rien n'a encore été touché.
    const asidePath = existsSync(targetPath)
      ? join(asideRoot, `_nexum_old_${basename(targetPath)}_${Date.now()}`)
      : null;
    if (asidePath) setAside(targetPath, asidePath);
    try {
      // cpSync fonctionne inter-lecteurs (données de Nexum sur C:, serveur
      // sur E:), renameSync non
      cpSync(tempExtract, targetPath, { recursive: true });
    } catch (error) {
      // Copie partielle (disque plein…) : remettre l'ancienne version
      rmSync(targetPath, { recursive: true, force: true });
      if (asidePath) renameSync(asidePath, targetPath);
      throw error;
    }
    if (asidePath) rmSync(asidePath, { recursive: true, force: true });
  } finally {
    try {
      rmSync(tempExtract, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}
