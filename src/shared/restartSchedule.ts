// Calcul des heures du redémarrage planifié, partagé par le main
// (planificateur) et le renderer (« Prochain redémarrage »).
import type { RestartConfig } from "./types";

/** Tous les jours, du dimanche (0) au samedi (6), comme `Date.getDay`. */
export const ALL_WEEKDAYS: readonly number[] = [0, 1, 2, 3, 4, 5, 6];

/** Intervalles proposés pour la vérification des mises à jour (heures). */
export const UPDATE_CHECK_HOURS: readonly number[] = [1, 2, 4, 6, 12];

/** Délai d'annonce le plus long accepté (minutes). */
export const MAX_WARNING_MINUTES = 120;

// Message vide = message par défaut dans la langue de Nexum au moment de
// l'envoi (`restartAnnounce`, main/i18n/logStrings.ts).
export const DEFAULT_RESTART: RestartConfig = {
  enabled: false,
  mode: "times",
  times: ["04:00"],
  weekdays: [...ALL_WEEKDAYS],
  intervalHours: 6,
  intervalStart: "04:00",
  warnings: [30, 15, 10, 5, 4, 3, 2, 1],
  message: "",
  updateGame: false,
  checkUpdates: false,
  checkUpdatesHours: 4,
  updateWarningMinutes: 10,
  wildDinos: { afterStart: false, repeat: false, everyHours: 12 },
};

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isRestartTime(value: unknown): value is string {
  return typeof value === "string" && TIME_PATTERN.test(value);
}

function minutesOfDay(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function timeOfDay(totalMinutes: number): string {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/** Heures valides, sans doublon, triées. */
export function sortTimes(times: readonly string[]): string[] {
  return [...new Set(times.filter(isRestartTime))].sort();
}

/** Délais valides (1 à `MAX_WARNING_MINUTES`), sans doublon, du plus long au plus court. */
export function sortWarnings(warnings: readonly number[]): number[] {
  return [
    ...new Set(
      warnings.filter(
        (minutes) =>
          Number.isInteger(minutes) &&
          minutes > 0 &&
          minutes <= MAX_WARNING_MINUTES,
      ),
    ),
  ].sort((first, second) => second - first);
}

/** Heures d'arrêt d'une journée, triées. */
export function restartTimesOfDay(config: RestartConfig): string[] {
  if (config.mode === "times") return sortTimes(config.times);
  if (!isRestartTime(config.intervalStart) || config.intervalHours < 1)
    return [];
  const step = Math.round(config.intervalHours) * 60;
  // « À partir de » : première heure de la journée, rien avant.
  const start = minutesOfDay(config.intervalStart);
  const times: string[] = [];
  for (let minute = start; minute < 24 * 60; minute += step) {
    times.push(timeOfDay(minute));
  }
  return times;
}

/** Jours où l'on redémarre (le mode intervalle tourne tous les jours). */
function activeWeekdays(config: RestartConfig): readonly number[] {
  return config.mode === "times" ? config.weekdays : ALL_WEEKDAYS;
}

/**
 * Prochain arrêt planifié strictement après `from`, ou null (aucune heure,
 * aucun jour). Ne regarde pas `enabled` : à l'appelant de le faire.
 */
export function nextRestartAt(config: RestartConfig, from: Date): Date | null {
  const times = restartTimesOfDay(config);
  const weekdays = activeWeekdays(config);
  if (times.length === 0 || weekdays.length === 0) return null;
  for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
    const day = new Date(from);
    day.setDate(from.getDate() + dayOffset);
    if (!weekdays.includes(day.getDay())) continue;
    for (const time of times) {
      const [hours, minutes] = time.split(":").map(Number);
      const candidate = new Date(day);
      candidate.setHours(hours, minutes, 0, 0);
      if (candidate.getTime() > from.getTime()) return candidate;
    }
  }
  return null;
}

/**
 * Annonces d'un arrêt dans `minutes` : `minutes` d'abord, puis les délais
 * de la liste plus courts (mise à jour trouvée pendant que le serveur tourne).
 */
export function warningsUpTo(
  warnings: readonly number[],
  minutes: number,
): number[] {
  if (minutes <= 0) return [];
  return sortWarnings([
    minutes,
    ...warnings.filter((warning) => warning < minutes),
  ]);
}
