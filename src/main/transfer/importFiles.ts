import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "fs";
import { join } from "path";
import type { ServerArchiveImportResult } from "../../shared/types";
import { backupBeforeWrite } from "../utils/ini";
import { AppError } from "../utils/appError";
import { WORLD_DIR } from "./serverArchive";

// Écritures de l'import d'un serveur (`serverArchiveImport.ts`).

const entries = (folder: string): string[] =>
  existsSync(folder) ? readdirSync(folder) : [];

/** Fichier ou dossier copié, avec `.backup` de tout fichier déjà présent. */
export function copyWithBackup(source: string, destination: string): void {
  if (statSync(source).isDirectory()) {
    mkdirSync(destination, { recursive: true });
    for (const name of readdirSync(source))
      copyWithBackup(join(source, name), join(destination, name));
    return;
  }
  backupBeforeWrite(destination);
  copyFileSync(source, destination);
}

/** Erreur fs (droits, lecteur absent, disque plein) → code traduit avec le chemin. */
export function writeFailed(error: unknown): AppError {
  if (error instanceof AppError) return error;
  const fsError = error as NodeJS.ErrnoException;
  return new AppError("TRANSFER_WRITE_FAILED", {
    path: fsError?.path ?? "",
    detail: fsError?.code ?? String(error),
  });
}

/** Monde du ZIP vers `savePath`, sauf fichier du même nom déjà là sans `replaceWorld`. */
export function copyWorld(
  extractDir: string,
  savePath: string,
  replaceWorld: boolean,
): ServerArchiveImportResult["world"] {
  const worldEntries = entries(join(extractDir, WORLD_DIR));
  if (worldEntries.length === 0) return "none";
  const conflict = worldEntries.some((name) =>
    existsSync(join(savePath, name)),
  );
  if (conflict && !replaceWorld) return "skipped";
  mkdirSync(savePath, { recursive: true });
  for (const name of worldEntries)
    cpSync(join(extractDir, WORLD_DIR, name), join(savePath, name), {
      recursive: true,
      force: true,
    });
  return "copied";
}
