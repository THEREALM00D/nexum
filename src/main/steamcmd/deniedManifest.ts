import {
  closeSync,
  existsSync,
  openSync,
  readSync,
  renameSync,
  rmSync,
  statSync,
} from "fs";
import { join } from "path";

/**
 * Mise à jour d'un serveur installé par un autre outil sur un ancien build :
 * pour calculer le correctif, SteamCMD redemande le manifeste du build
 * installé, que Steam refuse en anonyme. La mise à jour est annulée avant
 * tout téléchargement (« state is 0x6 », qui sort aussi pour d'autres
 * échecs : on lit la cause dans `content_log.txt`). Sans son manifeste,
 * SteamCMD traite le dossier comme une installation neuve : il vérifie les
 * fichiers présents et ne télécharge que ce qui a changé.
 */
const DENIED = /Failed to get manifest request code, 'Access Denied'/;
const ASIDE_SUFFIX = ".nexum-old";

function contentLog(steamcmdDir: string): string {
  return join(steamcmdDir, "logs", "content_log.txt");
}

function ownManifest(installPath: string, appId: string): string {
  return join(installPath, "steamapps", `appmanifest_${appId}.acf`);
}

/** Taille du journal de contenu avant un lancement de SteamCMD. */
export function contentLogSize(steamcmdDir: string): number {
  try {
    return statSync(contentLog(steamcmdDir)).size;
  } catch {
    return 0; // pas encore de journal
  }
}

/** Steam a refusé un manifeste pendant le lancement commencé à `offset`. */
export function manifestDenied(steamcmdDir: string, offset: number): boolean {
  const path = contentLog(steamcmdDir);
  try {
    const size = statSync(path).size;
    // Journal plus court qu'avant : SteamCMD l'a recommencé.
    const start = size < offset ? 0 : offset;
    const length = size - start;
    if (length <= 0) return false;
    const buffer = Buffer.alloc(length);
    const file = openSync(path, "r");
    try {
      readSync(file, buffer, 0, length, start);
    } finally {
      closeSync(file);
    }
    return DENIED.test(buffer.toString("utf-8"));
  } catch {
    return false;
  }
}

/** Met de côté le manifeste du dossier du serveur. Faux s'il n'y en a pas. */
export function setManifestAside(installPath: string, appId: string): boolean {
  const manifest = ownManifest(installPath, appId);
  if (!existsSync(manifest)) return false;
  renameSync(manifest, manifest + ASIDE_SUFFIX);
  return true;
}

/**
 * Après le 2e essai : l'ancien manifeste est supprimé dès que SteamCMD en a
 * écrit un nouveau (même sur un échec, sinon le prochain essai buterait sur
 * le même refus), remis en place sinon (la vérification de version le lit).
 */
export function settleAsideManifest(installPath: string, appId: string): void {
  const manifest = ownManifest(installPath, appId);
  const aside = manifest + ASIDE_SUFFIX;
  try {
    if (!existsSync(aside)) return;
    if (existsSync(manifest)) rmSync(aside, { force: true });
    else renameSync(aside, manifest);
  } catch {
    // Fichier verrouillé : il reste à côté, sans gêner SteamCMD.
  }
}
