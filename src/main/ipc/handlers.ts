import { BrowserWindow, app } from "electron/main";
import { join } from "path";
import { SteamCMD } from "../steamcmd/SteamCMD";
import { PalConfigParser } from "../games/palworld/PalConfigParser";
import { AstroConfigParser } from "../games/astroneer/AstroConfigParser";
import { SystemMonitor } from "../monitor/SystemMonitor";
import { FirewallManager } from "../firewall/FirewallManager";
import { BackupManager } from "../backup/BackupManager";
import { RestartScheduler } from "../scheduler/RestartScheduler";
import { PalworldApiClient } from "../games/palworld/PalworldApiClient";
import { OdinEyeApiClient } from "../games/valheim/OdinEyeApiClient";
import { ServerRegistry } from "../servers/ServerRegistry";
import {
  ServerConfigStore,
  DEFAULT_SERVER_CONFIG,
} from "../servers/ServerConfigStore";
import { ServerManagerRegistry } from "../servers/ServerManagerRegistry";
import { PlayerHistoryRegistry } from "../servers/PlayerHistoryRegistry";
import type {
  RestartConfig,
  ValheimLaunchConfig,
  AstroneerLaunchConfig,
} from "../../shared/types";
import type { AppStore, IpcContext } from "./context";
import { registerMiscHandlers } from "./handlers/misc";
import { registerSteamHandlers } from "./handlers/steam";
import { registerServerHandlers } from "./handlers/server";
import { registerFirewallHandlers } from "./handlers/firewall";
import { registerBackupHandlers } from "./handlers/backup";
import { registerScheduleHandlers } from "./handlers/schedule";
import { registerServersHandlers } from "./handlers/servers";
import { registerAutoUpdater } from "../update/AutoUpdater";
import { registerPalapiHandlers } from "../games/palworld/handlers/palapi";
import { registerPlayersHandlers } from "../games/palworld/handlers/players";
import { registerValheimHandlers } from "../games/valheim/handlers/config";
import { registerValheimModsHandlers } from "../games/valheim/handlers/mods";
import { registerAstroneerHandlers } from "../games/astroneer/handlers/config";
import {
  getGameServerConfig,
  getGameEnv,
  buildGameArgs,
  getGameStopConfig,
  getGameSavePath,
} from "../games/registry";
import { autoStartServers } from "../server/startServer";

const DEFAULT_RESTART_CONFIG: RestartConfig = {
  enabled: false,
  time: "04:00",
  warningMinutes: 5,
  message: "Le serveur va redémarrer dans {minutes} minutes",
};

export async function registerIpcHandlers(): Promise<void> {
  // electron-store est en ESM pur depuis la v9 (plus de build CommonJS) —
  // notre process main est en CJS, donc un import statique planterait
  // (ERR_REQUIRE_ESM / "Store is not a constructor").
  const { default: Store } = await import("electron-store");
  const store = new Store<AppStore>();
  const servers = new ServerRegistry(store);
  const serverConfigs = new ServerConfigStore(store);

  // Phase 1 multi-serveur : migre l'ancien `serverPath` unique en premier
  // entry de la liste. No-op si déjà migré ou si pas de legacy à migrer.
  const migrated = servers.migrateLegacy();
  // Phase 2a : migre les anciennes configs globales (launchArgs / backup* /
  // restartSchedule) vers la config du premier serveur. Idempotent.
  // Phase 4 : on passe aussi l'ancien default backup dir partagé pour
  // préserver l'accès aux .zip existants après migration.
  const firstServer = migrated ?? servers.list()[0];
  if (firstServer) {
    const legacyBackupDefault = join(app.getPath("userData"), "backups");
    serverConfigs.migrateLegacy(firstServer.id, legacyBackupDefault);
  }

  // Helpers utilisés partout : centralisent la résolution du serveur "actif".
  // Tant qu'on n'a pas la Phase 2 (handlers paramétrés par serverId), tout le
  // backend continue de fonctionner sur l'unique serveur actif.
  const getActiveServer = () => servers.getActive();
  const getActiveServerPath = (): string => getActiveServer()?.path ?? "";
  const setActiveServerPath = (path: string): void => {
    const active = servers.getActive();
    if (active) {
      servers.update(active.id, { path });
    } else {
      // Premier lancement / app fresh : on crée un serveur avec ce path.
      servers.create({ name: "", path, gameType: "palworld" });
    }
    // On garde aussi `serverPath` en sync pour la rétrocompat (handlers pas
    // encore migrés, ou versions précédentes installées en dual-boot).
    store.set("serverPath", path);
  };

  // Phase 2a : helpers pour la config par-serveur.
  const resolveServerId = (id: string | undefined): string => {
    const resolved = id ?? servers.getActiveId();
    if (!resolved) throw new Error("Aucun serveur actif configuré");
    return resolved;
  };
  const getServerConfig = (id?: string) =>
    serverConfigs.get(resolveServerId(id));
  const updateServerConfig = (
    id: string | undefined,
    patch: Parameters<typeof serverConfigs.update>[1],
  ) => serverConfigs.update(resolveServerId(id), patch);
  const removeServerConfig = (id: string) => serverConfigs.remove(id);
  const getValheimConfig = (id?: string) =>
    serverConfigs.get(resolveServerId(id)).valheimConfig;
  const updateValheimConfig = (
    id: string | undefined,
    patch: Partial<ValheimLaunchConfig>,
  ) =>
    serverConfigs.update(resolveServerId(id), {
      valheimConfig: patch as ValheimLaunchConfig,
    });
  const getAstroneerConfig = (id?: string) =>
    serverConfigs.get(resolveServerId(id)).astroneerConfig;
  const updateAstroneerConfig = (
    id: string | undefined,
    patch: Partial<AstroneerLaunchConfig>,
  ) =>
    serverConfigs.update(resolveServerId(id), {
      astroneerConfig: patch as AstroneerLaunchConfig,
    });

  const getModsDataDir = (id?: string): string => {
    const serverId = resolveServerId(id);
    return join(app.getPath("userData"), "servers", serverId);
  };

  const serverManagers = new ServerManagerRegistry(servers);
  const requireActiveManager = () => {
    const mgr = serverManagers.getActive();
    if (!mgr) throw new Error("Aucun serveur actif configuré");
    return mgr;
  };
  // Helper local pour les boucles internes : retourne le manager actif ou
  // null (sans throw). Utilisé par les schedulers / poller qui doivent juste
  // skipper si aucun serveur n'est sélectionné.
  const activeManagerOrNull = () => serverManagers.getActive();

  const steamcmd = new SteamCMD();
  const configParser = new PalConfigParser();
  const astroConfigParser = new AstroConfigParser();
  const systemMonitor = new SystemMonitor();
  const firewall = new FirewallManager();
  const backup = new BackupManager();
  const restartScheduler = new RestartScheduler();
  const playerHistories = new PlayerHistoryRegistry(
    app.getPath("userData"),
    servers,
  );
  // Phase 2c : migre l'ancien history.json partagé vers le premier serveur
  if (firstServer) playerHistories.migrateLegacy(firstServer.id);

  const broadcastLog = (serverId: string, line: string): void => {
    BrowserWindow.getAllWindows().forEach((w) =>
      w.webContents.send("server:log", { serverId, line }),
    );
  };

  const getBackupDir = (): string => {
    const active = servers.getActive();
    if (!active) return backup.getDefaultBackupDir(app.getPath("userData"));
    const stored = serverConfigs.get(active.id).backup.backupDir;
    return (
      stored ||
      backup.getDefaultBackupDirForServer(app.getPath("userData"), active.id)
    );
  };

  const getRestartConfig = (): RestartConfig => {
    const active = servers.getActive();
    if (!active) return DEFAULT_RESTART_CONFIG;
    return serverConfigs.get(active.id).restart;
  };

  const getServerPath = (id?: string): string => {
    if (!id) return getActiveServerPath();
    return servers.list().find((s) => s.id === id)?.path ?? "";
  };

  const getStopConfig = (serverId?: string) => {
    const server = serverId
      ? servers.list().find((s) => s.id === serverId)
      : servers.getActive();
    const gameType = server?.gameType ?? "palworld";
    return getGameStopConfig(gameType, getServerPath(serverId), configParser);
  };

  const getStopConfigForRestart = () => {
    const base = getStopConfig();
    const restart = getRestartConfig();
    return {
      ...base,
      shutdownWaittime: restart.warningMinutes * 60,
      shutdownMessage: restart.message.replace(
        "{minutes}",
        String(restart.warningMinutes),
      ),
    };
  };

  const applyBackupScheduler = (): void => {
    const active = servers.getActive();
    const cfg = active ? serverConfigs.get(active.id).backup : null;
    const minutes = cfg?.backupIntervalMinutes ?? 0;
    backup.startScheduler(minutes, async () => {
      const mgr = activeManagerOrNull();
      if (!mgr || mgr.getStatus() !== "running") return;
      const serverPath = getActiveServerPath();
      if (!serverPath) return;
      // Résout le vrai dossier de sauvegarde par jeu (ex: Valheim stocke ses
      // mondes hors de serverPath) — sans ça, l'auto-backup zippait toujours
      // le dossier Palworld par défaut, introuvable pour les autres jeux.
      const currentActive = getActiveServer();
      const sourcePath = currentActive
        ? getGameSavePath(
            currentActive.gameType,
            serverPath,
            serverConfigs.get(currentActive.id),
          )
        : undefined;
      const dir = getBackupDir();
      await backup.create(serverPath, dir, sourcePath);
      backup.rotate(dir, cfg?.backupKeep ?? 10);
    });
  };

  // Start daily restart scheduler
  restartScheduler.start(getRestartConfig, async () => {
    const mgr = activeManagerOrNull();
    if (!mgr || mgr.getStatus() !== "running") return;
    const active = servers.getActive();
    const gameType = active?.gameType ?? "palworld";
    const serverCfg = active
      ? serverConfigs.get(active.id)
      : DEFAULT_SERVER_CONFIG;
    const args = buildGameArgs(gameType, serverCfg);
    // Sans callback réel ici, ServerManager.start() écrase son onLog interne
    // par un no-op pour le reste de la vie du process relancé — la console
    // restait figée après un redémarrage planifié (le manuel passe bien
    // sendLog, voir handlers/server.ts).
    await mgr.restart(
      getActiveServerPath(),
      getGameServerConfig(gameType).exeName,
      args,
      (line) => broadcastLog(active?.id ?? "", line),
      getStopConfigForRestart(),
      getGameEnv(gameType),
    );
  });

  applyBackupScheduler();

  // Tracker d'historique : démarre par serveur quand son API de suivi joueurs
  // est dispo (REST Palworld ou plugin Odin-Eye pour Valheim ; pas de source
  // pour Astroneer), s'arrête sinon. Chaque serveur est suivi indépendamment
  // (via son propre manager/path) pour ne pas mélanger les données quand
  // plusieurs serveurs tournent en parallèle — pointer sur "le serveur actif"
  // ferait dériver le tracker d'un serveur vers l'API d'un autre dès qu'on
  // change l'actif.
  const getApiClientForServer =
    (serverId: string) => (): PalworldApiClient | OdinEyeApiClient | null => {
      const mgr = serverManagers
        .entries()
        .find((e) => e.serverId === serverId)?.manager;
      if (!mgr || mgr.getStatus() !== "running") return null;
      const gameType =
        servers.list().find((s) => s.id === serverId)?.gameType ?? "palworld";

      if (gameType === "valheim") {
        const url = serverConfigs.get(serverId).valheimConfig.odinEyeUrl;
        return url ? new OdinEyeApiClient(url) : null;
      }
      if (gameType !== "palworld") return null;

      const serverPath = getServerPath(serverId);
      if (!serverPath) return null;
      try {
        const cfg = configParser.read(serverPath);
        if (!cfg.RESTAPIEnabled) return null;
        return new PalworldApiClient(
          Number(cfg.RESTAPIPort ?? 8212),
          String(cfg.AdminPassword ?? ""),
        );
      } catch {
        return null;
      }
    };

  const trackedServers = new Set<string>();
  setInterval(() => {
    const currentIds = new Set<string>();
    for (const server of servers.list()) {
      currentIds.add(server.id);
      const mgr = serverManagers
        .entries()
        .find((e) => e.serverId === server.id)?.manager;
      const shouldTrack = !!mgr && mgr.getStatus() === "running";
      const isTracked = trackedServers.has(server.id);
      if (shouldTrack && !isTracked) {
        playerHistories
          .getOrCreate(server.id)
          .start(getApiClientForServer(server.id));
        trackedServers.add(server.id);
      } else if (!shouldTrack && isTracked) {
        playerHistories.getOrCreate(server.id).stop();
        trackedServers.delete(server.id);
      }
    }
    // Nettoie le suivi d'un serveur supprimé entre deux ticks.
    for (const id of trackedServers) {
      if (!currentIds.has(id)) trackedServers.delete(id);
    }
  }, 5000);

  // Try to adopt any existing PalServer.exe processes on startup, matching
  // each running process to a configured server by executable path.
  const adoption = serverManagers.tryAdoptAll(broadcastLog).catch(() => {});

  const ctx: IpcContext = {
    app,
    store,
    servers,
    serverManagers,
    requireActiveManager,
    steamcmd,
    configParser,
    astroConfigParser,
    systemMonitor,
    firewall,
    backup,
    restartScheduler,
    playerHistories,
    broadcastLog,
    getBackupDir,
    getRestartConfig,
    applyBackupScheduler,
    getStopConfig,
    getActiveServer,
    getActiveServerPath,
    setActiveServerPath,
    getServerConfig,
    updateServerConfig,
    removeServerConfig,
    getServerPath,
    getValheimConfig,
    updateValheimConfig,
    getAstroneerConfig,
    updateAstroneerConfig,
    getModsDataDir,
  };

  // Serveurs marqués « démarrage automatique » : après l'adoption, pour ne
  // pas relancer un serveur déjà en cours (voir server/startServer.ts).
  adoption.then(() => autoStartServers(ctx, broadcastLog)).catch(() => {});

  registerMiscHandlers(ctx);
  registerAutoUpdater();
  registerSteamHandlers(ctx);
  registerServerHandlers(ctx);
  registerPalapiHandlers(ctx);
  registerFirewallHandlers(ctx);
  registerBackupHandlers(ctx);
  registerScheduleHandlers(ctx);
  registerPlayersHandlers(ctx);
  registerServersHandlers(ctx, servers);
  registerValheimHandlers(ctx);
  registerValheimModsHandlers(ctx);
  registerAstroneerHandlers(ctx);
}
