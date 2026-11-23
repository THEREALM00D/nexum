import { ipcMain } from "electron/main";
import type { IpcContext } from "../../../ipc/context";
import type {
  ArkMod,
  ArkModInfo,
  ArkModsState,
  ArkModSearchParams,
} from "../../../../shared/types";
import { appError } from "../../../utils/appError";
import { isModId, sanitizeArkMods } from "../launchConfig";
import { splitArgsMods } from "../mods/argsMods";
import { readModLibrary } from "../mods/modLibrary";
import { curseforgeAvailable, fetchArkMods } from "../mods/curseforgeApi";
import { fetchArkCategories, searchArkMods } from "../mods/curseforgeSearch";

type Result = { success: boolean; error?: string };

// Liste gardée par Nexum (arkConfig.mods), lue par le serveur au démarrage :
// pas de verrou serveur lancé, la page dit que ça s'applique au prochain
// démarrage. Toujours un serverId explicite (src/main/servers/CLAUDE.md).
export function registerArkModsHandlers(ctx: IpcContext): void {
  ipcMain.handle(
    "ark:mods:get",
    async (_, serverId: string): Promise<ArkModsState> => {
      const { mods, customArgs } = ctx.getArkConfig(serverId);
      const library = readModLibrary(ctx.getServerPath(serverId));
      // Mods pas encore téléchargés par le serveur : fiche CurseForge si le
      // build a une clé. Hors ligne ou API en erreur : les ID seuls.
      const missing = mods
        .filter((mod) => !library.has(mod.id))
        .map((mod) => mod.id);
      let fetched = new Map<number, ArkModInfo>();
      try {
        fetched = await fetchArkMods(missing);
      } catch {
        // Rien à signaler : la liste reste utilisable.
      }
      const listed = new Set(mods.map((mod) => mod.id));
      return {
        mods: mods.map((mod) => ({
          ...mod,
          info: library.get(mod.id) ?? fetched.get(mod.id) ?? null,
        })),
        downloadedNotListed: [...library.values()].filter(
          (info) => !listed.has(info.id),
        ),
        argsMods: splitArgsMods(customArgs).ids,
        lookupAvailable: curseforgeAvailable(),
      };
    },
  );

  // Ajout en fin de liste. Avec une clé, l'ID est vérifié : un ID inconnu
  // empêche le serveur de démarrer (« Mods not installed », vérifié). API
  // injoignable : ajouté quand même, le serveur tranchera.
  ipcMain.handle(
    "ark:mods:add",
    async (_, serverId: string, id: number): Promise<Result> => {
      if (!isModId(id)) {
        return {
          success: false,
          error: appError("ARK_MOD_ID_INVALID", { id }),
        };
      }
      const isListed = () =>
        ctx.getArkConfig(serverId).mods.some((mod) => mod.id === id);
      const duplicate = {
        success: false,
        error: appError("ARK_MOD_DUPLICATE", { id }),
      };
      if (isListed()) return duplicate;
      const known = readModLibrary(ctx.getServerPath(serverId)).has(id);
      if (!known && curseforgeAvailable()) {
        try {
          if (!(await fetchArkMods([id])).has(id)) {
            return {
              success: false,
              error: appError("ARK_MOD_NOT_FOUND", { id }),
            };
          }
        } catch {
          // Vérification impossible : on garde l'ID.
        }
      }
      // Relue après l'appel réseau (jusqu'à 10 s) : une modification faite
      // entre-temps n'est pas écrasée.
      if (isListed()) return duplicate;
      const { mods } = ctx.getArkConfig(serverId);
      ctx.updateArkConfig(serverId, {
        mods: [...mods, { id, enabled: true }],
      });
      return { success: true };
    },
  );

  // Ordre, activation, retrait : la liste complète remplace l'ancienne.
  ipcMain.handle(
    "ark:mods:set",
    (_, serverId: string, mods: ArkMod[]): Result => {
      ctx.updateArkConfig(serverId, { mods: sanitizeArkMods(mods) });
      return { success: true };
    },
  );

  // Onglet Parcourir : ne dépend d'aucun serveur. Erreurs codées (réseau,
  // HTTP, pas de clé) renvoyées telles quelles au renderer.
  ipcMain.handle("ark:mods:search", (_, params: ArkModSearchParams) =>
    searchArkMods(params),
  );
  ipcMain.handle("ark:mods:categories", () => fetchArkCategories());

  // Déplace les -mods= des arguments perso à la fin de la liste.
  ipcMain.handle("ark:mods:takeFromArgs", (_, serverId: string): Result => {
    const { mods, customArgs } = ctx.getArkConfig(serverId);
    const { ids, rest } = splitArgsMods(customArgs);
    const added = ids
      .filter((id) => !mods.some((mod) => mod.id === id))
      .map((id) => ({ id, enabled: true }));
    ctx.updateArkConfig(serverId, {
      mods: [...mods, ...added],
      customArgs: rest.join(" "),
    });
    return { success: true };
  });
}
