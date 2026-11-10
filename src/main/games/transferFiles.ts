import { dirname, join } from "path";
import type { GameType, PendingMod, ServerConfig } from "../../shared/types";
import { CONFIG_REL_PATH as PAL_INI } from "./palworld/PalConfigParser";
import {
  ENGINE_REL_PATH,
  SETTINGS_REL_PATH,
} from "./astroneer/AstroConfigParser";
import { INI_REL_PATH as DW_INI } from "./dragonwilds/dedicatedServerIni";
import { SERVER_JSON } from "./enshrouded/serverJson";
import { valheimServerConfig } from "./valheim/serverConfig";
import { ValheimModsManager } from "./valheim/ValheimModsManager";
import {
  exportableMods,
  parsePendingMods,
  writePendingMods,
} from "./valheim/pendingMods";

/**
 * Fichier (ou dossier) de config du jeu emporté par « Déplacer un serveur »
 * (`src/main/transfer/`). `key` = nom sous `config/` dans le ZIP ; à l'import,
 * la cible est toujours recalculée ici, jamais lue dans le ZIP.
 */
export interface TransferFile {
  key: string;
  path: string;
  isDirectory?: boolean;
}

interface GameTransfer {
  configFiles: (serverPath: string, config: ServerConfig) => TransferFile[];
  /** Entrées du dossier des mondes à emporter (défaut : tout le dossier). */
  worldFilter?: (config: ServerConfig) => (entryName: string) => boolean;
  /** Mods à réinstaller par leur code sur l'autre PC (`dataDir` = {userData}/servers/<id>). */
  mods?: (serverPath: string, dataDir: string) => PendingMod[];
  /** Import : mods du manifest revalidés, puis mis en attente de réinstallation. */
  parseMods?: (raw: unknown) => PendingMod[];
  restoreMods?: (dataDir: string, mods: PendingMod[]) => void;
}

const file = (key: string, path: string): TransferFile => ({ key, path });
const VALHEIM_LISTS = ["adminlist.txt", "bannedlist.txt", "permittedlist.txt"];

// Record<GameType, …> : un nouveau jeu ne compile pas tant qu'il name'a pas dit
// quels fichiers de config suivent le serveur sur un autre PC.
const GAME_TRANSFERS: Record<GameType, GameTransfer> = {
  palworld: {
    configFiles: (serverPath) => [
      file("PalWorldSettings.ini", join(serverPath, PAL_INI)),
      // `DedicatedServerName` = GUID du dossier `SaveGames/0/<GUID>` à
      // charger : sans lui, le serveur crée un monde neuf.
      file(
        "GameUserSettings.ini",
        join(serverPath, dirname(PAL_INI), "GameUserSettings.ini"),
      ),
    ],
  },
  valheim: {
    configFiles: (serverPath, config) => {
      const dataDir = valheimServerConfig.getDataDir(
        config.valheimConfig.savedir,
      );
      return [
        ...VALHEIM_LISTS.map((name) => file(name, join(dataDir, name))),
        // Réglages des mods (les mods eux-mêmes sont réinstallés par leur code)
        {
          key: "BepInEx-config",
          path: join(serverPath, "BepInEx", "config"),
          isDirectory: true,
        },
      ];
    },
    // worlds_local est partagé par tous les serveurs du même savedir : seul le
    // monde du serveur (`<nom>.fwl/.db/.old` à plat ou dossier `<nom>/`) part,
    // sans les sauvegardes auto de Valheim (`<nom>_backup…`).
    worldFilter: (config) => {
      const world = config.valheimConfig.world.toLowerCase();
      return (entryName) => {
        const name = entryName.toLowerCase();
        if (name.includes("_backup")) return false;
        return name === world || name.startsWith(`${world}.`);
      };
    },
    mods: (serverPath, dataDir) =>
      exportableMods(new ValheimModsManager(serverPath, dataDir).list()),
    parseMods: parsePendingMods,
    restoreMods: writePendingMods,
  },
  astroneer: {
    configFiles: (serverPath) => [
      file("AstroServerSettings.ini", join(serverPath, SETTINGS_REL_PATH)),
      file("Engine.ini", join(serverPath, ENGINE_REL_PATH)),
    ],
  },
  dragonwilds: {
    configFiles: (serverPath) => [
      file("DedicatedServer.ini", join(serverPath, DW_INI)),
    ],
  },
  enshrouded: {
    configFiles: (serverPath) => [
      file(SERVER_JSON, join(serverPath, SERVER_JSON)),
    ],
  },
};

export const getGameTransferFiles = (
  gameType: GameType,
  serverPath: string,
  config: ServerConfig,
): TransferFile[] => GAME_TRANSFERS[gameType].configFiles(serverPath, config);

export const getGameWorldFilter = (
  gameType: GameType,
  config: ServerConfig,
): ((entryName: string) => boolean) =>
  GAME_TRANSFERS[gameType].worldFilter?.(config) ?? (() => true);

export const getGameTransferMods = (
  gameType: GameType,
  serverPath: string,
  dataDir: string,
): PendingMod[] => GAME_TRANSFERS[gameType].mods?.(serverPath, dataDir) ?? [];

export const parseGameTransferMods = (
  gameType: GameType,
  raw: unknown,
): PendingMod[] => GAME_TRANSFERS[gameType].parseMods?.(raw) ?? [];

export const restoreGameTransferMods = (
  gameType: GameType,
  dataDir: string,
  mods: PendingMod[],
): void => {
  if (mods.length > 0) GAME_TRANSFERS[gameType].restoreMods?.(dataDir, mods);
};
