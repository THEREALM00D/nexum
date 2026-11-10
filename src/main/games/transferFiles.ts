import { join } from "path";
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
import { exportableMods } from "./valheim/pendingMods";

/**
 * Fichier (ou dossier) de config du jeu emporté par « Déplacer un serveur »
 * (`src/main/transfer/`). `key` = nom sous `config/` dans le ZIP ; à l'import,
 * la cible est toujours recalculée ici, jamais lue dans le ZIP.
 */
export interface TransferFile {
  key: string;
  path: string;
  dir?: boolean;
}

interface GameTransfer {
  configFiles: (serverPath: string, cfg: ServerConfig) => TransferFile[];
  /** Entrées du dossier des mondes à emporter (défaut : tout le dossier). */
  worldFilter?: (cfg: ServerConfig) => (entryName: string) => boolean;
  /** Mods à réinstaller par leur code sur l'autre PC (`dataDir` = {userData}/servers/<id>). */
  mods?: (serverPath: string, dataDir: string) => PendingMod[];
}

const file = (key: string, path: string): TransferFile => ({ key, path });
const VALHEIM_LISTS = ["adminlist.txt", "bannedlist.txt", "permittedlist.txt"];

// Record<GameType, …> : un nouveau jeu ne compile pas tant qu'il n'a pas dit
// quels fichiers de config suivent le serveur sur un autre PC.
const GAME_TRANSFERS: Record<GameType, GameTransfer> = {
  palworld: {
    configFiles: (p) => [file("PalWorldSettings.ini", join(p, PAL_INI))],
  },
  valheim: {
    configFiles: (p, cfg) => {
      const dataDir = valheimServerConfig.getDataDir(cfg.valheimConfig.savedir);
      return [
        ...VALHEIM_LISTS.map((n) => file(n, join(dataDir, n))),
        // Réglages des mods (les mods eux-mêmes sont réinstallés par leur code)
        {
          key: "BepInEx-config",
          path: join(p, "BepInEx", "config"),
          dir: true,
        },
      ];
    },
    // worlds_local est partagé par tous les serveurs du même savedir : seul le
    // monde du serveur (`<nom>.fwl/.db/.old` à plat ou dossier `<nom>/`) part,
    // sans les sauvegardes auto de Valheim (`<nom>_backup…`).
    worldFilter: (cfg) => {
      const world = cfg.valheimConfig.world.toLowerCase();
      return (entryName) => {
        const n = entryName.toLowerCase();
        if (n.includes("_backup")) return false;
        return n === world || n.startsWith(`${world}.`);
      };
    },
    mods: (p, dataDir) =>
      exportableMods(new ValheimModsManager(p, dataDir).list()),
  },
  astroneer: {
    configFiles: (p) => [
      file("AstroServerSettings.ini", join(p, SETTINGS_REL_PATH)),
      file("Engine.ini", join(p, ENGINE_REL_PATH)),
    ],
  },
  dragonwilds: {
    configFiles: (p) => [file("DedicatedServer.ini", join(p, DW_INI))],
  },
  enshrouded: {
    configFiles: (p) => [file(SERVER_JSON, join(p, SERVER_JSON))],
  },
};

export const getGameTransferFiles = (
  gameType: GameType,
  serverPath: string,
  cfg: ServerConfig,
): TransferFile[] => GAME_TRANSFERS[gameType].configFiles(serverPath, cfg);

export const getGameWorldFilter = (
  gameType: GameType,
  cfg: ServerConfig,
): ((entryName: string) => boolean) =>
  GAME_TRANSFERS[gameType].worldFilter?.(cfg) ?? (() => true);

export const getGameTransferMods = (
  gameType: GameType,
  serverPath: string,
  dataDir: string,
): PendingMod[] => GAME_TRANSFERS[gameType].mods?.(serverPath, dataDir) ?? [];
