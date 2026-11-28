import type {
  SystemStats,
  PalServerInfo,
  PalPlayer,
  PalMetrics,
  BackupEntry,
  BackupConfig,
  RestartConfig,
  BulkAction,
  AdminCapabilities,
  BulkRun,
  OnlinePlayers,
  FirewallRuleStatus,
  FirewallNamedRule,
  LaunchAtLoginState,
  UpdateCheckResult,
  GameUpdateNotice,
  ModUpdateNotice,
  AutoRestartGaveUpNotice,
  AutoStartFailedNotice,
  AppUpdateStatus,
  LaunchArgsConfig,
  ValheimLaunchConfig,
  ValheimWorldInfo,
  AstroneerLaunchConfig,
  AstroneerSettings,
  DragonwildsLaunchConfig,
  DragonwildsSettings,
  DragonwildsWorld,
  EnshroudedLaunchConfig,
  EnshroudedSettings,
  EnshroudedUserGroup,
  ArkSettings,
  ArkLaunchImport,
  ArkLaunchLineSource,
  ArkMod,
  ArkModsState,
  ArkSettingsState,
  ArkSettingChange,
  ArkGameLists,
  ArkListName,
  ArkModSearchParams,
  ArkModSearchPage,
  ArkModCategory,
  ValheimMod,
  ValheimModConfigFile,
  InstallBatch,
  ModInstallProgress,
  ModRegistry,
  ThunderstoreModInfo,
  ThunderstoreModVersion,
  ModBrowsePage,
  ModUpdateCheck,
  ModpackShare,
  PlayerHistoryEntry,
  Server,
  GameType,
  ServerStatus,
  ServerLogEvent,
  JoinInfo,
  SelectFolderOptions,
  LogSession,
  PendingMod,
  ServerArchiveImportChoice,
  ServerArchiveImportResult,
  ServerArchivePreview,
  ServerImportConflicts,
  SettingsImportChoice,
  SettingsImportPreview,
  SettingsImportResult,
  TransferServerPaths,
} from "../shared/types";

interface API {
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
    onMaximizedChange: (cb: (maximized: boolean) => void) => () => void;
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
    getBetaUpdates: () => Promise<boolean>;
    setBetaUpdates: (enabled: boolean) => Promise<boolean>;
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
      autoRestart?: boolean;
    }) => Promise<Server>;
    update: (
      id: string,
      patch: Partial<{
        name: string;
        path: string;
        gameType: GameType;
        color: string | null;
        autoStart: boolean;
        autoRestart: boolean;
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
    /** Commandes du menu « ⋯ » du Dashboard disponibles pour ce serveur. */
    getCapabilities: (serverId: string) => Promise<AdminCapabilities>;
    saveNow: (serverId: string) => Promise<void>;
    sendMessage: (serverId: string, message: string) => Promise<void>;
    /** Arrêt forcé, sans annonce ni sauvegarde (pas compté comme un plantage). */
    kill: (serverId: string) => Promise<{ success: boolean; error?: string }>;
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
    onAutoRestartGaveUp: (
      cb: (notice: AutoRestartGaveUpNotice) => void,
    ) => () => void;
    /** Démarrage auto ou relance après plantage qui a échoué. */
    onAutoStartFailed: (
      callback: (notice: AutoStartFailedNotice) => void,
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
  bulk: {
    run: (action: BulkAction, warnPlayers: boolean) => Promise<BulkRun>;
    get: () => Promise<BulkRun | null>;
    stopAfterCurrent: () => Promise<void>;
    dismiss: () => Promise<void>;
    onlinePlayers: () => Promise<OnlinePlayers[]>;
    onChange: (callback: (run: BulkRun) => void) => () => void;
  };
  shell: {
    openPath: (path: string) => Promise<void>;
    openExternal: (url: string) => Promise<void>;
    showItemInFolder: (path: string) => Promise<void>;
  };
  logs: {
    listSessions: (serverId?: string) => Promise<LogSession[]>;
    /**
     * Contenu complet d'un fichier de session (`LogSession.name`).
     * `forDisplay` : sans les lignes techniques du jeu (affichage seulement,
     * jamais pour un export).
     */
    readSession: (
      name: string,
      serverId?: string,
      forDisplay?: boolean,
    ) => Promise<string>;
    openDir: (serverId?: string) => Promise<void>;
    /** Chemin du fichier écrit, ou null si l'utilisateur a annulé. */
    saveToFile: (
      content: string,
      defaultName: string,
    ) => Promise<string | null>;
  };
  dialog: {
    /** Dossier choisi (relatif si `relativeToBase`), ou null si annulé. */
    selectFolder: (options?: SelectFolderOptions) => Promise<string | null>;
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
    /** Dossier des données de Valheim quand `savedir` est vide. */
    getDefaultDataDir: () => Promise<string>;
    listExistingWorlds: (customSavedir: string) => Promise<ValheimWorldInfo[]>;
    /** Nombre de joueurs en ligne selon Odin-Eye ; rejette avec un code ODIN_EYE_*. */
    testOdinEye: (url?: string, serverId?: string) => Promise<number>;
    mods: {
      /** `offset` : premier mod de la page (0 par défaut). */
      getTrending: (
        registry: ModRegistry,
        offset?: number,
      ) => Promise<ModBrowsePage>;
      getLatestAdded: (
        registry: ModRegistry,
        offset?: number,
      ) => Promise<ModBrowsePage>;
      getLatestUpdated: (
        registry: ModRegistry,
        offset?: number,
      ) => Promise<ModBrowsePage>;
      search: (
        registry: ModRegistry,
        query: string,
        offset?: number,
      ) => Promise<ModBrowsePage>;
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
      /** `batch` : position dans une série, jointe à chaque étape de progression. */
      installMod: (
        registry: ModRegistry,
        code: string,
        serverId?: string,
        batch?: InstallBatch,
      ) => Promise<ValheimMod>;
      /** Mods d'un serveur importé depuis un autre PC, à réinstaller. */
      getPending: (serverId?: string) => Promise<PendingMod[]>;
      installPending: (
        serverId?: string,
      ) => Promise<{ installed: ValheimMod[]; errors: string[] }>;
      dismissPending: (serverId?: string) => Promise<void>;
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
      /** `serverId` : serveur sur lequel l'installation a été lancée. */
      onProgress: (
        callback: (
          progress: ModInstallProgress,
          serverId: string | null,
        ) => void,
      ) => () => void;
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
  enshrouded: {
    getConfig: () => Promise<EnshroudedLaunchConfig>;
    setConfig: (patch: Partial<EnshroudedLaunchConfig>) => Promise<void>;
    /** Groupes d'utilisateurs d'enshrouded_server.json (mot de passe = droits). */
    getGroups: () => Promise<EnshroudedUserGroup[]>;
    setGroups: (
      groups: EnshroudedUserGroup[],
    ) => Promise<{ success: boolean; error?: string }>;
  };
  enshroudedconfig: {
    read: () => Promise<EnshroudedSettings>;
    write: (
      settings: EnshroudedSettings,
    ) => Promise<{ success: boolean; error?: string }>;
  };
  arkconfig: {
    read: () => Promise<ArkSettings>;
    write: (
      settings: ArkSettings,
    ) => Promise<{ success: boolean; error?: string }>;
  };
  arkSettings: {
    read: (serverId: string) => Promise<ArkSettingsState>;
    write: (
      serverId: string,
      changes: ArkSettingChange[],
    ) => Promise<{ success: boolean; error?: string }>;
    readLists: (serverId: string) => Promise<ArkGameLists>;
    writeList: (
      serverId: string,
      list: ArkListName,
      data: unknown,
    ) => Promise<{ success: boolean; error?: string }>;
    readRaw: (serverId: string, file: "gus" | "game") => Promise<string>;
    writeRaw: (
      serverId: string,
      file: "gus" | "game",
      text: string,
    ) => Promise<{ success: boolean; error?: string }>;
  };
  arkLaunchImport: {
    fromLog: (
      serverPath: string,
      serverId: string | null,
    ) => Promise<ArkLaunchLineSource | null>;
    fromScript: (path: string) => Promise<ArkLaunchLineSource>;
    preview: (
      serverPath: string,
      line: string,
      serverId: string | null,
    ) => Promise<ArkLaunchImport | null>;
    apply: (
      serverId: string,
      line: string,
      saveDirectory: string,
    ) => Promise<{ success: boolean; error?: string }>;
  };
  arkMods: {
    get: (serverId: string) => Promise<ArkModsState>;
    add: (
      serverId: string,
      id: number,
    ) => Promise<{ success: boolean; error?: string }>;
    set: (
      serverId: string,
      mods: ArkMod[],
    ) => Promise<{ success: boolean; error?: string }>;
    takeFromArgs: (
      serverId: string,
    ) => Promise<{ success: boolean; error?: string }>;
    search: (params: ArkModSearchParams) => Promise<ArkModSearchPage>;
    categories: () => Promise<ArkModCategory[]>;
  };
  /** Changer de PC. Les exports renvoient le chemin écrit, null si annulé. */
  transfer: {
    exportSettings: (includePasswords: boolean) => Promise<string | null>;
    previewSettings: (filePath: string) => Promise<SettingsImportPreview>;
    importSettings: (
      choice: SettingsImportChoice,
    ) => Promise<SettingsImportResult>;
    exportServer: (
      serverId: string,
      includePasswords: boolean,
    ) => Promise<string | null>;
    previewServer: (zipPath: string) => Promise<ServerArchivePreview>;
    serverImportConflicts: (
      token: string,
      paths: TransferServerPaths,
    ) => Promise<ServerImportConflicts>;
    importServer: (
      choice: ServerArchiveImportChoice,
    ) => Promise<ServerArchiveImportResult>;
    cancelServerImport: (token: string) => Promise<void>;
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
    /**
     * Le renderer écoute : le main envoie les événements mis en file pendant
     * son chargement (`src/main/ipc/rendererEvents.ts`).
     */
    rendererReady: () => void;
    /** Dossier d'installation de Nexum si `path` est dedans, sinon null. */
    installDirConflict: (
      path: string,
      basePath?: string,
    ) => Promise<string | null>;
  };
}

declare global {
  interface Window {
    api: API;
  }
}

export {};
