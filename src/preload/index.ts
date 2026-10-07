import { contextBridge, ipcRenderer } from "electron";
import type {
  AppUpdateStatus,
  FirewallNamedRule,
  GameType,
  ModRegistry,
} from "../shared/types";

const api = {
  // Window controls
  window: {
    minimize: () => ipcRenderer.invoke("window:minimize"),
    maximize: () => ipcRenderer.invoke("window:maximize"),
    close: () => ipcRenderer.invoke("window:close"),
  },
  // App config
  config: {
    getServerPath: () => ipcRenderer.invoke("config:getServerPath"),
    setServerPath: (path: string) =>
      ipcRenderer.invoke("config:setServerPath", path),
  },
  update: {
    getCurrentVersion: () => ipcRenderer.invoke("update:getCurrentVersion"),
    check: () => ipcRenderer.invoke("update:check"),
    download: () => ipcRenderer.invoke("update:download"),
    install: () => ipcRenderer.invoke("update:install"),
    onStatus: (cb: (status: AppUpdateStatus) => void) => {
      ipcRenderer.on("update:status", (_e, status) => cb(status));
      return () => ipcRenderer.removeAllListeners("update:status");
    },
  },
  // Multi-serveur
  servers: {
    list: () => ipcRenderer.invoke("servers:list"),
    getActive: () => ipcRenderer.invoke("servers:getActive"),
    setActive: (id: string | null) =>
      ipcRenderer.invoke("servers:setActive", id),
    create: (input: {
      name: string;
      path: string;
      gameType?: GameType;
      color?: string | null;
    }) => ipcRenderer.invoke("servers:create", input),
    update: (
      id: string,
      patch: Partial<{
        name: string;
        path: string;
        gameType: GameType;
        color: string | null;
      }>,
    ) => ipcRenderer.invoke("servers:update", id, patch),
    delete: (id: string) => ipcRenderer.invoke("servers:delete", id),
    detectGameType: (path: string): Promise<GameType | null> =>
      ipcRenderer.invoke("servers:detectGameType", path),
    hasExpectedExe: (path: string, gameType: GameType): Promise<boolean> =>
      ipcRenderer.invoke("servers:hasExpectedExe", path, gameType),
  },
  // SteamCMD
  steamcmd: {
    isInstalled: () => ipcRenderer.invoke("steamcmd:isInstalled"),
    install: () => ipcRenderer.invoke("steamcmd:install"),
    installPalworld: (path: string) =>
      ipcRenderer.invoke("steamcmd:installPalworld", path),
    updatePalworld: () => ipcRenderer.invoke("steamcmd:updatePalworld"),
    installValheim: (path: string) =>
      ipcRenderer.invoke("steamcmd:installValheim", path),
    updateValheim: () => ipcRenderer.invoke("steamcmd:updateValheim"),
    installAstroneer: (path: string) =>
      ipcRenderer.invoke("steamcmd:installAstroneer", path),
    updateAstroneer: () => ipcRenderer.invoke("steamcmd:updateAstroneer"),
    checkForUpdate: () => ipcRenderer.invoke("steamcmd:checkForUpdate"),
    onProgress: (cb: (msg: string) => void) => {
      ipcRenderer.on("steamcmd:progress", (_e, msg) => cb(msg));
      return () => ipcRenderer.removeAllListeners("steamcmd:progress");
    },
  },
  // Server (tous les handlers acceptent un serverId optionnel — par défaut actif)
  server: {
    start: (serverId?: string) => ipcRenderer.invoke("server:start", serverId),
    stop: (serverId?: string) => ipcRenderer.invoke("server:stop", serverId),
    restart: (serverId?: string) =>
      ipcRenderer.invoke("server:restart", serverId),
    getStatus: () => ipcRenderer.invoke("server:status"),
    getStatuses: () => ipcRenderer.invoke("server:statuses"),
    getLaunchArgs: (serverId?: string) =>
      ipcRenderer.invoke("server:getLaunchArgs", serverId),
    setLaunchArgs: (
      cfg: {
        publicLobby: boolean;
        performanceFlags: boolean;
        customArgs: string;
      },
      serverId?: string,
    ) => ipcRenderer.invoke("server:setLaunchArgs", cfg, serverId),
    onLog: (cb: (event: { serverId: string; line: string }) => void) => {
      ipcRenderer.on("server:log", (_e, event) => cb(event));
      return () => ipcRenderer.removeAllListeners("server:log");
    },
    // Nouvelle session de log (démarrage du serveur) : la vue repart de zéro.
    onLogSession: (cb: (event: { serverId: string }) => void) => {
      ipcRenderer.on("server:logSession", (_e, event) => cb(event));
      return () => ipcRenderer.removeAllListeners("server:logSession");
    },
  },
  // Palworld config (serverId optionnel — par défaut actif)
  palconfig: {
    read: (serverId?: string) => ipcRenderer.invoke("palconfig:read", serverId),
    write: (settings: Record<string, unknown>, serverId?: string) =>
      ipcRenderer.invoke("palconfig:write", settings, serverId),
  },
  // Monitor
  monitor: {
    getStats: () => ipcRenderer.invoke("monitor:getStats"),
    startPolling: () => ipcRenderer.invoke("monitor:startPolling"),
    stopPolling: () => ipcRenderer.invoke("monitor:stopPolling"),
    onStats: (cb: (stats: unknown) => void) => {
      ipcRenderer.on("monitor:stats", (_e, stats) => cb(stats));
      return () => ipcRenderer.removeAllListeners("monitor:stats");
    },
  },
  // Firewall
  firewall: {
    isAdmin: () => ipcRenderer.invoke("firewall:isAdmin"),
    getStatus: (gamePort: number, rconPort: number, restApiPort: number) =>
      ipcRenderer.invoke("firewall:getStatus", gamePort, rconPort, restApiPort),
    enableRule: (
      key: "game" | "rcon" | "restapi",
      port: number,
      protocol: "TCP" | "UDP",
    ) => ipcRenderer.invoke("firewall:enableRule", key, port, protocol),
    disableRule: (key: "game" | "rcon" | "restapi") =>
      ipcRenderer.invoke("firewall:disableRule", key),
    applyAll: (gamePort: number, rconPort: number, restApiPort: number) =>
      ipcRenderer.invoke("firewall:applyAll", gamePort, rconPort, restApiPort),
    removeAll: () => ipcRenderer.invoke("firewall:removeAll"),
    checkRule: (name: string) => ipcRenderer.invoke("firewall:checkRule", name),
    enableNamedRule: (name: string, port: number, protocol: "TCP" | "UDP") =>
      ipcRenderer.invoke("firewall:enableNamedRule", name, port, protocol),
    disableNamedRule: (name: string, protocol?: "TCP" | "UDP") =>
      ipcRenderer.invoke("firewall:disableNamedRule", name, protocol),
    applyNamedRules: (rules: FirewallNamedRule[]) =>
      ipcRenderer.invoke("firewall:applyNamedRules", rules),
    removeNamedRules: (rules: { name: string; protocol?: "TCP" | "UDP" }[]) =>
      ipcRenderer.invoke("firewall:removeNamedRules", rules),
    listCustomRules: () => ipcRenderer.invoke("firewall:listCustomRules"),
    createCustomRule: (name: string, port: number, protocol: "TCP" | "UDP") =>
      ipcRenderer.invoke("firewall:createCustomRule", name, port, protocol),
    deleteCustomRule: (name: string, protocol: "TCP" | "UDP") =>
      ipcRenderer.invoke("firewall:deleteCustomRule", name, protocol),
  },
  // Palworld REST API
  palapi: {
    getInfo: () => ipcRenderer.invoke("palapi:getInfo"),
    getPlayers: () => ipcRenderer.invoke("palapi:getPlayers"),
    getMetrics: () => ipcRenderer.invoke("palapi:getMetrics"),
    announce: (message: string) =>
      ipcRenderer.invoke("palapi:announce", message),
    kick: (userid: string, message?: string) =>
      ipcRenderer.invoke("palapi:kick", userid, message),
    ban: (userid: string, message?: string) =>
      ipcRenderer.invoke("palapi:ban", userid, message),
    unban: (userid: string) => ipcRenderer.invoke("palapi:unban", userid),
    shutdown: (waittime: number, message?: string) =>
      ipcRenderer.invoke("palapi:shutdown", waittime, message),
  },
  // Player history
  players: {
    getHistory: () => ipcRenderer.invoke("players:getHistory"),
    clearHistory: () => ipcRenderer.invoke("players:clearHistory"),
    removeEntry: (userId: string) =>
      ipcRenderer.invoke("players:removeEntry", userId),
  },
  // Backups
  backup: {
    getConfig: () => ipcRenderer.invoke("backup:getConfig"),
    setConfig: (cfg: { backupDir: string; backupKeep: number }) =>
      ipcRenderer.invoke("backup:setConfig", cfg),
    list: () => ipcRenderer.invoke("backup:list"),
    create: () => ipcRenderer.invoke("backup:create"),
    restore: (backupPath: string) =>
      ipcRenderer.invoke("backup:restore", backupPath),
    delete: (backupPath: string) =>
      ipcRenderer.invoke("backup:delete", backupPath),
  },
  // Scheduler
  schedule: {
    getRestart: () => ipcRenderer.invoke("schedule:getRestart"),
    setRestart: (cfg: {
      enabled: boolean;
      time: string;
      warningMinutes: number;
      message: string;
    }) => ipcRenderer.invoke("schedule:setRestart", cfg),
  },
  // Shell
  shell: {
    openPath: (path: string) => ipcRenderer.invoke("shell:openPath", path),
    openExternal: (url: string) =>
      ipcRenderer.invoke("shell:openExternal", url),
    showItemInFolder: (path: string) =>
      ipcRenderer.invoke("shell:showItemInFolder", path),
  },
  // Export du log serveur (page Logs)
  logs: {
    saveToFile: (content: string, defaultName: string) =>
      ipcRenderer.invoke("logs:saveToFile", content, defaultName),
    listSessions: (serverId?: string) =>
      ipcRenderer.invoke("logs:listSessions", serverId),
    readSession: (name: string, serverId?: string) =>
      ipcRenderer.invoke("logs:readSession", name, serverId),
    openDir: (serverId?: string) =>
      ipcRenderer.invoke("logs:openDir", serverId),
  },
  // Dialog
  dialog: {
    selectFolder: () => ipcRenderer.invoke("dialog:selectFolder"),
    selectFile: (filters?: { name: string; extensions: string[] }[]) =>
      ipcRenderer.invoke("dialog:selectFile", filters),
  },
  // Valheim config (serverId optionnel — par défaut actif)
  valheim: {
    getConfig: (serverId?: string) =>
      ipcRenderer.invoke("valheim:getConfig", serverId),
    setConfig: (cfg: Record<string, unknown>, serverId?: string) =>
      ipcRenderer.invoke("valheim:setConfig", cfg, serverId),
    openSaveFolder: (customSavedir: string) =>
      ipcRenderer.invoke("valheim:openSaveFolder", customSavedir),
    listExistingWorlds: (customSavedir: string) =>
      ipcRenderer.invoke("valheim:listExistingWorlds", customSavedir),
    mods: {
      // Parcourir un registre (public, sans clé API)
      getTrending: (registry: ModRegistry) =>
        ipcRenderer.invoke("valheim:mods:getTrending", registry),
      getLatestAdded: (registry: ModRegistry) =>
        ipcRenderer.invoke("valheim:mods:getLatestAdded", registry),
      getLatestUpdated: (registry: ModRegistry) =>
        ipcRenderer.invoke("valheim:mods:getLatestUpdated", registry),
      search: (registry: ModRegistry, query: string) =>
        ipcRenderer.invoke("valheim:mods:search", registry, query),
      getModFiles: (registry: ModRegistry, namespace: string, name: string) =>
        ipcRenderer.invoke(
          "valheim:mods:getModFiles",
          registry,
          namespace,
          name,
        ),
      // Gestion locale
      detectBepInEx: (serverId?: string) =>
        ipcRenderer.invoke("valheim:mods:detectBepInEx", serverId),
      list: (serverId?: string) =>
        ipcRenderer.invoke("valheim:mods:list", serverId),
      remove: (modId: number, serverId?: string) =>
        ipcRenderer.invoke("valheim:mods:remove", modId, serverId),
      toggle: (modId: number, enabled: boolean, serverId?: string) =>
        ipcRenderer.invoke("valheim:mods:toggle", modId, enabled, serverId),
      installBepInEx: (serverId?: string) =>
        ipcRenderer.invoke("valheim:mods:installBepInEx", serverId),
      installMod: (registry: ModRegistry, code: string, serverId?: string) =>
        ipcRenderer.invoke("valheim:mods:installMod", registry, code, serverId),
      importProfile: (base64Code: string, serverId?: string) =>
        ipcRenderer.invoke("valheim:mods:importProfile", base64Code, serverId),
      importProfileFile: (filePath: string, serverId?: string) =>
        ipcRenderer.invoke(
          "valheim:mods:importProfileFile",
          filePath,
          serverId,
        ),
      openPluginsFolder: (serverId?: string) =>
        ipcRenderer.invoke("valheim:mods:openPluginsFolder", serverId),
      openConfigFolder: (serverId?: string) =>
        ipcRenderer.invoke("valheim:mods:openConfigFolder", serverId),
      getMissingDeps: (
        registry: ModRegistry,
        namespace: string,
        name: string,
        installedCodes: string[],
      ) =>
        ipcRenderer.invoke(
          "valheim:mods:getMissingDeps",
          registry,
          namespace,
          name,
          installedCodes,
        ),
      checkUpdates: (entries: { code: string; registry: ModRegistry }[]) =>
        ipcRenderer.invoke("valheim:mods:checkUpdates", entries),
      listConfigFiles: (serverId?: string) =>
        ipcRenderer.invoke("valheim:mods:listConfigFiles", serverId),
      readConfigFile: (fileName: string, serverId?: string) =>
        ipcRenderer.invoke("valheim:mods:readConfigFile", fileName, serverId),
      writeConfigFile: (fileName: string, content: string, serverId?: string) =>
        ipcRenderer.invoke(
          "valheim:mods:writeConfigFile",
          fileName,
          content,
          serverId,
        ),
      onProgress: (cb: (msg: string) => void) => {
        ipcRenderer.on("valheim:mods:progress", (_e, msg) => cb(msg));
        return () => ipcRenderer.removeAllListeners("valheim:mods:progress");
      },
    },
    getAdminList: (serverId?: string) =>
      ipcRenderer.invoke("valheim:getAdminList", serverId),
    setAdminList: (list: string[], serverId?: string) =>
      ipcRenderer.invoke("valheim:setAdminList", list, serverId),
    getBannedList: (serverId?: string) =>
      ipcRenderer.invoke("valheim:getBannedList", serverId),
    setBannedList: (list: string[], serverId?: string) =>
      ipcRenderer.invoke("valheim:setBannedList", list, serverId),
    getPermittedList: (serverId?: string) =>
      ipcRenderer.invoke("valheim:getPermittedList", serverId),
    setPermittedList: (list: string[], serverId?: string) =>
      ipcRenderer.invoke("valheim:setPermittedList", list, serverId),
  },
  // Astroneer (serverId optionnel — par défaut actif)
  astroneer: {
    getConfig: (serverId?: string) =>
      ipcRenderer.invoke("astroneer:getConfig", serverId),
    setConfig: (cfg: Record<string, unknown>, serverId?: string) =>
      ipcRenderer.invoke("astroneer:setConfig", cfg, serverId),
  },
  // Astroneer .ini config (Engine.ini + AstroServerSettings.ini)
  astroconfig: {
    read: (serverId?: string) =>
      ipcRenderer.invoke("astroconfig:read", serverId),
    write: (settings: Record<string, unknown>, serverId?: string) =>
      ipcRenderer.invoke("astroconfig:write", settings, serverId),
  },
  // App
  app: {
    getVersion: () => ipcRenderer.invoke("app:getVersion"),
    getLaunchAtLogin: () => ipcRenderer.invoke("app:getLaunchAtLogin"),
    setLaunchAtLogin: (enabled: boolean) =>
      ipcRenderer.invoke("app:setLaunchAtLogin", enabled),
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore -- contextIsolation désactivé (fallback dev), window.api n'existe pas dans les types globaux
  window.api = api;
}
