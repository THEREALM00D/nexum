import type { ArkModInfo } from "../../../../shared/types";
import { AppError, networkError } from "../../../utils/appError";
import { USER_AGENT } from "../../../utils/userAgent";
import { httpsUrl } from "./modLibrary";

// API REST CurseForge (https://docs.curseforge.com/rest-api/). Clé injectée
// au build (electron.vite.config.ts : CURSEFORGE_API_KEY de .env.local en
// dev, secret GitHub en CI), jamais dans le code : sans elle, Nexum se
// contente de library.json et n'a pas d'onglet Parcourir.
// ⚠️ Une clé sans accès à la recherche reçoit 403 sur /v1/mods/search tout en
// lisant les mods par ID (vérifié avec une clé de la console « for Studios »).
// Conditions : rien n'est mis en cache (art. 3.1(e)), chaque ouverture de la
// page Mods redemande.
const API_KEY = import.meta.env.MAIN_VITE_CURSEFORGE_API_KEY ?? "";
const API_BASE = "https://api.curseforge.com";
export const ARK_GAME_ID = 83374;
const TIMEOUT_MS = 10_000;

export interface ApiMod {
  id: number;
  gameId: number;
  name?: string;
  summary?: string;
  links?: { websiteUrl?: string };
  logo?: { thumbnailUrl?: string } | null;
  authors?: { name?: string }[];
}

export const curseforgeAvailable = (): boolean => API_KEY !== "";

/**
 * Appel de l'API. null : 404 (aucun ID trouvé pour POST /v1/mods, réponse
 * sans corps, vérifié). Erreurs codées : réseau ou statut HTTP.
 */
export async function curseforgeRequest<T>(
  path: string,
  body?: unknown,
): Promise<T | null> {
  if (!curseforgeAvailable()) throw new AppError("CURSEFORGE_UNAVAILABLE");
  const url = `${API_BASE}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw networkError(url, (error as Error).cause ?? error);
  }
  if (response.status === 404) return null;
  // Clé refusée pour cet appel (une clé « for Studios » reçoit 403 sur la
  // recherche, vérifié) : code dédié, la page Mods masque Parcourir.
  if (response.status === 403) throw new AppError("CURSEFORGE_FORBIDDEN");
  if (!response.ok) {
    throw new AppError("HTTP_ERROR", {
      host: "api.curseforge.com",
      status: response.status,
    });
  }
  return (await response.json()) as T;
}

/** Fiche d'un mod de l'API, au format commun (library.json ou API). */
export function toArkModInfo(mod: ApiMod): ArkModInfo {
  return {
    id: mod.id,
    name: mod.name ?? "",
    summary: mod.summary ?? "",
    logoUrl: httpsUrl(mod.logo?.thumbnailUrl),
    authors: (mod.authors ?? [])
      .map((author) => author.name ?? "")
      .filter(Boolean),
    websiteUrl: httpsUrl(mod.links?.websiteUrl),
    // L'API ne dit pas si un mod est payant : library.json seulement.
    premium: false,
    installedFile: null,
    installedFileDate: null,
  };
}

/**
 * Fiches des mods ARK demandés, par ID. Un ID inconnu est absent de la
 * réponse ; un mod d'un autre jeu y figure, d'où le filtre sur gameId.
 */
export async function fetchArkMods(
  ids: number[],
): Promise<Map<number, ArkModInfo>> {
  const mods = new Map<number, ArkModInfo>();
  if (!curseforgeAvailable() || ids.length === 0) return mods;
  const body = await curseforgeRequest<{ data?: ApiMod[] }>("/v1/mods", {
    modIds: ids,
  });
  for (const mod of body?.data ?? []) {
    if (mod.gameId === ARK_GAME_ID) mods.set(mod.id, toArkModInfo(mod));
  }
  return mods;
}
