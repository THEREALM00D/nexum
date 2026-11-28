import type {
  AstroneerLaunchConfig,
  BackupConfig,
  DragonwildsLaunchConfig,
  EnshroudedLaunchConfig,
  LaunchArgsConfig,
} from "../../shared/types";

// Valeurs par défaut de la config d'un serveur (hors Valheim, ARK et
// redémarrage, qui ont leurs propres fichiers).
export const DEFAULT_LAUNCH_ARGS: LaunchArgsConfig = {
  publicLobby: false,
  performanceFlags: false,
  customArgs: "",
};

export const DEFAULT_ASTRONEER_CONFIG: AstroneerLaunchConfig = {
  customArgs: "",
};

export const DEFAULT_DRAGONWILDS_CONFIG: DragonwildsLaunchConfig = {
  port: 7777,
  beaconPort: 8888,
  adminPassword: "",
  customArgs: "",
};

export const DEFAULT_ENSHROUDED_CONFIG: EnshroudedLaunchConfig = {
  customArgs: "",
};

export const DEFAULT_BACKUP: BackupConfig = {
  backupDir: "",
  backupKeep: 10,
  backupIntervalMinutes: 0,
  backupBeforeUpdate: true,
};
