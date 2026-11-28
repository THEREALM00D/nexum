import { getLanguage } from "./language";

/** Date et heure courtes dans la langue des logs (« 28/11/2026 14:55 »). */
export function logDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString(
    getLanguage() === "fr" ? "fr-FR" : "en-US",
    { dateStyle: "short", timeStyle: "short" },
  );
}
