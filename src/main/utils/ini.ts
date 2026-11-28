import { copyFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";

/** Parse une valeur INI brute : True/False, nombre, ou string (quotée ou non). */
export function parseIniValue(raw: string): string | number | boolean {
  if (raw === "True" || raw === "true") return true;
  if (raw === "False" || raw === "false") return false;
  const num = Number(raw);
  if (!isNaN(num) && raw !== "") return num;
  return raw.replace(/^"(.*)"$/, "$1");
}

let beforeConfigWrite: ((filePath: string) => void) | null = null;

/**
 * Appelé avant chaque écriture d'un fichier de config par Nexum (toutes
 * passent par `backupBeforeWrite`) : copie de la config du serveur concerné
 * (`src/main/backup/config/`). Enregistré une fois par `registerIpcHandlers`.
 */
export function onBeforeConfigWrite(
  listener: (filePath: string) => void,
): void {
  beforeConfigWrite = listener;
}

/**
 * Crée le dossier parent si besoin et sauvegarde le fichier existant en
 * `<path>.backup` avant une écriture destructive.
 */
/**
 * Prévient l'écouteur seulement (copie de la config) sans laisser de
 * `.backup` à côté : listes Valheim, dans le dossier de données du jeu.
 */
export function notifyBeforeConfigWrite(filePath: string): void {
  try {
    beforeConfigWrite?.(filePath);
  } catch {
    // Une copie ratée ne doit jamais empêcher l'enregistrement.
  }
}

export function backupBeforeWrite(filePath: string): void {
  notifyBeforeConfigWrite(filePath);
  mkdirSync(dirname(filePath), { recursive: true });
  if (existsSync(filePath)) {
    copyFileSync(filePath, filePath + ".backup");
  }
}
