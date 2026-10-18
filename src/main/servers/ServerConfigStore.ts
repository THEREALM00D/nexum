import { existsSync, readdirSync } from "fs";
import type Store from "electron-store";
import type {
  BackupConfig,
  LaunchArgsConfig,
  RestartConfig,
  ServerConfig,
  ValheimLaunchConfig,
  ValheimModifiers,
  AstroneerLaunchConfig,
  DragonwildsLaunchConfig,
} from "../../shared/types";
import type { AppStore } from "../ipc/context";

const DEFAULT_LAUNCH_ARGS: LaunchArgsConfig = {
  publicLobby: false,
  performanceFlags: false,
  customArgs: "",
};

const DEFAULT_MODIFIERS: ValheimModifiers = {
  combat: "",
  deathpenalty: "",
  resources: "",
  raids: "",
  portals: "",
};

const DEFAULT_VALHEIM_CONFIG: ValheimLaunchConfig = {
  name: "Mon Serveur Valheim",
  world: "Dedicated",
  password: "",
  port: 2456,
  public: true,
  savedir: "",
  crossplay: false,
  logFile: "",
  customArgs: "",
  worldSeed: "",
  worldSize: "",
  modifierPreset: "",
  modifiers: DEFAULT_MODIFIERS,
  odinEyeUrl: "",
};

const DEFAULT_ASTRONEER_CONFIG: AstroneerLaunchConfig = {
  customArgs: "",
};

const DEFAULT_DRAGONWILDS_CONFIG: DragonwildsLaunchConfig = {
  port: 7777,
  beaconPort: 8888,
  adminPassword: "",
  customArgs: "",
};

const DEFAULT_BACKUP: BackupConfig = {
  backupDir: "",
  backupKeep: 10,
  backupIntervalMinutes: 0,
};

const DEFAULT_RESTART: RestartConfig = {
  enabled: false,
  time: "04:00",
  warningMinutes: 5,
  message: "Le serveur va redémarrer dans {minutes} minutes",
};

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  launchArgs: DEFAULT_LAUNCH_ARGS,
  valheimConfig: DEFAULT_VALHEIM_CONFIG,
  astroneerConfig: DEFAULT_ASTRONEER_CONFIG,
  dragonwildsConfig: DEFAULT_DRAGONWILDS_CONFIG,
  backup: DEFAULT_BACKUP,
  restart: DEFAULT_RESTART,
};

export class ServerConfigStore {
  constructor(private store: Store<AppStore>) {}

  get(serverId: string): ServerConfig {
    const all = this.store.get(
      "serversConfig",
      {} as Record<string, ServerConfig>,
    );
    const existing = all[serverId];
    if (!existing) return DEFAULT_SERVER_CONFIG;
    return {
      launchArgs: { ...DEFAULT_LAUNCH_ARGS, ...existing.launchArgs },
      valheimConfig: { ...DEFAULT_VALHEIM_CONFIG, ...existing.valheimConfig },
      astroneerConfig: {
        ...DEFAULT_ASTRONEER_CONFIG,
        ...existing.astroneerConfig,
      },
      dragonwildsConfig: {
        ...DEFAULT_DRAGONWILDS_CONFIG,
        ...existing.dragonwildsConfig,
      },
      backup: { ...DEFAULT_BACKUP, ...existing.backup },
      restart: { ...DEFAULT_RESTART, ...existing.restart },
    };
  }

  update(serverId: string, patch: Partial<ServerConfig>): ServerConfig {
    const current = this.get(serverId);
    const next: ServerConfig = {
      launchArgs: { ...current.launchArgs, ...patch.launchArgs },
      valheimConfig: { ...current.valheimConfig, ...patch.valheimConfig },
      astroneerConfig: {
        ...current.astroneerConfig,
        ...patch.astroneerConfig,
      },
      dragonwildsConfig: {
        ...current.dragonwildsConfig,
        ...patch.dragonwildsConfig,
      },
      backup: { ...current.backup, ...patch.backup },
      restart: { ...current.restart, ...patch.restart },
    };
    const all = this.store.get(
      "serversConfig",
      {} as Record<string, ServerConfig>,
    );
    this.store.set("serversConfig", { ...all, [serverId]: next });
    return next;
  }

  remove(serverId: string): void {
    const all = this.store.get(
      "serversConfig",
      {} as Record<string, ServerConfig>,
    );
    if (!(serverId in all)) return;
    const next = { ...all };
    delete next[serverId];
    this.store.set("serversConfig", next);
  }

  /**
   * Migre les anciennes configs globales (launchArgs/backup/restartSchedule) vers
   * la config du premier serveur. No-op si déjà migré ou pas de legacy.
   * Appelé une fois au boot, après ServerRegistry.migrateLegacy().
   *
   * `legacyBackupDefault` est l'ancien dossier de backups partagé
   * (`{userData}/backups/`). Si l'utilisateur n'avait pas customisé son
   * backupDir mais qu'il y a des `.zip` dans ce dossier, on persiste
   * explicitement ce chemin pour préserver l'accès à ses backups existants
   * (sinon le nouveau default `{userData}/servers/<id>/backups/` serait vide).
   */
  migrateLegacy(firstServerId: string, legacyBackupDefault?: string): void {
    const all = this.store.get(
      "serversConfig",
      {} as Record<string, ServerConfig>,
    );
    if (all[firstServerId]) return; // déjà migré

    const legacyBackupDir = this.store.get("backupDir", "");
    const preservedBackupDir =
      legacyBackupDir ||
      (legacyBackupDefault && hasZipsIn(legacyBackupDefault)
        ? legacyBackupDefault
        : "");

    const legacy: ServerConfig = {
      launchArgs: this.store.get("launchArgs", DEFAULT_LAUNCH_ARGS),
      valheimConfig: DEFAULT_VALHEIM_CONFIG,
      astroneerConfig: DEFAULT_ASTRONEER_CONFIG,
      dragonwildsConfig: DEFAULT_DRAGONWILDS_CONFIG,
      backup: {
        backupDir: preservedBackupDir,
        backupKeep: this.store.get("backupKeep", 10),
        backupIntervalMinutes: this.store.get("backupIntervalMinutes", 0),
      },
      restart: this.store.get("restartSchedule", DEFAULT_RESTART),
    };
    this.store.set("serversConfig", { ...all, [firstServerId]: legacy });
  }
}

function hasZipsIn(dir: string): boolean {
  try {
    if (!existsSync(dir)) return false;
    return readdirSync(dir).some((f) => f.endsWith(".zip"));
  } catch {
    return false;
  }
}
