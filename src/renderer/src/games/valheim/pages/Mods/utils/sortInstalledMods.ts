import type { ValheimMod } from "@shared/types";

// Tris proposés dans l'onglet Installés (demandé sur Discord : « mises à
// jour disponibles, mis à jour récemment, etc. »).
export const INSTALLED_SORTS = [
  "name",
  "updates",
  "recentlyInstalled",
  "recentlyPublished",
  "author",
] as const;

export type InstalledSort = (typeof INSTALLED_SORTS)[number];

export const DEFAULT_INSTALLED_SORT: InstalledSort = "name";

interface SortContext {
  hasUpdate: (mod: ValheimMod) => boolean;
  isDeprecated: (mod: ValheimMod) => boolean;
}

const byName = (a: ValheimMod, b: ValheimMod) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

// Plus récent d'abord ; les mods sans date (installés à la main) en dernier.
const byDateDesc =
  (date: (mod: ValheimMod) => number | undefined) =>
  (a: ValheimMod, b: ValheimMod) =>
    (date(b) || 0) - (date(a) || 0);

export function sortInstalledMods(
  mods: ValheimMod[],
  sort: InstalledSort,
  { hasUpdate, isDeprecated }: SortContext,
): ValheimMod[] {
  const compare = (a: ValheimMod, b: ValheimMod): number => {
    switch (sort) {
      case "updates":
        // Mises à jour disponibles, puis mods dépréciés, puis le reste.
        return (
          Number(hasUpdate(b)) - Number(hasUpdate(a)) ||
          Number(isDeprecated(b)) - Number(isDeprecated(a))
        );
      case "recentlyInstalled":
        return byDateDesc((m) => m.installedAt)(a, b);
      case "recentlyPublished":
        return byDateDesc((m) => m.publishedAt)(a, b);
      case "author":
        return (a.author || "￿").localeCompare(b.author || "￿", undefined, {
          sensitivity: "base",
        });
      default:
        return 0;
    }
  };
  // Le nom départage toujours les égalités : ordre stable et prévisible.
  return [...mods].sort((a, b) => compare(a, b) || byName(a, b));
}

const STORAGE_KEY = "valheimMods.installedSort";

// Tri mémorisé par poste (simple confort : l'accès peut échouer, on
// retombe alors sur le tri par défaut).
export function loadInstalledSort(): InstalledSort {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (INSTALLED_SORTS as readonly string[]).includes(saved))
      return saved as InstalledSort;
  } catch {
    /* stockage indisponible */
  }
  return DEFAULT_INSTALLED_SORT;
}

export function saveInstalledSort(sort: InstalledSort): void {
  try {
    localStorage.setItem(STORAGE_KEY, sort);
  } catch {
    /* stockage indisponible */
  }
}
