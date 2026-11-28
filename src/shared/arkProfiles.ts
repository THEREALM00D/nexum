import type { ArkProfileBackupConfig } from "./types";
import { BACKUP_INTERVALS } from "./backupIntervals";

export const PROFILE_KEEP_RANGE = { min: 1, max: 100 } as const;

/** Désactivée par défaut : rien ne change pour un serveur déjà configuré. */
export const DEFAULT_ARK_PROFILE_BACKUP: ArkProfileBackupConfig = {
  intervalMinutes: 0,
  keep: 10,
  announce: false,
};

/** Réglages lus du store ou d'un fichier d'import : hors bornes → défaut. */
export function sanitizeArkProfileBackup(
  raw: Partial<ArkProfileBackupConfig> | undefined,
): ArkProfileBackupConfig {
  const intervalMinutes = raw?.intervalMinutes;
  const keep = raw?.keep;
  return {
    intervalMinutes: BACKUP_INTERVALS.some(
      (interval) => interval === intervalMinutes,
    )
      ? (intervalMinutes as number)
      : DEFAULT_ARK_PROFILE_BACKUP.intervalMinutes,
    keep:
      Number.isInteger(keep) &&
      (keep as number) >= PROFILE_KEEP_RANGE.min &&
      (keep as number) <= PROFILE_KEEP_RANGE.max
        ? (keep as number)
        : DEFAULT_ARK_PROFILE_BACKUP.keep,
    announce: raw?.announce === true,
  };
}
