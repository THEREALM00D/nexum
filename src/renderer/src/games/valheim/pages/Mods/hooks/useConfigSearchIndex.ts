import { useEffect, useRef, useState } from "react";
import type { ValheimModConfigFile } from "@shared/types";
import { parseCfg, type CfgEntry } from "../utils/cfgParser";

interface CachedFile {
  mtime: number;
  entries: CfgEntry[];
}

// Paramètres de tous les fichiers .cfg, pour la recherche dans tous les
// fichiers de l'onglet Configs. Rien n'est lu tant que `needed` n'a pas été
// vrai une fois (première recherche) ; ensuite l'index suit la liste : après
// un Enregistrer, la liste est relue et seul le fichier dont la date a changé
// est relu (cache nom + mtime). Lecture via l'IPC existant `readConfigFile`,
// parsing par le même `parseCfg` que l'éditeur.
export function useConfigSearchIndex(
  files: ValheimModConfigFile[],
  needed: boolean,
) {
  const cache = useRef(new Map<string, CachedFile>());
  const [active, setActive] = useState(false);
  const [entriesByFile, setEntriesByFile] = useState<Map<
    string,
    CfgEntry[]
  > | null>(null);

  useEffect(() => {
    if (needed) setActive(true);
  }, [needed]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const readOne = async (
      file: ValheimModConfigFile,
    ): Promise<[string, CfgEntry[]]> => {
      const cached = cache.current.get(file.name);
      if (cached && cached.mtime === file.mtime)
        return [file.name, cached.entries];
      try {
        const text = await window.api.valheim.mods.readConfigFile(file.name);
        const { entries } = parseCfg(text);
        cache.current.set(file.name, { mtime: file.mtime, entries });
        return [file.name, entries];
      } catch {
        // Fichier illisible : il reste trouvable par son nom
        return [file.name, []];
      }
    };
    Promise.all(files.map(readOne)).then((results) => {
      if (!cancelled) setEntriesByFile(new Map(results));
    });
    return () => {
      cancelled = true;
    };
  }, [files, active]);

  return {
    entriesByFile,
    /** Première construction de l'index en cours (les suivantes gardent l'ancien). */
    indexing: (needed || active) && entriesByFile === null,
  };
}
