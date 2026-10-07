import type { SessionLogStore } from "../logs/SessionLogStore";
import type { BrowserWindow, App } from "electron";
import type { ServerManager } from "../server/ServerManager";
import type { SteamCMD } from "../steamcmd/SteamCMD";
import type { PalConfigParser } from "../games/palworld/PalConfigParser";
import type { AstroConfigParser } from "../games/astroneer/AstroConfigParser";
import type { SystemMonitor } from "../monitor/SystemMonitor";
import type { FirewallManager } from "../firewall/FirewallManager";
import type { BackupManager } from "../backup/BackupManager";
import type { RestartScheduler } from "../scheduler/RestartScheduler";
import type { ServerManagerRegistry } from "../servers/ServerManagerRegistry";
import type { PlayerHistoryRegistry } from "../servers/PlayerHistoryRegistry";
import type { ServerRegistry } from "../servers/ServerRegistry";
import type Store from "electron-store";
import type {
  RestartConfig,
  LaunchArgsConfig,
  Server,
  ServerConfig,
  ValheimLaunchConfig,
  AstroneerLaunchConfig,
} from "../../shared/types";

export interface AppStore {
  // Legacy globaux (Phase 1) : utilisés pour la migration vers serversConfig.
  // Plus lus directement après migration — passer par ctx.getServerConfig().
  serverPath?: string;
  launchArgs?: LaunchArgsConfig;
  autoRestart?: boolean;
  backupDir?: string;
  backupKeep?: number;
  backupIntervalMinutes?: number;
  restartSchedule?: RestartConfig;

  // Multi-serveur : liste + serveur actif + config par-serveur (Phase 2a)
  servers: Server[];
  activeServerId: string | null;
  serversConfig: Record<string, ServerConfig>;
}

export interface IpcContext {
  app: App;
  store: Store<AppStore>;
  servers: ServerRegistry;
  serverManagers: ServerManagerRegistry;
  /** Logs persistants par session (un fichier par démarrage de serveur). */
  sessionLogs: SessionLogStore;
  /**
   * Helper compat : retourne le ServerManager du serveur actif, ou lance si
   * aucun serveur n'est sélectionné. Évite de mettre `null` partout dans les
   * handlers qui supposaient déjà un serveur unique.
   */
  requireActiveManager: () => ServerManager;
  steamcmd: SteamCMD;
  configParser: PalConfigParser;
  astroConfigParser: AstroConfigParser;
  systemMonitor: SystemMonitor;
  firewall: FirewallManager;
  backup: BackupManager;
  restartScheduler: RestartScheduler;
  playerHistories: PlayerHistoryRegistry;
  broadcastLog: (serverId: string, line: string) => void;
  getBackupDir: () => string;
  getRestartConfig: () => RestartConfig;
  applyBackupScheduler: () => void;
  /**
   * Lit la config d'arrêt (REST API + creds) pour un serveur donné.
   * `serverId` est optionnel : par défaut, le serveur actif.
   */
  getStopConfig: (serverId?: string) => {
    restApiEnabled: boolean;
    restApiPort: number;
    adminPassword: string;
    shutdownWaittime: number;
    shutdownMessage: string;
    gracefulSignal?: boolean;
  };
  /** Path d'un serveur par son id (par défaut : serveur actif). */
  getServerPath: (serverId?: string) => string;
  // Multi-serveur : helpers pour récupérer le serveur actif. Tous les handlers
  // qui parlent "du serveur" doivent passer par ces helpers, jamais lire
  // serverPath directement du store.
  getActiveServer: () => Server | null;
  getActiveServerPath: () => string;
  // Met à jour le path du serveur actif (legacy compat : steamcmd/misc setServerPath).
  // Si aucun serveur n'existe encore, en crée un avec ce path.
  setActiveServerPath: (path: string) => void;

  // Accès à la config par-serveur (Phase 2a).
  // `serverId` est optionnel : par défaut, le serveur actif.
  getServerConfig: (serverId?: string) => ServerConfig;
  updateServerConfig: (
    serverId: string | undefined,
    patch: Partial<ServerConfig>,
  ) => ServerConfig;
  /** Supprime la config stockée d'un serveur (sans toucher au filesystem). */
  removeServerConfig: (serverId: string) => void;

  // Config Valheim par-serveur (launch args spécifiques à Valheim)
  getValheimConfig: (serverId?: string) => ValheimLaunchConfig;
  updateValheimConfig: (
    serverId: string | undefined,
    patch: Partial<ValheimLaunchConfig>,
  ) => void;

  // Config Astroneer par-serveur (launch args spécifiques à Astroneer)
  getAstroneerConfig: (serverId?: string) => AstroneerLaunchConfig;
  updateAstroneerConfig: (
    serverId: string | undefined,
    patch: Partial<AstroneerLaunchConfig>,
  ) => void;

  /** Dossier userData/servers/{id}/ utilisé pour stocker mods.json et les ZIPs temp. */
  getModsDataDir: (serverId?: string) => string;
}

export type BrowserWindowModule = typeof BrowserWindow;
