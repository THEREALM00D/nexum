import type { RestartConfig, WildDinosConfig } from "../../shared/types";
import {
  ALL_WEEKDAYS,
  DEFAULT_RESTART,
  MAX_WARNING_MINUTES,
  UPDATE_CHECK_HOURS,
  isRestartTime,
  sortTimes,
  sortWarnings,
} from "../../shared/restartSchedule";

/**
 * Config de redémarrage telle qu'enregistrée : jusqu'à la 0.25, une seule
 * heure (`time`) et une seule annonce (`warningMinutes`). Aussi la forme
 * des archives de serveur et des exports de réglages de ces versions.
 */
export type StoredRestartConfig = Partial<RestartConfig> & {
  time?: string;
  warningMinutes?: number;
};

// Ancien message par défaut, enregistré en français dans la config de chaque
// serveur jusqu'à la 0.20 : relu comme « message par défaut » (vide).
const LEGACY_RESTART_MESSAGE =
  "Le serveur va redémarrer dans {minutes} minutes";

/** Ancienne forme → nouvelle : une heure tous les jours, une annonce. */
function upgradeLegacyFields(
  stored: StoredRestartConfig,
): Partial<RestartConfig> {
  const { time, warningMinutes, ...rest } = stored;
  const upgraded: Partial<RestartConfig> = { ...rest };
  if (rest.times === undefined && typeof time === "string") {
    upgraded.times = [time];
    upgraded.weekdays = [...ALL_WEEKDAYS];
  }
  if (rest.warnings === undefined && typeof warningMinutes === "number") {
    upgraded.warnings = warningMinutes > 0 ? [warningMinutes] : [];
  }
  return upgraded;
}

function clampInteger(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.round(value)))
    : fallback;
}

function booleanOr(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function sanitizeWildDinos(stored: unknown): WildDinosConfig {
  const defaults = DEFAULT_RESTART.wildDinos;
  const wildDinos = (
    typeof stored === "object" && stored !== null ? stored : {}
  ) as Partial<Record<keyof WildDinosConfig, unknown>>;
  return {
    afterStart: booleanOr(wildDinos.afterStart, defaults.afterStart),
    repeat: booleanOr(wildDinos.repeat, defaults.repeat),
    everyHours: clampInteger(wildDinos.everyHours, 1, 168, defaults.everyHours),
  };
}

/**
 * Valeurs lues, reçues du renderer ou d'un fichier importé : seules les
 * clés connues, du bon type et dans leurs bornes ; sinon la valeur de `base`.
 */
function sanitizeRestart(
  restart: Partial<Record<keyof RestartConfig, unknown>>,
  base: RestartConfig,
): RestartConfig {
  const weekdays = Array.isArray(restart.weekdays)
    ? [...new Set(restart.weekdays)].filter((day) => ALL_WEEKDAYS.includes(day))
    : base.weekdays;
  const message =
    typeof restart.message === "string" ? restart.message : base.message;
  return {
    enabled: booleanOr(restart.enabled, base.enabled),
    mode:
      restart.mode === "interval" || restart.mode === "times"
        ? restart.mode
        : base.mode,
    times: Array.isArray(restart.times) ? sortTimes(restart.times) : base.times,
    weekdays: [...weekdays].sort(),
    intervalHours: clampInteger(
      restart.intervalHours,
      1,
      24,
      base.intervalHours,
    ),
    intervalStart: isRestartTime(restart.intervalStart)
      ? restart.intervalStart
      : base.intervalStart,
    warnings: Array.isArray(restart.warnings)
      ? sortWarnings(restart.warnings)
      : base.warnings,
    message: message === LEGACY_RESTART_MESSAGE ? "" : message,
    updateGame: booleanOr(restart.updateGame, base.updateGame),
    checkUpdates: booleanOr(restart.checkUpdates, base.checkUpdates),
    checkUpdatesHours: UPDATE_CHECK_HOURS.includes(
      restart.checkUpdatesHours as number,
    )
      ? (restart.checkUpdatesHours as number)
      : base.checkUpdatesHours,
    updateWarningMinutes: clampInteger(
      restart.updateWarningMinutes,
      0,
      MAX_WARNING_MINUTES,
      base.updateWarningMinutes,
    ),
    wildDinos: sanitizeWildDinos(restart.wildDinos ?? base.wildDinos),
  };
}

/**
 * Config de redémarrage complète : `base` (défauts ou config actuelle)
 * complétée par `stored`, ancienne forme comprise.
 */
export function withRestartDefaults(
  stored?: StoredRestartConfig,
  base: RestartConfig = DEFAULT_RESTART,
): RestartConfig {
  return sanitizeRestart(upgradeLegacyFields(stored ?? {}), base);
}
