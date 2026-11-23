import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  ArkModCategory,
  ArkModSearchPage,
  ArkModSearchResult,
  ArkModSort,
} from "@shared/types";
import { usePagedBrowser } from "../../../../../components/mods/usePagedBrowser";
import { errorMessage } from "../../../../../utils/appErrorMessage";

export interface BrowseFilters {
  query: string;
  sort: ArkModSort;
  categoryId: number | null;
}

const DEFAULT_FILTERS: BrowseFilters = {
  query: "",
  sort: "popular",
  categoryId: null,
};

// « Custom Cosmetics » : aucun de ces mods ne s'installe sur un serveur
// (vérifié), la catégorie n'est pas proposée dans le filtre.
const COSMETICS_CATEGORY_ID = 6844;

const fetchPage = (
  filters: BrowseFilters,
  offset: number,
): Promise<ArkModSearchPage> =>
  window.api.arkMods.search({ ...filters, index: offset });

const modId = (mod: ArkModSearchResult) => mod.id;

/**
 * Onglet Parcourir : recherche CurseForge, filtres et pages chargées
 * (mécanique commune : components/mods/usePagedBrowser). Appelé par la page :
 * la liste survit au changement d'onglet. Rien n'est gardé ailleurs
 * (conditions de l'API CurseForge).
 */
export function useArkModBrowser(enabled: boolean) {
  const { t } = useTranslation();
  const browser = usePagedBrowser({
    initialParams: DEFAULT_FILTERS,
    fetchPage,
    keyOf: modId,
  });
  const { load, params, error } = browser;
  const [categories, setCategories] = useState<ArkModCategory[]>([]);

  // Première liste et catégories : seulement dans un build avec clé.
  useEffect(() => {
    if (!enabled) return;
    void load(DEFAULT_FILTERS);
    window.api.arkMods
      .categories()
      .then((all) =>
        setCategories(
          all.filter((category) => category.id !== COSMETICS_CATEGORY_ID),
        ),
      )
      .catch(() => setCategories([]));
  }, [enabled, load]);

  return {
    filters: params,
    mods: browser.mods,
    total: browser.total,
    categories,
    loading: browser.loading,
    loadingMore: browser.loadingMore,
    error: error === null ? null : errorMessage(t, error),
    // Clé sans droit de recherche (403) : la page masque l'onglet.
    forbidden: error !== null && String(error).includes("CURSEFORGE_FORBIDDEN"),
    listKey: browser.listKey,
    setFilters: (patch: Partial<BrowseFilters>) =>
      void load({ ...params, ...patch }),
    retry: () => void load(params),
    loadMore: browser.loadMore,
  };
}
