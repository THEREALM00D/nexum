import { resolve } from "path";
import type { IpcContext } from "../../../ipc/context";
import { splitArgsMods } from "./argsMods";
import { isModId } from "./modIds";

const samePath = (first: string, second: string) =>
  resolve(first).toLowerCase() === resolve(second).toLowerCase();

/**
 * Serveurs ARK de Nexum installés dans le même dossier que celui-ci (lui
 * compris) : ils partagent `Mods/83374` (deux mondes séparés par
 * `AltSaveDirectoryName`, par exemple).
 */
export function serversSharingFolder(
  ctx: IpcContext,
  serverId: string,
): string[] {
  const serverPath = ctx.getServerPath(serverId);
  if (!serverPath) return [];
  return ctx.servers
    .list()
    .filter(
      (server) =>
        server.gameType === "ark" &&
        (server.id === serverId ||
          samePath(ctx.getServerPath(server.id), serverPath)),
    )
    .map((server) => server.id);
}

/**
 * ID qu'un de ces serveurs charge ou peut charger : sa liste (désactivés
 * compris), ses `-mods=` / `-passivemods=` perso et l'option
 * `TotalConversionMod`. Jamais proposés au nettoyage.
 */
export function usedModIds(ctx: IpcContext, serverId: string): Set<number> {
  const used = new Set<number>();
  for (const id of serversSharingFolder(ctx, serverId)) {
    const { mods, customArgs, launchOptions } = ctx.getArkConfig(id);
    for (const mod of mods) used.add(mod.id);
    const args = splitArgsMods(customArgs);
    for (const modId of [...args.ids, ...args.passiveIds]) used.add(modId);
    const totalConversion = Number(launchOptions.TotalConversionMod);
    if (isModId(totalConversion)) used.add(totalConversion);
  }
  return used;
}

/** Vrai si un serveur du même dossier tourne (fichiers de mods ouverts). */
export function folderInUse(ctx: IpcContext, serverId: string): boolean {
  return serversSharingFolder(ctx, serverId).some((id) => {
    const status = ctx.serverManagers.getOrCreate(id).getStatus();
    return status !== "stopped" && status !== "crashed";
  });
}
