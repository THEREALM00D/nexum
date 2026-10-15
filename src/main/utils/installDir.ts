import { app } from "electron/main";
import { dirname, isAbsolute, relative, resolve } from "path";

/**
 * Dossier d'installation de Nexum (celui de Nexum.exe), ou null quand il n'y
 * en a pas à protéger : build portable (exe extrait dans un dossier
 * temporaire, aucun désinstalleur) ou dev. En dev, NEXUM_DEV_INSTALL_DIR
 * permet de tester l'avertissement.
 */
export function appInstallDir(): string | null {
  if (!app.isPackaged) return process.env.NEXUM_DEV_INSTALL_DIR || null;
  if (process.env.PORTABLE_EXECUTABLE_DIR) return null;
  return dirname(app.getPath("exe"));
}

/**
 * Renvoie le dossier d'installation si `path` est dedans (ou est ce dossier),
 * sinon null. Les versions ≤ 0.12.3 de Nexum vident tout ce dossier à chaque
 * mise à jour (désinstalleur electron-builder par défaut) : des mondes
 * Valheim rangés dans H:\Nexum disparaissaient (signalé sur Discord).
 */
export function installDirConflict(path: string): string | null {
  const dir = appInstallDir();
  if (!dir || !path?.trim()) return null;
  // Windows : chemins insensibles à la casse.
  const rel = relative(resolve(dir).toLowerCase(), resolve(path).toLowerCase());
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel)) ? dir : null;
}
