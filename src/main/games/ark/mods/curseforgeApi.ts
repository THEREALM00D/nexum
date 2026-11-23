import type { ArkModInfo } from "../../../../shared/types";
import { AppError, networkError } from "../../../utils/appError";
import { USER_AGENT } from "../../../utils/userAgent";
import { httpsUrl } from "./modLibrary";

// API REST CurseForge (https://docs.curseforge.com/rest-api/). Clé injectée
// au build (electron.vite.config.ts : CURSEFORGE_API_KEY de .env.local en
// dev, secret GitHub en CI), jamais dans le code : sans elle, Nexum se
// contente de library.json.
// ⚠️ Une clé de la console « for Studios » lit les mods par ID mais reçoit
// 403 sur /v1/mods/search (vérifié) : pas de recherche (issue #272).
// Conditions : rien n'est mis en cache (art. 3.1(e)), chaque ouverture de la
// page Mods redemande.
const API_KEY = import.meta.env.MAIN_VITE_CURSEFORGE_API_KEY ?? "";
const MODS_URL = "https://api.curseforge.com/v1/mods";
const ARK_GAME_ID = 83374;
const TIMEOUT_MS = 10_000;

interface ApiMod {
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
 * Fiches des mods ARK demandés, par ID. Un ID inconnu est absent de la
 * réponse ; un mod d'un autre jeu y figure, d'où le filtre sur gameId.
 */
export async function fetchArkMods(
  ids: number[],
): Promise<Map<number, ArkModInfo>> {
  const mods = new Map<number, ArkModInfo>();
  if (!curseforgeAvailable() || ids.length === 0) return mods;
  let response: Response;
  try {
    response = await fetch(MODS_URL, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify({ modIds: ids }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw networkError(MODS_URL, (error as Error).cause ?? error);
  }
  // Aucun des ID demandés n'existe : 404 sans corps (vérifié), pas une
  // liste vide.
  if (response.status === 404) return mods;
  if (!response.ok) {
    throw new AppError("HTTP_ERROR", {
      host: "api.curseforge.com",
      status: response.status,
    });
  }
  const body = (await response.json()) as { data?: ApiMod[] };
  for (const mod of body.data ?? []) {
    if (mod.gameId !== ARK_GAME_ID) continue;
    mods.set(mod.id, {
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
    });
  }
  return mods;
}
