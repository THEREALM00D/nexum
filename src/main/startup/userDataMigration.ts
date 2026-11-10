import { app } from "electron/main";
import { basename, join } from "path";
import {
  existsSync,
  readFileSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { acquireMigrationLock, releaseMigrationLock } from "./migrationLock";

// Dossier de données de l'app (userData). Doit être résolu avant `ready`,
// avant tout accès à userData et avant `requestSingleInstanceLock` (clé sur
// userData). Voir « Identité de l'app » dans src/main/CLAUDE.md.

// Jusqu'à la 0.2.0, Electron nommait le dossier d'après le `name` du
// package.json : `server-forge`. `ServerForge` reste en repli par sécurité.
const LEGACY_USER_DATA_DIRS = ["server-forge", "ServerForge"];
const USER_DATA_DIR = "Nexum";
// Écrit dans l'ancien dossier juste avant le renommage (il voyage avec lui) :
// tant qu'il existe, la réécriture des chemins n'est pas terminée.
const MIGRATION_MARKER = ".migrated-from";
// Dans %APPDATA%, hors des dossiers déplacés ou supprimés (`migrationLock.ts`).
const MIGRATION_LOCK = ".nexum-migration.lock";
// Fichiers qui contiennent des chemins absolus vers le dossier de données :
// la config (electron-store) et ceux que SteamCMD écrit lui-même.
const FILES_WITH_PATHS = [
  "config.json",
  join("steamcmd", "steamapps", "libraryfolders.vdf"),
  join("steamcmd", "config", "libraryfolders.vdf"),
  join("steamcmd", "config", "config.vdf"),
];

const hasConfig = (directory: string): boolean =>
  existsSync(join(directory, "config.json"));

export function resolveUserDataDir(): void {
  const appData = app.getPath("appData");
  const userDataDir = join(appData, USER_DATA_DIR);
  if (!app.isPackaged) {
    // Dev : le même dossier que l'app installée (migrée ou non), jamais de
    // migration. NEXUM_USER_DATA_DIR : dossier isolé (tests).
    app.setPath(
      "userData",
      process.env.NEXUM_USER_DATA_DIR ||
        (hasConfig(userDataDir)
          ? userDataDir
          : join(appData, LEGACY_USER_DATA_DIRS[0])),
    );
    return;
  }
  app.setPath("userData", userDataDir);
  const migrationPending = existsSync(join(userDataDir, MIGRATION_MARKER));
  if (hasConfig(userDataDir) && !migrationPending) return; // Cas courant.
  const lockPath = join(appData, MIGRATION_LOCK);
  if (!acquireMigrationLock(lockPath)) {
    // Une autre instance migre encore : ne rien toucher, lire ce qui existe.
    const legacyDir = findLegacyDir(appData);
    if (!hasConfig(userDataDir) && legacyDir) {
      app.setPath("userData", legacyDir);
    }
    return;
  }
  try {
    // État relu sous le verrou : une autre instance a pu migrer entre-temps.
    migrateUserData(appData, userDataDir);
  } finally {
    releaseMigrationLock(lockPath);
  }
}

const findLegacyDir = (appData: string): string | undefined =>
  LEGACY_USER_DATA_DIRS.map((name) => join(appData, name)).find(hasConfig);

function migrateUserData(appData: string, userDataDir: string): void {
  if (hasConfig(userDataDir)) {
    // Reprise d'une migration interrompue entre le renommage et la réécriture.
    if (existsSync(join(userDataDir, MIGRATION_MARKER))) {
      finishMigration(userDataDir);
    }
    return;
  }
  const legacyDir = findLegacyDir(appData);
  if (!legacyDir) return; // Installation neuve.
  if (!moveLegacyDir(legacyDir, userDataDir)) {
    app.setPath("userData", legacyDir);
    return;
  }
  finishMigration(userDataDir);
}

// Renomme l'ancien dossier (instantané, même disque). Échoue si une autre
// instance tourne dessus : elle y tient `lockfile` ouvert sans partage de
// suppression. On reste alors sur l'ancien dossier et on réessaie au lancement
// suivant.
function moveLegacyDir(legacyDir: string, userDataDir: string): boolean {
  const marker = join(legacyDir, MIGRATION_MARKER);
  try {
    // Restes de la 0.3.0 (cache Chromium, sans config.json) : rien à garder.
    if (existsSync(userDataDir)) {
      rmSync(userDataDir, { recursive: true, force: true });
    }
    writeFileSync(marker, legacyDir, "utf8");
    renameSync(legacyDir, userDataDir);
    return true;
  } catch (error) {
    console.warn("[userData] move of", legacyDir, "postponed:", error);
    try {
      if (existsSync(marker)) unlinkSync(marker);
    } catch {
      // Marqueur orphelin sans effet : il n'est lu que dans le nouveau dossier.
    }
    return false;
  }
}

// Réécrit les chemins absolus qui pointaient dans l'ancien dossier, puis
// retire le marqueur. Une erreur laisse le marqueur : nouvel essai au
// lancement suivant (les données sont déjà en place).
function finishMigration(userDataDir: string): void {
  const marker = join(userDataDir, MIGRATION_MARKER);
  try {
    const legacyDir = readFileSync(marker, "utf8").trim();
    for (const relativePath of FILES_WITH_PATHS) {
      rewriteFile(join(userDataDir, relativePath), legacyDir, userDataDir);
    }
    unlinkSync(marker);
  } catch (error) {
    console.warn("[userData] path rewrite failed:", error);
  }
}

function rewriteFile(
  filePath: string,
  legacyDir: string,
  userDataDir: string,
): void {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  const updated = replaceLegacyDir(content, legacyDir, userDataDir);
  if (updated === content) return;
  // Ne jamais écrire une config illisible : electron-store repartirait à vide.
  if (filePath.endsWith(".json")) JSON.parse(updated);
  // Fichier temporaire puis renommage : une coupure pendant l'écriture ne
  // laisse jamais un fichier tronqué (electron-store refuserait de démarrer).
  const temporaryPath = `${filePath}.tmp`;
  writeFileSync(temporaryPath, updated, "utf8");
  renameSync(temporaryPath, filePath);
}

// Remplace l'ancien dossier par le nouveau dans un texte, quel que soit le
// séparateur (`\`, `\\` échappé dans le JSON et les .vdf, `/`) et sans tenir
// compte de la casse. Les deux dossiers sont dans %APPDATA% : seul le dernier
// segment change, le séparateur trouvé est donc conservé tel quel.
function replaceLegacyDir(
  text: string,
  legacyDir: string,
  userDataDir: string,
): string {
  const legacyName = basename(legacyDir);
  const pattern = legacyDir
    .split(/[\\/]+/)
    .map((segment) => segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("(?:\\\\{1,2}|/)");
  // Suivi d'un séparateur, d'un guillemet, d'un espace ou de la fin : évite
  // `server-forge-updater` et compagnie.
  const regex = new RegExp(`${pattern}(?=[\\\\/"'\\s]|$)`, "gi");
  return text.replace(
    regex,
    (match) =>
      match.slice(0, match.length - legacyName.length) + basename(userDataDir),
  );
}
