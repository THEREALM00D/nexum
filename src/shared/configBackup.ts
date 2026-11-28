import type { ConfigBackupSettings } from "./types";
import { BACKUP_INTERVALS } from "./backupIntervals";

export const CONFIG_KEEP_RANGE = { min: 1, max: 100 } as const;

/** Activé par défaut : une copie ne se fait que si un fichier a changé. */
export const DEFAULT_CONFIG_BACKUP: ConfigBackupSettings = {
  intervalMinutes: 60,
  keep: 20,
  beforeSave: true,
  beforeStart: true,
};

/** Réglages lus du store ou d'un fichier d'import : hors bornes → défaut. */
export function sanitizeConfigBackup(
  raw: Partial<ConfigBackupSettings> | undefined,
): ConfigBackupSettings {
  const intervalMinutes = raw?.intervalMinutes;
  const keep = raw?.keep;
  return {
    intervalMinutes: BACKUP_INTERVALS.some(
      (interval) => interval === intervalMinutes,
    )
      ? (intervalMinutes as number)
      : DEFAULT_CONFIG_BACKUP.intervalMinutes,
    keep:
      Number.isInteger(keep) &&
      (keep as number) >= CONFIG_KEEP_RANGE.min &&
      (keep as number) <= CONFIG_KEEP_RANGE.max
        ? (keep as number)
        : DEFAULT_CONFIG_BACKUP.keep,
    beforeSave:
      typeof raw?.beforeSave === "boolean"
        ? raw.beforeSave
        : DEFAULT_CONFIG_BACKUP.beforeSave,
    beforeStart:
      typeof raw?.beforeStart === "boolean"
        ? raw.beforeStart
        : DEFAULT_CONFIG_BACKUP.beforeStart,
  };
}
