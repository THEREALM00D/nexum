import type { GameType } from "../../shared/types";
import type { PalConfigParser } from "./palworld/PalConfigParser";
import { palworldServerConfig } from "./palworld/serverConfig";
import { PalworldApiClient } from "./palworld/PalworldApiClient";

/**
 * Sauvegarde « à chaud » demandée au jeu avant de zipper le monde d'un
 * serveur lancé. Sans elle, la sauvegarde contient la dernière
 * autosauvegarde du jeu (voir `backupServer`).
 */
export type GameSaveRequest =
  | { run: () => Promise<void> }
  | { unavailable: "noCommand" | "restApiDisabled" };

const NO_COMMAND: GameSaveRequest = { unavailable: "noCommand" };

// Record<GameType, …> : un nouveau jeu ne compile pas tant qu'il n'a pas dit
// s'il sait sauvegarder sur commande. Le reste (attente des fichiers stables,
// lignes de log) est commun à tous les jeux.
const SAVE_REQUESTS: Record<
  GameType,
  (serverPath: string, palParser: PalConfigParser) => GameSaveRequest
> = {
  // API REST (POST /v1/api/save), seulement si elle est activée dans l'INI.
  palworld: (p, parser) => {
    const cfg = palworldServerConfig.getStopConfig(p, parser);
    if (!cfg.restApiEnabled) return { unavailable: "restApiDisabled" };
    const client = new PalworldApiClient(cfg.restApiPort, cfg.adminPassword);
    return { run: () => client.save() };
  },
  // Ni commande sur stdin ni API (Valheim, Dragonwilds, Enshrouded) ;
  // Astroneer aurait DSSaveGame en RCON, que Nexum n'implémente pas.
  valheim: () => NO_COMMAND,
  astroneer: () => NO_COMMAND,
  dragonwilds: () => NO_COMMAND,
  enshrouded: () => NO_COMMAND,
};

export function getGameSaveRequest(
  gameType: GameType,
  serverPath: string,
  palParser: PalConfigParser,
): GameSaveRequest {
  return SAVE_REQUESTS[gameType](serverPath, palParser);
}
