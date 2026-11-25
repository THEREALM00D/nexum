import { intervalToDuration } from "date-fns";

// Unité de jour selon la langue : « j » (jours) en FR, « d » (days) en EN.
export function formatDuration(seconds: number, locale: string): string {
  if (!seconds || seconds <= 0) return "—";
  const d = intervalToDuration({ start: 0, end: seconds * 1000 });
  const parts: string[] = [];
  if (d.days) parts.push(`${d.days}${locale === "fr" ? "j" : "d"}`);
  if (d.hours) parts.push(`${d.hours}h`);
  if (d.minutes !== undefined && (d.days || d.hours)) {
    parts.push(`${String(d.minutes).padStart(2, "0")}m`);
  } else if (d.minutes) {
    parts.push(`${d.minutes}m`);
  }
  return parts.length ? parts.join("") : `${d.seconds ?? 0}s`;
}

/**
 * Nombre dans la langue de l'app : « 10,3 » en FR, « 10.3 » en EN. Autant
 * de décimales que `fractionDigits`, sauf si `minimumFractionDigits` est
 * plus petit (« 12 » mais « 4,5 »).
 */
export function formatNumber(
  value: number,
  locale: string,
  fractionDigits: number,
  minimumFractionDigits = fractionDigits,
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Unités traduites (`common.units`) : o / Ko / Mo / Go en FR. */
export interface SizeUnits {
  b: string;
  kb: string;
  mb: string;
  gb: string;
}

/** Taille lisible ; dans un composant, passer par `useFormatSize`. */
export function formatSize(
  bytes: number,
  locale: string,
  units: SizeUnits,
): string {
  const kilo = 1024;
  if (bytes < kilo) return `${formatNumber(bytes, locale, 0)} ${units.b}`;
  if (bytes < kilo ** 2)
    return `${formatNumber(bytes / kilo, locale, 1)} ${units.kb}`;
  if (bytes < kilo ** 3)
    return `${formatNumber(bytes / kilo ** 2, locale, 1)} ${units.mb}`;
  return `${formatNumber(bytes / kilo ** 3, locale, 2)} ${units.gb}`;
}

export function formatDate(ts: number, locale: string): string {
  return new Date(ts).toLocaleString(locale === "fr" ? "fr-FR" : "en-US");
}

/** Date seule, sans l'heure (date de publication d'un fichier…). */
export function formatDay(ts: number, locale: string): string {
  return new Date(ts).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US");
}
