import type { IpcContext } from "../../../ipc/context";
import { appError } from "../../../utils/appError";

/**
 * Erreur codée si le serveur tourne, null s'il est arrêté. ⚠️ ARK réécrit
 * GameUserSettings.ini et Game.ini à l'arrêt avec ce qu'il a lu au
 * démarrage (vérifié) : toute écriture faite serveur lancé serait perdue.
 */
export function arkConfigLockedError(
  ctx: IpcContext,
  serverId: string,
): string | null {
  const status = ctx.serverManagers.getOrCreate(serverId).getStatus();
  return status === "stopped" || status === "crashed"
    ? null
    : appError("CONFIG_LOCKED");
}
