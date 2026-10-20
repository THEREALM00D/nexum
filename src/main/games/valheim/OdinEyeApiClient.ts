import http from "http";
import https from "https";
import { URL } from "url";
import type { OdinEyePlayer } from "../../../shared/types";
import { AppError } from "../../utils/appError";

/**
 * URL saisie par l'utilisateur → URL exploitable. Le schéma est ajouté s'il
 * manque : « 127.0.0.1:21618 » faisait échouer `new URL` et le suivi restait
 * muet (erreurs avalées par le tracker), sans aucun indice dans l'UI.
 */
export function parseOdinEyeUrl(raw: string): URL {
  const trimmed = raw.trim();
  if (!trimmed) throw new AppError("ODIN_EYE_NO_URL");
  const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `http://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol === "http:" || url.protocol === "https:") return url;
  } catch {
    // traité ci-dessous
  }
  throw new AppError("ODIN_EYE_INVALID_URL", { url: trimmed });
}

// Client pour le plugin BepInEx tiers Odin-Eye (https://sparcopt.github.io/odin-eye/),
// qui expose les données du serveur Valheim via une API REST JSON. Pas d'auth à
// ce jour côté plugin — `baseUrl` doit pointer sur 127.0.0.1 (jamais exposé
// publiquement), même logique que l'avertissement Palworld.
// Erreurs levées en `AppError` (codes `ODIN_EYE_*`) : affichées telles quelles
// par le bouton « Tester » et le bandeau du Dashboard.
export class OdinEyeApiClient {
  constructor(private baseUrl: string) {}

  private request<T>(path: string): Promise<T> {
    return new Promise((resolve, reject) => {
      let url: URL;
      try {
        url = new URL(path, parseOdinEyeUrl(this.baseUrl));
      } catch (e) {
        reject(e as Error);
        return;
      }
      const shown = url.host;
      const client = url.protocol === "https:" ? https : http;
      const req = client.request(
        {
          hostname: url.hostname,
          port: url.port || (url.protocol === "https:" ? 443 : 80),
          path: `${url.pathname}${url.search}`,
          method: "GET",
          timeout: 8000,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            if (
              res.statusCode &&
              res.statusCode >= 200 &&
              res.statusCode < 300
            ) {
              try {
                resolve(data ? (JSON.parse(data) as T) : (undefined as T));
              } catch {
                // Autre chose qu'Odin-Eye répond sur ce port (page HTML…).
                reject(new AppError("ODIN_EYE_NO_ENDPOINT", { url: shown }));
              }
            } else {
              reject(
                new AppError("ODIN_EYE_HTTP", {
                  url: shown,
                  status: res.statusCode ?? 0,
                }),
              );
            }
          });
        },
      );
      req.on("error", () =>
        reject(new AppError("ODIN_EYE_UNREACHABLE", { url: shown })),
      );
      req.on("timeout", () => {
        req.destroy();
        reject(new AppError("ODIN_EYE_TIMEOUT", { url: shown }));
      });
      req.end();
    });
  }

  // Le plugin v1.0.0.0 expose `/players` (tableau JSON) alors que la doc en
  // ligne décrit `/v1/players` (`{ entries: [...] }`). Tout chemin inconnu
  // répond un 200 au corps vide : on essaie les deux et on échoue plutôt que de
  // traiter un corps vide comme « aucun joueur » (le tracker fermerait alors
  // toutes les sessions ouvertes à tort).
  private async fetchPlayerList(): Promise<Partial<OdinEyePlayer>[]> {
    for (const path of ["/players", "/v1/players"]) {
      const res = await this.request<
        | Partial<OdinEyePlayer>[]
        | { entries: Partial<OdinEyePlayer>[] }
        | undefined
      >(path);
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.entries)) return res.entries;
    }
    throw new AppError("ODIN_EYE_NO_ENDPOINT", {
      url: parseOdinEyeUrl(this.baseUrl).host,
    });
  }

  // Adapte les champs Odin-Eye au format attendu par PlayerHistoryTracker
  // (userId, playerId) — pas d'IP disponible côté API. Le plugin renvoie du
  // PascalCase (`SteamId: "Steam_7656119…"`), la doc du camelCase : on lit les
  // deux et on retire le préfixe `Steam_` pour retrouver le SteamID64 nu
  // (même format que adminlist.txt).
  async getPlayers(): Promise<{
    players: { userId: string; playerId: string; name: string }[];
  }> {
    const list = await this.fetchPlayerList();
    const players = list.flatMap((raw) => {
      const p = raw as Record<string, unknown>;
      const pick = (key: string): string => {
        const v = p[key] ?? p[key.charAt(0).toLowerCase() + key.slice(1)];
        return v === undefined || v === null ? "" : String(v);
      };
      const name = pick("Name");
      const userId = (pick("SteamId") || pick("Id") || name).replace(
        /^Steam_/,
        "",
      );
      if (!userId) return [];
      return [{ userId, playerId: pick("Id") || userId, name: name || userId }];
    });
    return { players };
  }
}
