import type { CfgEntry } from "./cfgParser";

// Règle de recherche commune à l'éditeur d'un fichier et à la recherche dans
// tous les fichiers : section, clé et description (pas la valeur, trop de
// bruit pour une requête courte comme « true » ou « 1 »). `query` est déjà
// en minuscules et sans espaces autour. Un nom de section qui correspond
// garde tous les paramètres de la section.
export function cfgEntryMatches(entry: CfgEntry, query: string): boolean {
  return (
    entry.section.toLowerCase().includes(query) ||
    entry.key.toLowerCase().includes(query) ||
    (entry.description?.toLowerCase().includes(query) ?? false)
  );
}
