import { useCallback, useEffect } from "react";
import type {
  ModBrowsePage,
  ModRegistry,
  ThunderstoreModInfo,
} from "@shared/types";
import { usePagedBrowser } from "../../../../../components/mods/usePagedBrowser";

export type BrowseTab = "trending" | "latest" | "updated";

interface BrowseParams {
  registry: ModRegistry;
  tab: BrowseTab;
  query: string;
}

const INITIAL_PARAMS: BrowseParams = {
  registry: "thunderstore",
  tab: "trending",
  query: "",
};

// Identifiant unique d'un mod sur un registre (`full_name`). Pas `mod_id` :
// c'est un hash 32 bits, des collisions sont possibles sur toute la liste.
export const browseModKey = (mod: ThunderstoreModInfo) =>
  `${mod.author}-${mod.name}`;

// Une page d'un onglet ou de la recherche (le main pagine sa liste en cache).
function fetchPage(
  { registry, tab, query }: BrowseParams,
  offset: number,
): Promise<ModBrowsePage> {
  const mods = window.api.valheim.mods;
  if (query) return mods.search(registry, query, offset);
  if (tab === "trending") return mods.getTrending(registry, offset);
  if (tab === "latest") return mods.getLatestAdded(registry, offset);
  return mods.getLatestUpdated(registry, offset);
}

// Onglet Parcourir : registre, onglet, recherche et pages chargées
// (mécanique commune : components/mods/usePagedBrowser).
export function useModBrowser() {
  const browser = usePagedBrowser({
    initialParams: INITIAL_PARAMS,
    fetchPage,
    keyOf: browseModKey,
  });
  const { params, load, error } = browser;

  useEffect(() => {
    void load(INITIAL_PARAMS);
  }, [load]);

  const handleTabChange = useCallback(
    (tab: BrowseTab) => void load({ ...params, tab, query: "" }),
    [load, params],
  );

  // La recherche en cours est gardée : elle est relancée sur l'autre registre.
  const handleRegistryChange = useCallback(
    (registry: ModRegistry) => void load({ ...params, registry }),
    [load, params],
  );

  const handleSearch = useCallback(
    (searchText: string) => {
      const query = searchText.trim();
      // Même recherche (Échap dans un champ vide, Entrée répété) : garder les
      // pages chargées. Après un échec, la soumettre à nouveau réessaie.
      if (query === params.query && !error) return;
      void load({ ...params, query });
    },
    [load, params, error],
  );

  return {
    tab: params.tab,
    registry: params.registry,
    query: params.query,
    mods: browser.mods,
    total: browser.total,
    loading: browser.loading,
    loadingMore: browser.loadingMore,
    error: error !== null,
    listKey: browser.listKey,
    loadMore: browser.loadMore,
    handleTabChange,
    handleRegistryChange,
    handleSearch,
  };
}
