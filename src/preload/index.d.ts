import type {
  SystemStats,
  PalServerInfo,
  PalPlayer,
  PalMetrics,
  BackupEntry,
  BackupConfig,
  RestartConfig,
  FirewallRuleStatus,
  FirewallNamedRule,
  LaunchAtLoginState,
  UpdateCheckResult,
  GameUpdateNotice,
  ModUpdateNotice,
  AppUpdateStatus,
  LaunchArgsConfig,
  ValheimLaunchConfig,
  ValheimWorldInfo,
  AstroneerLaunchConfig,
  AstroneerSettings,
  DragonwildsLaunchConfig,
  DragonwildsSettings,
  DragonwildsWorld,
  ValheimMod,
  ValheimModConfigFile,
  ModRegistry,
  ThunderstoreModInfo,
  ThunderstoreModVersion,
  ModUpdateCheck,
  ModpackShare,
  PlayerHistoryEntry,
  Server,
  GameType,
  ServerStatus,
  ServerLogEvent,
  JoinInfo,
  LogSession,
} from "../shared/types";

interface API {
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
  };
  config: {
    getServerPath: () => Promise<string>;
    setServerPath: (path: string) => Promise<void>;
  };
  update: {
    getCurrentVersion: () => Promise<string>;
    getStatus: () => Promise<AppUpdateStatus>;
    check: () => Promise<void>;
    download: () => Promise<void>;
    install: () => Promise<void>;
    onStatus: (cb: (status: AppUpdateStatus) => void) => () => void;
  };
  servers: {
    list: () => Promise<Server[]>;
    getActive: () => Promise<Server | null>;
    setActive: (id: string | null) => Promise<void>;
    create: (input: {
      name: string;
      path: string;
      gameType?: GameType;
      color?: string | null;
      autoStart?: boolean;
    }) => Promise<Server>;
    update: (
      id: string,
      patch: Partial<{
        name: string;
        path: string;
        gameType: GameType;
        color: string | null;
        autoStart: boolean;
      }>,
    ) => Promise<Server>;
    delete: (id: string) => Promise<void>;
    detectGameType: (path: string) => Promise<GameType | null>;
    hasExpectedExe: (path: string, gameType: GameType) => Promise<boolean>;
  };
  steamcmd: {
    isInstalled: () => Promise<boolean>;
    install: () => Promise<{ success: boolean; error?: string }>;
    /** Installe le serveur dédié du jeu dans `path` (devient le serveur actif). */
    installGame: (
      gameType: GameType,
      path: string,
    ) => Promise<{ success: boolean; error?: string }>;
    /** Met à jour le serveur actif. */
    updateGame: () => Promise<{ success: boolean; error?: string }>;
    checkForUpdate: () => Promise<UpdateCheckResult>;
    onProgress: (cb: (msg: string) => void) => () => void;
  };
  server: {
    start: (serverId?: string) => Promise<{ success: boolean; error?: string }>;
    stop: (serverId?: string) => Promise<{ success: boolean; error?: string }>;
    restart: (
      serverId?: string,
    ) => Promise<{ success: boolean; error?: string }>;
    getStatus: () => Promise<ServerStatus>;
    getStatuses: () => Promise<Record<string, ServerStatus>>;
    getJoinInfo: (serverId?: string) => Promise<JoinInfo>;
    /** IP publique via ipify — seulement sur action de l'utilisateur. */
    getPublicIp: () => Promise<string>;
    getLaunchArgs: (serverId?: string) => Promise<LaunchArgsConfig>;
    setLaunchArgs: (cfg: LaunchArgsConfig, serverId?: string) => Promise<void>;
    onLog: (cb: (event: ServerLogEvent) => void) => () => void;
    onLogSession: (cb: (event: { serverId: string }) => void) => () => void;
    onGameUpdateAvailable: (
      cb: (notice: GameUpdateNotice) => void,
    ) => () => void;
    onModUpdatesAvailable: (
      cb: (notice: ModUpdateNotice) => void,
    ) => () => void;
  };
  palconfig: {
    read: (
      serverId?: string,
    ) => Promise<Record<string, string | number | boolean>>;
    write: (
      settings: Record<string, unknown>,
      serverId?: string,
    ) => Promise<{ success: boolean; error?: string }>;
  };
  monitor: {
    getStats: () => Promise<SystemStats>;
    startPolling: () => Promise<void>;
    stopPolling: () => Promise<void>;
    onStats: (cb: (stats: SystemStats) => void) => () => void;
  };
  firewall: {
    isAdmin: () => Promise<boolean>;
    getStatus: (
      gamePort: number,
      rconPort: number,
      restApiPort: number,
    ) => Promise<FirewallRuleStatus[]>;
    applyAll: (
      gamePort: number,
      rconPort: number,
      restApiPort: number,
    ) => Promise<{ success: boolean; errors: string[] }>;
    removeAll: () => Promise<void>;
    checkRule: (name: string) => Promise<boolean>;
    applyNamedRules: (
      rules: FirewallNamedRule[],
    ) => Promise<{ success: boolean; error?: string }>;
    removeNamedRules: (
      rules: { name: string; protocol?: "TCP" | "UDP" }[],
    ) => Promise<{ success: boolean; error?: string }>;
    enableNamedRule: (
      name: string,
      port: number,
      protocol: "TCP" | "UDP",
    ) => Promise<{ success: boolean; error?: string }>;
    disableNamedRule: (
      name: string,
      protocol?: "TCP" | "UDP",
    ) => Promise<{ success: boolean; error?: string }>;
    listCustomRules: () => Promise<FirewallRuleStatus[]>;
    createCustomRule: (
      name: string,
      port: number,
      protocol: "TCP" | "UDP",
    ) => Promise<{ success: boolean; error?: string }>;
    deleteCustomRule: (
      name: string,
      protocol: "TCP" | "UDP",
    ) => Promise<{ success: boolean; error?: string }>;
  };
  palapi: {
    getInfo: () => Promise<PalServerInfo>;
    getPlayers: () => Promise<{ players: PalPlayer[] }>;
    getMetrics: () => Promise<PalMetrics>;
    announce: (message: string) => Promise<void>;
    kick: (userid: string, message?: string) => Promise<void>;
    ban: (userid: string, message?: string) => Promise<void>;
    unban: (userid: string) => Promise<void>;
    shutdown: (waittime: number, message?: string) => Promise<void>;
  };
  players: {
    getHistory: () => Promise<PlayerHistoryEntry[]>;
    clearHistory: () => Promise<void>;
    removeEntry: (userId: string) => Promise<void>;
  };
  backup: {
    getConfig: () => Promise<BackupConfig>;
    setConfig: (cfg: BackupConfig) => Promise<void>;
    list: () => Promise<BackupEntry[]>;
    create: () => Promise<BackupEntry>;
    /**
     * Sauvegarde le monde avant une mise à jour des mods (option du serveur).
     * null : option désactivée ou aucun monde à sauvegarder.
     */
    beforeUpdate: (serverId?: string) => Promise<BackupEntry | null>;
    restore: (backupPath: string) => Promise<void>;
    delete: (backupPath: string) => Promise<void>;
  };
  schedule: {
    getRestart: () => Promise<RestartConfig>;
    setRestart: (cfg: RestartConfig) => Promise<void>;
  };
  shell: {
    openPath: (path: string) => Promise<void>;
    openExternal: (url: string) => Promise<void>;
    showItemInFolder: (path: string) => Promise<void>;
  };
  logs: {
    listSessions: (serverId?: string) => Promise<LogSession[]>;
    /** Contenu complet d'un fichier de session (`LogSession.name`). */
    readSession: (name: string, serverId?: string) => Promise<string>;
    openDir: (serverId?: string) => Promise<void>;
    /** Chemin du fichier écrit, ou null si l'utilisateur a annulé. */
    saveToFile: (
      content: string,
      defaultName: string,
    ) => Promise<string | null>;
  };
  dialog: {
    selectFolder: () => Promise<string | null>;
    selectFile: (
      filters?: { name: string; extensions: string[] }[],
      defaultPath?: string,
    ) => Promise<string | null>;
  };
  valheim: {
    getConfig: (serverId?: string) => Promise<ValheimLaunchConfig>;
    setConfig: (
      cfg: Partial<ValheimLaunchConfig>,
      serverId?: string,
    ) => Promise<void>;
    openSaveFolder: (customSavedir: string) => Promise<void>;
    listExistingWorlds: (customSavedir: string) => Promise<ValheimWorldInfo[]>;
    /** Nombre de joueurs en ligne selon Odin-Eye ; rejette avec un code ODIN_EYE_*. */
    testOdinEye: (url?: string, serverId?: string) => Promise<number>;
    mods: {
      getTrending: (registry: ModRegistry) => Promise<ThunderstoreModInfo[]>;
      getLatestAdded: (registry: ModRegistry) => Promise<ThunderstoreModInfo[]>;
      getLatestUpdated: (
        registry: ModRegistry,
      ) => Promise<ThunderstoreModInfo[]>;
      search: (
        registry: ModRegistry,
        query: string,
      ) => Promise<ThunderstoreModInfo[]>;
      getModFiles: (
        registry: ModRegistry,
        namespace: string,
        name: string,
      ) => Promise<ThunderstoreModVersion[]>;
      detectBepInEx: (serverId?: string) => Promise<boolean>;
      list: (serverId?: string) => Promise<ValheimMod[]>;
      remove: (modId: number, serverId?: string) => Promise<void>;
      toggle: (
        modId: number,
        enabled: boolean,
        serverId?: string,
      ) => Promise<void>;
      installBepInEx: (serverId?: string) => Promise<void>;
      installMod: (
        registry: ModRegistry,
        code: string,
        serverId?: string,
      ) => Promise<ValheimMod>;
      /** Crée un code de profil r2modman/Gale avec les mods actifs du serveur. */
      shareModpack: (serverId?: string) => Promise<ModpackShare>;
      importProfile: (
        base64Code: string,
        serverId?: string,
      ) => Promise<{ installed: ValheimMod[]; errors: string[] }>;
      importProfileFile: (
        filePath: string,
        serverId?: string,
      ) => Promise<{ installed: ValheimMod[]; errors: string[] }>;
      openPluginsFolder: (serverId?: string) => Promise<string>;
      openConfigFolder: (serverId?: string) => Promise<string>;
      getMissingDeps: (
        registry: ModRegistry,
        namespace: string,
        name: string,
        installedCodes: string[],
      ) => Promise<ThunderstoreModInfo[]>;
      checkUpdates: (
        entries: { code: string; registry: ModRegistry }[],
      ) => Promise<ModUpdateCheck>;
      listConfigFiles: (serverId?: string) => Promise<ValheimModConfigFile[]>;
      readConfigFile: (fileName: string, serverId?: string) => Promise<string>;
      writeConfigFile: (
        fileName: string,
        content: string,
        serverId?: string,
      ) => Promise<void>;
      onProgress: (cb: (msg: string) => void) => () => void;
    };
    getAdminList: (serverId?: string) => Promise<string[]>;
    setAdminList: (list: string[], serverId?: string) => Promise<void>;
    getBannedList: (serverId?: string) => Promise<string[]>;
    setBannedList: (list: string[], serverId?: string) => Promise<void>;
    getPermittedList: (serverId?: string) => Promise<string[]>;
    setPermittedList: (list: string[], serverId?: string) => Promise<void>;
  };
  astroneer: {
    getConfig: (serverId?: string) => Promise<AstroneerLaunchConfig>;
    setConfig: (
      cfg: Partial<AstroneerLaunchConfig>,
      serverId?: string,
    ) => Promise<void>;
  };
  astroconfig: {
    read: (serverId?: string) => Promise<AstroneerSettings>;
    write: (
      settings: AstroneerSettings,
      serverId?: string,
    ) => Promise<{ success: boolean; error?: string }>;
  };
  dragonwilds: {
    getConfig: () => Promise<DragonwildsLaunchConfig>;
    setConfig: (patch: Partial<DragonwildsLaunchConfig>) => Promise<void>;
    /** Mondes du serveur, mondes solo de ce PC et monde chargé au démarrage. */
    listWorlds: () => Promise<{
      current: string;
      server: DragonwildsWorld[];
      solo: DragonwildsWorld[];
      soloDir: string;
    }>;
    /** Charge au prochain démarrage un monde du dossier du serveur. */
    useWorld: (name: string) => Promise<void>;
    /** Copie un monde dans le serveur (après une sauvegarde ZIP) et le sélectionne. */
    importWorld: (sourcePath: string) => Promise<string>;
  };
  dragonwildsconfig: {
    read: () => Promise<DragonwildsSettings>;
    write: (
      settings: DragonwildsSettings,
    ) => Promise<{ success: boolean; error?: string }>;
  };
  app: {
    getVersion: () => Promise<string>;
    getLaunchAtLogin: () => Promise<LaunchAtLoginState>;
    setLaunchAtLogin: (enabled: boolean) => Promise<LaunchAtLoginState>;
    /** Fermer la fenêtre garde Nexum dans la zone de notification. */
    getCloseToTray: () => Promise<boolean>;
    setCloseToTray: (enabled: boolean) => Promise<boolean>;
    /** Langue de l'UI, pour les textes du main (menu de l'icône). */
    setLanguage: (lang: string) => Promise<void>;
    /** Dossier d'installation de Nexum si `path` est dedans, sinon null. */
    installDirConflict: (path: string) => Promise<string | null>;
  };
}

declare global {
  interface Window {
    api: API;
  }
}

export {};
