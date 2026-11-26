import type { GameType } from "../../shared/types";
import type { IpcContext } from "../ipc/context";
import { destroyWildDinosAfterStart } from "./ark/wildDinos";

type AfterStartTask = (ctx: IpcContext, serverId: string) => Promise<void>;

// Record<GameType, …> : un nouveau jeu dit s'il a une tâche à lancer une
// fois le serveur démarré.
const AFTER_START: Record<GameType, AfterStartTask | null> = {
  palworld: null,
  valheim: null,
  astroneer: null,
  dragonwilds: null,
  enshrouded: null,
  // Renouvellement des créatures sauvages (option de la page Planification).
  ark: destroyWildDinosAfterStart,
};

/**
 * Tâche propre au jeu après un démarrage réussi (bouton, démarrage auto,
 * redémarrage, relance après plantage). Non attendue, best-effort.
 */
export function runAfterStartTask(
  ctx: IpcContext,
  serverId: string,
  gameType: GameType,
): void {
  AFTER_START[gameType]?.(ctx, serverId).catch(() => {});
}
