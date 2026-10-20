// Langue de l'interface, connue du main : le renderer l'envoie à chaque
// changement (IPC `app:setLanguage`, mémorisée dans le store `language`).
// Sert aux textes écrits par le main lui-même : lignes `[Manager]` des logs,
// progression de SteamCMD, menu de la zone de notification.
export type AppLanguage = "fr" | "en";

let current: AppLanguage = "fr";

export function getLanguage(): AppLanguage {
  return current;
}

export function setLanguage(lang: unknown): void {
  if (lang === "fr" || lang === "en") current = lang;
}
