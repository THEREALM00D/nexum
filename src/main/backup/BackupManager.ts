import { join, basename } from "path";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  createWriteStream,
  rmSync,
  renameSync,
  openSync,
  readSync,
  closeSync,
} from "fs";
import extractZip from "extract-zip";
import type { BackupEntry } from "../../shared/types";
import { AppError } from "../utils/appError";

// Suffixe des sauvegardes faites avant une mise à jour du jeu ou des mods :
// reconnues dans la liste et comptées à part par la rotation, pour qu'une
// série de sauvegardes automatiques ne fasse pas disparaître la seule copie
// du monde d'avant le patch.
const BEFORE_UPDATE_SUFFIX = "-before-update.zip";

// Signature de l'EOCD (End of Central Directory) : "PK\x05\x06"
const EOCD_SIGNATURE = Buffer.from([0x50, 0x4b, 0x05, 0x06]);

function isValidZip(filePath: string): boolean {
  try {
    const stats = statSync(filePath);
    if (stats.size < 22) return false; // EOCD minimum = 22 bytes
    // L'EOCD peut être suivi d'un commentaire jusqu'à 65535 bytes
    const tailSize = Math.min(stats.size, 65557);
    const buf = Buffer.alloc(tailSize);
    const fd = openSync(filePath, "r");
    try {
      readSync(fd, buf, 0, tailSize, stats.size - tailSize);
    } finally {
      closeSync(fd);
    }
    return buf.indexOf(EOCD_SIGNATURE) !== -1;
  } catch {
    return false;
  }
}

export class BackupManager {
  private schedulerTimer: NodeJS.Timeout | null = null;

  private getSavePath(serverPath: string): string {
    return join(serverPath, "Pal", "Saved", "SaveGames");
  }

  startScheduler(intervalMinutes: number, run: () => Promise<void>): void {
    this.stopScheduler();
    if (intervalMinutes <= 0) return;
    this.schedulerTimer = setInterval(
      () => {
        run().catch(() => {});
      },
      intervalMinutes * 60 * 1000,
    );
  }

  stopScheduler(): void {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  ensureBackupDir(backupDir: string): void {
    if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
  }

  list(backupDir: string): BackupEntry[] {
    if (!existsSync(backupDir)) return [];
    return readdirSync(backupDir)
      .filter((f) => f.endsWith(".zip") && !f.endsWith(".tmp.zip"))
      .map((f) => {
        const full = join(backupDir, f);
        const s = statSync(full);
        return {
          name: f,
          path: full,
          size: s.size,
          createdAt: s.mtimeMs,
          beforeUpdate: f.endsWith(BEFORE_UPDATE_SUFFIX),
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async create(
    serverPath: string,
    backupDir: string,
    sourcePath?: string,
    beforeUpdate = false,
  ): Promise<BackupEntry> {
    // archiver est en ESM pur depuis la v8 (plus de build CommonJS) — notre
    // process main est en CJS, donc un `require()`/import statique planterait
    // (ERR_REQUIRE_ESM). L'import dynamique fonctionne dans les deux sens.
    const { ZipArchive } = await import("archiver");
    return new Promise((resolve, reject) => {
      const sourceDir = sourcePath ?? this.getSavePath(serverPath);
      if (!existsSync(sourceDir)) {
        reject(new AppError("BACKUP_SOURCE_NOT_FOUND", { path: sourceDir }));
        return;
      }

      this.ensureBackupDir(backupDir);

      // Supprime les .tmp.zip orphelins laissés par un crash précédent
      try {
        readdirSync(backupDir)
          .filter((f) => f.endsWith(".tmp.zip"))
          .forEach((f) => unlinkSync(join(backupDir, f)));
      } catch {
        // ignore — non bloquant
        console.warn(
          `Impossible de nettoyer les fichiers temporaires dans ${backupDir}`,
        );
      }

      const ts = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .slice(0, 19);
      const filename = beforeUpdate
        ? `backup-${ts}${BEFORE_UPDATE_SUFFIX}`
        : `backup-${ts}.zip`;
      const outputPath = join(backupDir, filename);
      // Écrit dans un .tmp.zip puis rename à la fin pour rendre la création atomique :
      // un crash pendant le zip laisse un .tmp.zip (ignoré par list()) mais jamais
      // un .zip corrompu visible dans la liste.
      const tempPath = join(backupDir, `${filename}.tmp.zip`);

      const cleanup = () => {
        try {
          if (existsSync(tempPath)) unlinkSync(tempPath);
        } catch {
          // ignore
        }
      };

      const output = createWriteStream(tempPath);
      const archive = new ZipArchive({ zlib: { level: 9 } });

      let settled = false;
      const settle = (fn: () => void) => {
        if (settled) return;
        settled = true;
        fn();
      };

      // Watchdog : si ni finish ni error ne sont émis après 10 min, on abandonne
      const watchdog = setTimeout(
        () => {
          settle(() => {
            cleanup();
            reject(new AppError("BACKUP_TIMEOUT"));
          });
        },
        10 * 60 * 1000,
      );

      const done = () => {
        clearTimeout(watchdog);
        settle(() => {
          try {
            renameSync(tempPath, outputPath);
          } catch (err) {
            cleanup();
            reject(err as Error);
            return;
          }
          const s = statSync(outputPath);
          resolve({
            name: filename,
            path: outputPath,
            size: s.size,
            createdAt: s.mtimeMs,
            beforeUpdate,
          });
        });
      };

      const fail = (err: Error) => {
        clearTimeout(watchdog);
        settle(() => {
          cleanup();
          reject(err);
        });
      };

      // "finish" est plus fiable que "close" sur Windows
      output.on("finish", done);
      output.on("error", fail);
      archive.on("error", fail);
      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  async restore(
    serverPath: string,
    backupPath: string,
    saveDir?: string,
  ): Promise<void> {
    if (!existsSync(backupPath)) {
      throw new AppError("BACKUP_FILE_NOT_FOUND", { path: backupPath });
    }
    if (!isValidZip(backupPath)) {
      throw new AppError("BACKUP_CORRUPTED", { name: basename(backupPath) });
    }

    const targetDir = saveDir ?? this.getSavePath(serverPath);
    // Restore atomique : extraire dans un dossier .restore.tmp à côté du target.
    // Si extraction OK, on swap. Si elle plante, le save courant est intact.
    const stagingDir = `${targetDir}.restore.tmp`;
    const backupOfCurrent = `${targetDir}.previous`;

    // Nettoie un staging orphelin (extraction précédente interrompue)
    if (existsSync(stagingDir)) {
      rmSync(stagingDir, { recursive: true, force: true });
    }
    mkdirSync(stagingDir, { recursive: true });

    try {
      await extractZip(backupPath, { dir: stagingDir });
    } catch (err) {
      // Extraction ratée : on nettoie le staging et on laisse le save courant intact
      rmSync(stagingDir, { recursive: true, force: true });
      throw err;
    }

    // Extraction réussie : on déplace l'ancien save sur le côté, on met le staging
    // à la place, puis on supprime l'ancien. En cas de crash entre les deux renames,
    // le .previous reste récupérable manuellement.
    if (existsSync(backupOfCurrent)) {
      rmSync(backupOfCurrent, { recursive: true, force: true });
    }
    if (existsSync(targetDir)) {
      renameSync(targetDir, backupOfCurrent);
    }
    try {
      renameSync(stagingDir, targetDir);
    } catch (err) {
      // Rollback : on tente de remettre l'ancien save en place
      if (existsSync(backupOfCurrent) && !existsSync(targetDir)) {
        try {
          renameSync(backupOfCurrent, targetDir);
        } catch {
          // ignore — le user a son ancien save dans .previous
        }
      }
      throw err;
    }
    // Tout est bon : supprime la sauvegarde de sécurité
    if (existsSync(backupOfCurrent)) {
      rmSync(backupOfCurrent, { recursive: true, force: true });
    }
  }

  delete(backupPath: string): void {
    if (existsSync(backupPath)) unlinkSync(backupPath);
  }

  /**
   * Garde les `keep` plus récentes, en comptant séparément les sauvegardes
   * d'avant mise à jour et les autres (manuelles, automatiques).
   */
  rotate(backupDir: string, keep: number): void {
    if (keep <= 0) return;
    const list = this.list(backupDir);
    for (const beforeUpdate of [false, true]) {
      list
        .filter((b) => b.beforeUpdate === beforeUpdate)
        .slice(keep)
        .forEach((b) => this.delete(b.path));
    }
  }

  getDefaultBackupDir(userDataPath: string): string {
    return join(userDataPath, "backups");
  }

  getDefaultBackupDirForServer(userDataPath: string, serverId: string): string {
    return join(userDataPath, "servers", serverId, "backups");
  }

  basename(p: string): string {
    return basename(p);
  }
}
