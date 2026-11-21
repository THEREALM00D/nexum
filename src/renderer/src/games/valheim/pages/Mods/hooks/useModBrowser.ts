import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  ModBrowsePage,
  ModRegistry,
  ThunderstoreModInfo,
} from "@shared/types";
import { useNotification } from "../../../../../context/NotificationContext";
import { errorMessage } from "../../../../../utils/appErrorMessage";

export type BrowseTab = "trending" | "latest" | "updated";

// Identifiant unique d'un mod sur un registre (`full_name`). Pas `mod_id` :
// c'est un hash 32 bits, des collisions sont possibles sur toute la liste.
export const browseModKey = (mod: ThunderstoreModInfo) =>
  `${mod.author}-${mod.name}`;

// Une page d'un onglet ou de la recherche (le main pagine sa liste en cache).
function fetchPage(
  registry: ModRegistry,
  tab: BrowseTab,
  query: string,
  offset: number,
): Promise<ModBrowsePage> {
  const mods = window.api.valheim.mods;
  if (query) return mods.search(registry, query, offset);
  if (tab === "trending") return mods.getTrending(registry, offset);
  if (tab === "latest") return mods.getLatestAdded(registry, offset);
  return mods.getLatestUpdated(registry, offset);
}

// Onglet Parcourir : registre, onglet, recherche et pages chargées.
export function useModBrowser() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [tab, setTab] = useState<BrowseTab>("trending");
  const [registry, setRegistry] = useState<ModRegistry>("thunderstore");
  const [query, setQuery] = useState("");
  const [mods, setMods] = useState<ThunderstoreModInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  // Change à chaque nouvelle liste (pas à « Charger plus ») : la liste
  // revient en haut seulement dans ce cas.
  const [listKey, setListKey] = useState(0);
  // Numéro de la liste affichée : une réponse arrivée après un changement
  // d'onglet, de registre ou de recherche est ignorée.
  const requestRef = useRef(0);

  const load = useCallback(
    async (
      nextRegistry: ModRegistry,
      nextTab: BrowseTab,
      nextQuery: string,
    ) => {
      const requestId = ++requestRef.current;
      setLoading(true);
      setLoadingMore(false);
      setError(false);
      try {
        const page = await fetchPage(nextRegistry, nextTab, nextQuery, 0);
        if (requestId !== requestRef.current) return;
        setMods(page.mods);
        setTotal(page.total);
      } catch {
        if (requestId !== requestRef.current) return;
        setError(true);
        setMods([]);
        setTotal(0);
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
          setListKey((key) => key + 1);
        }
      }
    },
    [],
  );

  useEffect(() => {
    load("thunderstore", "trending", "");
  }, [load]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore) return;
    const requestId = requestRef.current;
    setLoadingMore(true);
    try {
      const page = await fetchPage(registry, tab, query, mods.length);
      if (requestId !== requestRef.current) return;
      // La liste en cache peut s'être rechargée entre deux pages et décalée :
      // pas de doublon.
      setMods((current) => {
        const shownKeys = new Set(current.map(browseModKey));
        return [
          ...current,
          ...page.mods.filter((mod) => !shownKeys.has(browseModKey(mod))),
        ];
      });
      setTotal(page.total);
    } catch (loadError) {
      if (requestId === requestRef.current) {
        notify(errorMessage(t, loadError), "error");
      }
    } finally {
      if (requestId === requestRef.current) setLoadingMore(false);
    }
  }, [loading, loadingMore, registry, tab, query, mods.length, notify, t]);

  const handleTabChange = useCallback(
    (nextTab: BrowseTab) => {
      setTab(nextTab);
      setQuery("");
      load(registry, nextTab, "");
    },
    [load, registry],
  );

  // La recherche en cours est gardée : elle est relancée sur l'autre registre.
  const handleRegistryChange = useCallback(
    (nextRegistry: ModRegistry) => {
      setRegistry(nextRegistry);
      load(nextRegistry, tab, query);
    },
    [load, tab, query],
  );

  const handleSearch = useCallback(
    (searchText: string) => {
      const trimmed = searchText.trim();
      // Même recherche (Échap dans un champ vide, Entrée répété) : garder les
      // pages chargées. Après un échec, la soumettre à nouveau réessaie.
      if (trimmed === query && !error) return;
      setQuery(trimmed);
      load(registry, tab, trimmed);
    },
    [load, registry, tab, query, error],
  );

  return {
    tab,
    registry,
    query,
    mods,
    total,
    loading,
    loadingMore,
    error,
    listKey,
    loadMore,
    handleTabChange,
    handleRegistryChange,
    handleSearch,
  };
}
