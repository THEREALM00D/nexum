import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../context/NotificationContext";
import { errorMessage } from "../../utils/appErrorMessage";

export interface BrowsePage<Item> {
  mods: Item[];
  total: number;
}

interface Options<Item, Params> {
  initialParams: Params;
  /** Une page à partir de `offset` (nombre de mods déjà affichés). Stable. */
  fetchPage: (params: Params, offset: number) => Promise<BrowsePage<Item>>;
  /** Identifiant unique d'un mod, pour ne pas l'afficher deux fois. Stable. */
  keyOf: (mod: Item) => string | number;
}

/**
 * Liste paginée de l'onglet Parcourir (mods Valheim et ARK) : filtres,
 * pages chargées, « Charger plus ». Le jeu décrit ses filtres (`Params`) et
 * sa façon de lire une page ; le premier chargement est à lancer avec `load`.
 */
export function usePagedBrowser<Item, Params>({
  initialParams,
  fetchPage,
  keyOf,
}: Options<Item, Params>) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [params, setParams] = useState<Params>(initialParams);
  const [mods, setMods] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<unknown>(null);
  // Change à chaque nouvelle liste (pas à « Charger plus ») : resetKey du
  // ScrollPanel, la liste revient en haut seulement dans ce cas.
  const [listKey, setListKey] = useState(0);
  // Numéro de la liste affichée : la réponse d'une liste remplacée entre-temps
  // (filtre, onglet ou registre changé) est ignorée.
  const requestRef = useRef(0);

  const load = useCallback(
    async (next: Params) => {
      const requestId = ++requestRef.current;
      setParams(next);
      setLoading(true);
      setLoadingMore(false);
      setError(null);
      try {
        const page = await fetchPage(next, 0);
        if (requestId !== requestRef.current) return;
        setMods(page.mods);
        setTotal(page.total);
      } catch (loadError) {
        if (requestId !== requestRef.current) return;
        setError(loadError ?? new Error());
        setMods([]);
        setTotal(0);
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false);
          setListKey((key) => key + 1);
        }
      }
    },
    [fetchPage],
  );

  const loadMore = useCallback(async () => {
    if (loading || loadingMore) return;
    const requestId = requestRef.current;
    setLoadingMore(true);
    try {
      const page = await fetchPage(params, mods.length);
      if (requestId !== requestRef.current) return;
      // La liste distante peut bouger entre deux pages : pas de doublon.
      setMods((current) => {
        const shown = new Set(current.map(keyOf));
        return [
          ...current,
          ...page.mods.filter((mod) => !shown.has(keyOf(mod))),
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
  }, [loading, loadingMore, fetchPage, params, mods.length, keyOf, notify, t]);

  return {
    params,
    mods,
    total,
    loading,
    loadingMore,
    /** Erreur du dernier chargement (pas de « Charger plus »), null sinon. */
    error,
    listKey,
    load,
    loadMore,
  };
}
