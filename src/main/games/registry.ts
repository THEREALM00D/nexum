import type { GameType, ServerConfig } from "../../shared/types";
import { palworldServerConfig } from "./palworld/serverConfig";
import { valheimServerConfig } from "./valheim/serverConfig";
import { astroneerServerConfig } from "./astroneer/serverConfig";
import type { PalConfigParser } from "./palworld/PalConfigParser";

const GAME_SERVER_CONFIGS = {
  palworld: palworldServerConfig,
  valheim: valheimServerConfig,
  astroneer: astroneerServerConfig,
};

export const getGameServerConfig = (type: GameType) =>
  GAME_SERVER_CONFIGS[type];

// Variables d'environnement à passer au process serveur (ex : SteamAppId pour
// Valheim). Vide pour les jeux qui n'en ont pas besoin.
export function getGameEnv(type: GameType): Record<string, string> {
  const cfg = GAME_SERVER_CONFIGS[type] as { env?: Record<string, string> };
  return cfg.env ?? {};
}

export function buildGameArgs(gameType: GameType, cfg: ServerConfig): string[] {
  if (gameType === "valheim")
    return valheimServerConfig.buildArgs(cfg.valheimConfig);
  if (gameType === "astroneer")
    return astroneerServerConfig.buildArgs(cfg.astroneerConfig);
  return palworldServerConfig.buildArgs(cfg.launchArgs);
}

/**
 * Résout le dossier de sauvegarde source pour le backup (undefined = laisser
 * BackupManager utiliser son défaut Palworld, à l'intérieur de serverPath).
 */
export function getGameSavePath(
  gameType: GameType,
  serverPath: string,
  cfg: ServerConfig,
): string | undefined {
  if (gameType === "valheim")
    return valheimServerConfig.getSavePath(cfg.valheimConfig);
  if (gameType === "astroneer")
    return astroneerServerConfig.getSavePath(serverPath);
  return undefined;
}

export function getGameStopConfig(
  gameType: GameType,
  serverPath: string,
  configParser: PalConfigParser,
) {
  if (gameType === "valheim") return valheimServerConfig.getStopConfig();
  if (gameType === "astroneer") return astroneerServerConfig.getStopConfig();
  return palworldServerConfig.getStopConfig(serverPath, configParser);
}
