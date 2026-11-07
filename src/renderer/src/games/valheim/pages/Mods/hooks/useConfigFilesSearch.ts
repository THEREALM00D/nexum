import { useDeferredValue, useMemo } from "react";
import type { ValheimModConfigFile } from "@shared/types";
import type { CfgEntry } from "../utils/cfgParser";
import { cfgEntryMatches } from "../utils/cfgSearch";
import { useConfigSearchIndex } from "./useConfigSearchIndex";

export interface ConfigFileResult {
  file: ValheimModConfigFile;
  /** Paramètres du fichier qui correspondent à la recherche. */
  matches: CfgEntry[];
}

// Recherche de l'onglet Configs : un fichier est gardé si son nom contient
// la requête ou si au moins un de ses paramètres correspond (même règle que
// la recherche dans l'éditeur, `cfgEntryMatches`).
export function useConfigFilesSearch(
  files: ValheimModConfigFile[],
  search: string,
) {
  // Saisie fluide : le filtrage de tous les paramètres est différé
  const deferred = useDeferredValue(search).trim();
  const query = deferred.toLowerCase();
  const { entriesByFile, indexing } = useConfigSearchIndex(files, query !== "");

  const results = useMemo<ConfigFileResult[]>(() => {
    if (!query) return files.map((file) => ({ file, matches: [] }));
    return files.flatMap((file) => {
      const matches = (entriesByFile?.get(file.name) ?? []).filter((e) =>
        cfgEntryMatches(e, query),
      );
      return matches.length > 0 || file.name.toLowerCase().includes(query)
        ? [{ file, matches }]
        : [];
    });
  }, [files, entriesByFile, query]);

  return {
    results,
    /** Requête appliquée (casse d'origine), à reporter dans l'éditeur. */
    query: deferred,
    /** Paramètres pas encore lus : seuls les noms de fichiers sont filtrés. */
    indexing: query !== "" && indexing,
  };
}
