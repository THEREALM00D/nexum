import type { GameType, ServerConfig } from "../../shared/types";
import type { PalConfigParser } from "./palworld/PalConfigParser";
import { palworldServerConfig } from "./palworld/serverConfig";
import { PalworldApiClient } from "./palworld/PalworldApiClient";
import { readRconSettings } from "./ark/gameUserSettingsIni";
import { ArkRconClient } from "./ark/ArkRconClient";

/**
 * Sauvegarde « à chaud » demandée au jeu avant de zipper le monde d'un
 * serveur lancé. Sans elle, la sauvegarde contient la dernière
 * autosauvegarde du jeu (voir `backupServer`).
 */
export type GameSaveRequest =
  | { run: () => Promise<void> }
  | { unavailable: "noCommand" | "restApiDisabled" | "rconDisabled" };

const NO_COMMAND: GameSaveRequest = { unavailable: "noCommand" };

// Record<GameType, …> : un nouveau jeu ne compile pas tant qu'il n'a pas dit
// s'il sait sauvegarder sur commande. Le reste (attente des fichiers stables,
// lignes de log) est commun à tous les jeux.
const SAVE_REQUESTS: Record<
  GameType,
  (
    serverPath: string,
    palParser: PalConfigParser,
    serverConfig: ServerConfig,
  ) => GameSaveRequest
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
  // SaveWorld en RCON (synchrone), seulement si RCON est activé dans l'INI.
  ark: (serverPath, _palParser, serverConfig) => {
    const rcon = readRconSettings(serverPath, serverConfig.arkConfig.rconPort);
    if (!rcon.enabled) return { unavailable: "rconDisabled" };
    const client = new ArkRconClient(rcon.port, rcon.password);
    return { run: () => client.save() };
  },
};

export function getGameSaveRequest(
  gameType: GameType,
  serverPath: string,
  palParser: PalConfigParser,
  serverConfig: ServerConfig,
): GameSaveRequest {
  return SAVE_REQUESTS[gameType](serverPath, palParser, serverConfig);
}
