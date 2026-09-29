import https from "https";
import http from "http";
import type {
  ModRegistry,
  ThunderstoreModInfo,
  ThunderstoreModVersion,
  ModUpdate,
  ModUpdateCheck,
} from "../../../shared/types";
import { REGISTRIES, REGISTRY_API_BASE, USER_AGENT } from "./registries";
// Importer les types générés depuis le spec OpenAPI Thunderstore
// Régénérer avec : yarn generate:thunderstore
// Hexium expose une API "compatible Thunderstore" avec le même schéma (mêmes
// champs, même bizarrerie owner/namespace) — on réutilise donc ces mêmes types
// générés plutôt que de dupliquer un codegen pour un second registre.
import type {
  PackageVersionExperimental,
  PackageExperimental,
} from "./thunderstore-api";

// Le endpoint v1 /c/valheim/api/v1/package/ retourne les versions avec file_size,
// champ présent dans la réponse réelle mais absent du spec (erreur du spec).
type RegistryVersion = PackageVersionExperimental & { file_size?: number };

// Le Swagger spec décrit incorrectement le endpoint v1 community list :
// - rating_score est un nombre dans la réponse réelle (string dans PackageListing)
// - is_deprecated est un boolean réel (string dans PackageListing)
// - versions est RegistryVersion[] réel (string dans PackageListing)
// On redéfinit proprement en réutilisant PackageVersionExperimental.
interface RegistryPackage extends Omit<
  PackageExperimental,
  "latest" | "community_listings" | "rating_score" | "is_deprecated"
> {
  name: string;
  full_name: string;
  owner: string;
  date_created: string;
  date_updated: string;
  rating_score: number;
  is_deprecated: boolean;
  versions: RegistryVersion[];
}

function hashString(s: string): number {
  let h = 5381;
  for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
  return Math.abs(h) || 1;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

export class ModRegistryClient {
  private static cache = new Map<
    ModRegistry,
    { data: RegistryPackage[]; ts: number }
  >();

  private static fetchJson<T>(url: string, depth = 0): Promise<T> {
    if (depth > 5) return Promise.reject(new Error("Trop de redirections"));
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const mod = parsed.protocol === "https:" ? https : http;
      mod
        .get(
          {
            hostname: parsed.hostname,
            path: parsed.pathname + parsed.search,
            headers: {
              "User-Agent": USER_AGENT,
              Accept: "application/json",
            },
          },
          (res) => {
            if (
              res.statusCode &&
              res.statusCode >= 300 &&
              res.statusCode < 400 &&
              res.headers.location
            ) {
              res.resume();
              ModRegistryClient.fetchJson<T>(res.headers.location, depth + 1)
                .then(resolve)
                .catch(reject);
              return;
            }
            if (res.statusCode && res.statusCode >= 400) {
              res.resume();
              reject(new Error(`Erreur API registre ${res.statusCode}`));
              return;
            }
            let data = "";
            res.on("data", (c: string) => (data += c));
            res.on("end", () => {
              try {
                resolve(JSON.parse(data) as T);
              } catch {
                reject(
                  new Error(
                    `Réponse JSON invalide (${res.statusCode}): ${data.slice(0, 120)}`,
                  ),
                );
              }
            });
          },
        )
        .on("error", reject);
    });
  }

  // Récupère tous les packages Valheim d'un registre, avec cache TTL 5 min par registre.
  // ⚠️ Les packages dépréciés sont CONSERVÉS (flag `is_deprecated`) : il faut
  // pouvoir les signaler sur les mods installés et dans la recherche. Les
  // listes de découverte (tendances, récents) les excluent via `active()`.
  static async listPackages(registry: ModRegistry): Promise<RegistryPackage[]> {
    const now = Date.now();
    const cached = ModRegistryClient.cache.get(registry);
    if (cached && now - cached.ts < CACHE_TTL_MS) return cached.data;

    const data = await ModRegistryClient.fetchJson<RegistryPackage[]>(
      `${REGISTRY_API_BASE[registry]}/c/valheim/api/v1/package/`,
    );
    const filtered = data.filter((p) => p.versions.length > 0);
    ModRegistryClient.cache.set(registry, { data: filtered, ts: now });
    return filtered;
  }

  private static active(pkgs: RegistryPackage[]): RegistryPackage[] {
    return pkgs.filter((p) => !p.is_deprecated);
  }

  // Cherche un package dans le cache puis dans la liste complète d'un registre
  static async getPackage(
    registry: ModRegistry,
    namespace: string,
    name: string,
  ): Promise<RegistryPackage> {
    const pkgs = await ModRegistryClient.listPackages(registry);
    const pkg = pkgs.find((p) => p.owner === namespace && p.name === name);
    if (!pkg) throw new Error(`Package ${namespace}-${name} introuvable`);
    return pkg;
  }

  // Essaie tous les registres à tour de rôle jusqu'à trouver le package —
  // utile quand on ne sait pas d'où vient un code (ex: profil r2modman/Gale
  // qui peut mélanger Thunderstore et Hexium dans un seul profil).
  static async getPackageAnyRegistry(
    namespace: string,
    name: string,
    preferred?: ModRegistry,
  ): Promise<{ registry: ModRegistry; pkg: RegistryPackage }> {
    const order = preferred
      ? [preferred, ...REGISTRIES.filter((r) => r !== preferred)]
      : REGISTRIES;
    // Une version maintenue sur un autre registre est préférée à une version
    // dépréciée sur le registre préféré ; à défaut on garde la dépréciée.
    let deprecatedHit: { registry: ModRegistry; pkg: RegistryPackage } | null =
      null;
    let lastError: unknown;
    for (const registry of order) {
      try {
        const pkg = await ModRegistryClient.getPackage(
          registry,
          namespace,
          name,
        );
        if (!pkg.is_deprecated) return { registry, pkg };
        deprecatedHit ??= { registry, pkg };
      } catch (e) {
        lastError = e;
      }
    }
    if (deprecatedHit) return deprecatedHit;
    throw lastError ?? new Error(`Package ${namespace}-${name} introuvable`);
  }

  static toModInfo(
    pkg: RegistryPackage,
    registry: ModRegistry,
  ): ThunderstoreModInfo {
    const v = pkg.versions[0];
    return {
      mod_id: hashString(pkg.full_name),
      name: pkg.name,
      summary: v.description,
      picture_url: v.icon ?? undefined,
      version: v.version_number,
      author: pkg.owner,
      endorsement_count: pkg.rating_score,
      updated_timestamp: Math.floor(
        new Date(pkg.date_updated).getTime() / 1000,
      ),
      registry,
      deprecated: pkg.is_deprecated,
    };
  }

  static toModFiles(pkg: RegistryPackage): ThunderstoreModVersion[] {
    return pkg.versions
      .filter((v) => v.is_active !== false)
      .map((v) => ({
        file_id: hashString(v.version_number + (pkg.full_name ?? "")),
        file_name: v.version_number,
        version: v.version_number,
        size_kb: v.file_size ? Math.round(v.file_size / 1024) : 0,
        category_name: "MAIN",
        description: v.description,
        uploaded_timestamp: v.date_created
          ? Math.floor(new Date(v.date_created).getTime() / 1000)
          : 0,
      }));
  }

  static async getTrending(
    registry: ModRegistry,
    limit = 20,
  ): Promise<ThunderstoreModInfo[]> {
    const pkgs = ModRegistryClient.active(
      await ModRegistryClient.listPackages(registry),
    );
    return pkgs
      .sort((a, b) => b.rating_score - a.rating_score)
      .slice(0, limit)
      .map((p) => ModRegistryClient.toModInfo(p, registry));
  }

  static async getLatestAdded(
    registry: ModRegistry,
    limit = 20,
  ): Promise<ThunderstoreModInfo[]> {
    const pkgs = ModRegistryClient.active(
      await ModRegistryClient.listPackages(registry),
    );
    return pkgs
      .sort(
        (a, b) =>
          new Date(b.date_created).getTime() -
          new Date(a.date_created).getTime(),
      )
      .slice(0, limit)
      .map((p) => ModRegistryClient.toModInfo(p, registry));
  }

  static async getLatestUpdated(
    registry: ModRegistry,
    limit = 20,
  ): Promise<ThunderstoreModInfo[]> {
    const pkgs = ModRegistryClient.active(
      await ModRegistryClient.listPackages(registry),
    );
    return pkgs
      .sort(
        (a, b) =>
          new Date(b.date_updated).getTime() -
          new Date(a.date_updated).getTime(),
      )
      .slice(0, limit)
      .map((p) => ModRegistryClient.toModInfo(p, registry));
  }

  static async search(
    registry: ModRegistry,
    query: string,
    limit = 50,
  ): Promise<ThunderstoreModInfo[]> {
    const q = query.toLowerCase();
    const pkgs = await ModRegistryClient.listPackages(registry);
    return (
      pkgs
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.full_name ?? "").toLowerCase().includes(q) ||
            (p.owner ?? "").toLowerCase().includes(q) ||
            p.versions[0]?.description.toLowerCase().includes(q),
        )
        // Dépréciés gardés (on peut chercher un mod qu'on connaît) mais en fin
        // de liste — sort() est stable, l'ordre d'origine est conservé sinon.
        .sort((a, b) => Number(a.is_deprecated) - Number(b.is_deprecated))
        .slice(0, limit)
        .map((p) => ModRegistryClient.toModInfo(p, registry))
    );
  }

  // Retourne les dépendances non installées d'un package (exclut BepInExPack_Valheim).
  // Cherche chaque dépendance dans le même registre que le package parent
  // d'abord, puis dans les autres registres (un mod Hexium peut dépendre d'un
  // mod resté sur Thunderstore, et inversement).
  static async getMissingDeps(
    registry: ModRegistry,
    namespace: string,
    name: string,
    installedCodes: string[],
  ): Promise<ThunderstoreModInfo[]> {
    let pkg: RegistryPackage;
    try {
      pkg = await ModRegistryClient.getPackage(registry, namespace, name);
    } catch {
      return [];
    }

    const latestVersion = pkg.versions[0];
    if (!latestVersion) return [];

    // L'API retourne string[] malgré le spec qui dit string
    const deps = (latestVersion.dependencies as unknown as string[]) ?? [];
    if (!Array.isArray(deps) || deps.length === 0) return [];

    // "namespace-name" des mods déjà installés (sans version)
    const installedKeys = new Set(
      installedCodes.filter(Boolean).map((c) => {
        const parts = c.split("-");
        return parts.length >= 3
          ? parts.slice(0, parts.length - 1).join("-")
          : c;
      }),
    );

    const result: ThunderstoreModInfo[] = [];

    for (const dep of deps) {
      const parts = dep.split("-");
      if (parts.length < 3) continue;
      const depName = parts[parts.length - 2];
      const depNamespace = parts.slice(0, parts.length - 2).join("-");
      const depKey = `${depNamespace}-${depName}`;

      if (depName === "BepInExPack_Valheim") continue;
      if (installedKeys.has(depKey)) continue;

      try {
        const { registry: depRegistry, pkg: depPkg } =
          await ModRegistryClient.getPackageAnyRegistry(
            depNamespace,
            depName,
            registry,
          );
        result.push(ModRegistryClient.toModInfo(depPkg, depRegistry));
      } catch {
        // dépendance introuvable sur aucun registre connu — ignorée
      }
    }

    return result;
  }

  // Retourne les mods installés qui ont une version plus récente disponible.
  // Cherche d'abord sur le registre d'origine du mod, puis sur les autres —
  // un mod peut être déprécié/gelé sur son registre d'origine et continuer
  // d'être maintenu ailleurs (cas Azumatt : mods figés sur Thunderstore,
  // toujours à jour sur Hexium). `sourceChanged` signale ce cas à l'UI, à la
  // manière de Gale qui prévient explicitement du changement de source.
  // Renvoie aussi les mods dont le package est déprécié sur leur registre
  // d'origine (`deprecatedCodes`), pour les signaler dans l'UI.
  static async checkUpdates(
    installed: { code: string; registry: ModRegistry }[],
  ): Promise<ModUpdateCheck> {
    const packagesByRegistry = new Map<ModRegistry, RegistryPackage[]>();
    for (const registry of REGISTRIES) {
      packagesByRegistry.set(
        registry,
        await ModRegistryClient.listPackages(registry),
      );
    }

    const updates: ModUpdate[] = [];
    const deprecatedCodes: string[] = [];

    for (const { code, registry } of installed) {
      if (!code) continue;
      const parts = code.split("-");
      if (parts.length < 3) continue;
      const installedVersion = parts[parts.length - 1];
      const modName = parts[parts.length - 2];
      const modNamespace = parts.slice(0, parts.length - 2).join("-");
      const findIn = (r: ModRegistry) =>
        packagesByRegistry
          .get(r)!
          .find((p) => p.owner === modNamespace && p.name === modName);

      if (findIn(registry)?.is_deprecated) deprecatedCodes.push(code);

      // Registre d'origine en premier, puis les autres — dès qu'un registre
      // propose une version différente de celle installée, on s'arrête là.
      const searchOrder = [
        registry,
        ...REGISTRIES.filter((r) => r !== registry),
      ];
      for (const candidateRegistry of searchOrder) {
        const pkg = findIn(candidateRegistry);
        // Un package déprécié ne propose pas de mise à jour : on continue sur
        // les autres registres (même comportement qu'avant, quand ils étaient
        // exclus du cache).
        if (!pkg || pkg.is_deprecated) continue;
        const latestVersion = pkg?.versions[0]?.version_number;
        if (!latestVersion || latestVersion === installedVersion) continue;

        updates.push({
          installedCode: code,
          latestCode: `${modNamespace}-${modName}-${latestVersion}`,
          latestVersion,
          name: pkg.name,
          author: pkg.owner,
          registry: candidateRegistry,
          sourceChanged: candidateRegistry !== registry,
        });
        break;
      }
    }

    return { updates, deprecatedCodes };
  }
}
