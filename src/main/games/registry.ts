import { join } from "path";
import type { GameType, ServerConfig } from "../../shared/types";
import { palworldServerConfig } from "./palworld/serverConfig";
import { valheimServerConfig } from "./valheim/serverConfig";
import { astroneerServerConfig } from "./astroneer/serverConfig";
import { dragonwildsServerConfig } from "./dragonwilds/serverConfig";
import { prepareDragonwildsStart } from "./dragonwilds/startChecks";
import { enshroudedServerConfig } from "./enshrouded/serverConfig";
import { prepareEnshroudedStart } from "./enshrouded/startChecks";
import { readSettings as readEnshroudedSettings } from "./enshrouded/serverJson";
import { readDedicatedServerIni } from "./dragonwilds/dedicatedServerIni";
import type { PalConfigParser } from "./palworld/PalConfigParser";
import type { AstroConfigParser } from "./astroneer/AstroConfigParser";
import type { StopConfig } from "../server/ServerManager";
import type { GamePort } from "./ports";

// Chaque traitement par jeu est un Record<GameType, …> : ajouter un jeu à
// `GameType` fait échouer le typecheck tant qu'il manque une entrée (avant,
// des if/else retombaient sans bruit sur le comportement Palworld).
const GAME_SERVER_CONFIGS = {
  palworld: palworldServerConfig,
  valheim: valheimServerConfig,
  astroneer: astroneerServerConfig,
  dragonwilds: dragonwildsServerConfig,
  enshrouded: enshroudedServerConfig,
} satisfies Record<GameType, { exeName: string }>;

/** Jeux supportés, dans l'ordre de détection d'un dossier existant. */
export const GAME_TYPES = Object.keys(GAME_SERVER_CONFIGS) as GameType[];

export const getGameServerConfig = (type: GameType) =>
  GAME_SERVER_CONFIGS[type];

/** Parseurs de config dont dépendent les ports / l'arrêt de certains jeux. */
export interface GameConfigReaders {
  palworld: PalConfigParser;
  astroneer: AstroConfigParser;
}

// Variables d'environnement à passer au process serveur (ex : SteamAppId pour
// Valheim). Vide pour les jeux qui n'en ont pas besoin.
export function getGameEnv(type: GameType): Record<string, string> {
  const cfg = GAME_SERVER_CONFIGS[type] as { env?: Record<string, string> };
  return cfg.env ?? {};
}

const ARGS: Record<GameType, (cfg: ServerConfig) => string[]> = {
  palworld: (cfg) => palworldServerConfig.buildArgs(cfg.launchArgs),
  valheim: (cfg) => valheimServerConfig.buildArgs(cfg.valheimConfig),
  astroneer: (cfg) => astroneerServerConfig.buildArgs(cfg.astroneerConfig),
  dragonwilds: (cfg) =>
    dragonwildsServerConfig.buildArgs(cfg.dragonwildsConfig),
  enshrouded: (cfg) => enshroudedServerConfig.buildArgs(cfg.enshroudedConfig),
};

export function buildGameArgs(gameType: GameType, cfg: ServerConfig): string[] {
  return ARGS[gameType](cfg);
}

// Fichier de log que le jeu écrit lui-même, suivi par Nexum à la place de
// stdout quand celui-ci est incomplet (Dragonwilds).
const LOG_FILES: Partial<Record<GameType, (serverPath: string) => string>> = {
  dragonwilds: (p) => dragonwildsServerConfig.getLogFilePath(p),
};

export function getGameLogFile(
  gameType: GameType,
  serverPath: string,
): string | undefined {
  return LOG_FILES[gameType]?.(serverPath);
}

export interface LaunchSpec {
  exeName: string;
  args: string[];
  env: Record<string, string>;
  logFile?: string;
  /**
   * Exécuté par ServerManager.start avant CHAQUE lancement, relance après
   * plantage comprise. Renvoie un message pour refuser le démarrage.
   */
  prepare?: () => string | null;
}

const PREPARE: Partial<
  Record<GameType, (serverPath: string, cfg: ServerConfig) => string | null>
> = {
  dragonwilds: (p, cfg) => prepareDragonwildsStart(p, cfg.dragonwildsConfig),
  enshrouded: (p) => prepareEnshroudedStart(p),
};

/**
 * Tout ce qu'il faut pour lancer un serveur. Source unique pour le bouton
 * Démarrer, le redémarrage (manuel ou planifié) et le démarrage automatique.
 */
export function getLaunchSpec(
  gameType: GameType,
  serverPath: string,
  cfg: ServerConfig,
): LaunchSpec {
  return {
    exeName: GAME_SERVER_CONFIGS[gameType].exeName,
    args: buildGameArgs(gameType, cfg),
    env: getGameEnv(gameType),
    logFile: getGameLogFile(gameType, serverPath),
    prepare: PREPARE[gameType]
      ? () => PREPARE[gameType]!(serverPath, cfg)
      : undefined,
  };
}

const SAVE_PATHS: Record<
  GameType,
  (serverPath: string, cfg: ServerConfig) => string
> = {
  palworld: (p) => join(p, "Pal", "Saved", "SaveGames"),
  valheim: (_, cfg) => valheimServerConfig.getSavePath(cfg.valheimConfig),
  astroneer: (p) => astroneerServerConfig.getSavePath(p),
  dragonwilds: (p) => dragonwildsServerConfig.getSavePath(p),
  enshrouded: (p) => enshroudedServerConfig.getSavePath(p),
};

/** Dossier de sauvegarde source pour le backup. */
export function getGameSavePath(
  gameType: GameType,
  serverPath: string,
  cfg: ServerConfig,
): string {
  return SAVE_PATHS[gameType](serverPath, cfg);
}

const STOP_CONFIGS: Record<
  GameType,
  (serverPath: string, palParser: PalConfigParser) => StopConfig
> = {
  palworld: (p, parser) => palworldServerConfig.getStopConfig(p, parser),
  valheim: () => valheimServerConfig.getStopConfig(),
  astroneer: () => astroneerServerConfig.getStopConfig(),
  dragonwilds: () => dragonwildsServerConfig.getStopConfig(),
  enshrouded: () => enshroudedServerConfig.getStopConfig(),
};

export function getGameStopConfig(
  gameType: GameType,
  serverPath: string,
  configParser: PalConfigParser,
): StopConfig {
  return STOP_CONFIGS[gameType](serverPath, configParser);
}

const PORTS: Record<
  GameType,
  (
    serverPath: string,
    cfg: ServerConfig,
    readers: GameConfigReaders,
  ) => GamePort[]
> = {
  palworld: (p, _, r) => palworldServerConfig.getPorts(p, r.palworld),
  valheim: (_, cfg) => valheimServerConfig.getPorts(cfg.valheimConfig),
  astroneer: (p, _, r) => astroneerServerConfig.getPorts(p, r.astroneer),
  dragonwilds: (_, cfg) =>
    dragonwildsServerConfig.getPorts(cfg.dragonwildsConfig),
  enshrouded: (p) => enshroudedServerConfig.getPorts(p),
};

/** Ports ouverts par un serveur (conflits de ports, carte « Rejoindre »). */
export function getGamePorts(
  gameType: GameType,
  serverPath: string,
  cfg: ServerConfig,
  readers: GameConfigReaders,
): GamePort[] {
  return PORTS[gameType](serverPath, cfg, readers);
}

// Nom sous lequel les joueurs cherchent le serveur dans le jeu (carte
// « Rejoindre ») : Dragonwilds, le monde dans « Mondes → Public » (sensible
// à la casse) ; Enshrouded, le serveur dans la liste « dédiés ».
const SEARCH_NAMES: Partial<Record<GameType, (serverPath: string) => string>> =
  {
    dragonwilds: (p) => readDedicatedServerIni(p).DefaultWorldName,
    enshrouded: (p) => {
      try {
        return readEnshroudedSettings(p).name;
      } catch {
        return "";
      }
    },
  };

export function getGameSearchName(
  gameType: GameType,
  serverPath: string,
): string | undefined {
  return SEARCH_NAMES[gameType]?.(serverPath) || undefined;
}
