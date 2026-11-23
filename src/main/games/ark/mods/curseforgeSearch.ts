import type {
  ArkModCategory,
  ArkModSearchPage,
  ArkModSearchParams,
  ArkModSort,
} from "../../../../shared/types";
import {
  ARK_GAME_ID,
  curseforgeRequest,
  toArkModInfo,
  type ApiMod,
} from "./curseforgeApi";

// Recherche des mods ARK (GET /v1/mods/search, vérifié). Rien n'est gardé :
// la liste ne vit que dans la page (conditions de l'API, art. 3.1(e)).
const MODS_CLASS_ID = 6072;
// Catégorie « Custom Cosmetics » : ces mods ne s'installent pas sur un
// serveur et l'empêchent de démarrer (message ASAMods, vérifié).
const COSMETICS_CATEGORY_ID = 6844;
const PAGE_SIZE = 20;
// index + pageSize ne peut pas dépasser 10 000 (réponse 400, vérifié).
const MAX_RESULTS = 10_000;

// ModsSearchSortField de l'API : 2 popularité, 3 dernière mise à jour,
// 4 nom, 6 téléchargements.
const SORT_FIELDS: Record<ArkModSort, { field: number; order: string }> = {
  popular: { field: 2, order: "desc" },
  updated: { field: 3, order: "desc" },
  downloads: { field: 6, order: "desc" },
  name: { field: 4, order: "asc" },
};

interface SearchMod extends ApiMod {
  downloadCount?: number;
  dateModified?: string;
  supportsCrossPlatform?: boolean;
  categories?: { id: number }[];
}

export async function searchArkMods(
  params: ArkModSearchParams,
): Promise<ArkModSearchPage> {
  // Paramètres venus du renderer : rien n'est supposé valide.
  const index = Number.isFinite(params?.index)
    ? Math.min(Math.max(0, Math.floor(params.index)), MAX_RESULTS)
    : 0;
  // Dernière page raccourcie : index + pageSize ne dépasse jamais 10 000.
  const pageSize = Math.min(PAGE_SIZE, MAX_RESULTS - index);
  if (pageSize <= 0) return { mods: [], total: MAX_RESULTS };
  const sort = Object.hasOwn(SORT_FIELDS, params?.sort)
    ? SORT_FIELDS[params.sort]
    : SORT_FIELDS.popular;
  const query = new URLSearchParams({
    gameId: String(ARK_GAME_ID),
    classId: String(MODS_CLASS_ID),
    sortField: String(sort.field),
    sortOrder: sort.order,
    index: String(index),
    pageSize: String(pageSize),
  });
  const text = typeof params?.query === "string" ? params.query.trim() : "";
  if (text) query.set("searchFilter", text);
  if (Number.isInteger(params?.categoryId)) {
    query.set("categoryId", String(params.categoryId));
  }
  // 403 (clé sans droit de recherche) → CURSEFORGE_FORBIDDEN : la page
  // masque alors l'onglet Parcourir.
  const body = await curseforgeRequest<{
    data?: SearchMod[];
    pagination?: { totalCount?: number };
  }>(`/v1/mods/search?${query}`);
  return {
    mods: (body?.data ?? []).map((mod) => ({
      ...toArkModInfo(mod),
      downloadCount: mod.downloadCount ?? 0,
      updatedAt: mod.dateModified ?? null,
      cosmetic: (mod.categories ?? []).some(
        (category) => category.id === COSMETICS_CATEGORY_ID,
      ),
      // Faux seulement si l'API le dit : un champ absent ne signale rien.
      pcOnly: mod.supportsCrossPlatform === false,
    })),
    total: Math.min(body?.pagination?.totalCount ?? 0, MAX_RESULTS),
  };
}

/** Catégories des mods ARK (filtre de Parcourir), sans la classe elle-même. */
export async function fetchArkCategories(): Promise<ArkModCategory[]> {
  const body = await curseforgeRequest<{
    data?: { id: number; name?: string; classId?: number }[];
  }>(`/v1/categories?gameId=${ARK_GAME_ID}&classId=${MODS_CLASS_ID}`);
  return (body?.data ?? [])
    .filter((category) => category.id !== MODS_CLASS_ID)
    .map((category) => ({ id: category.id, name: category.name ?? "" }));
}
