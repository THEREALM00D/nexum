import { existsSync, readdirSync } from "fs";
import type Store from "electron-store";
import type { ServerConfig } from "../../shared/types";
import {
  DEFAULT_ASTRONEER_CONFIG,
  DEFAULT_BACKUP,
  DEFAULT_DRAGONWILDS_CONFIG,
  DEFAULT_ENSHROUDED_CONFIG,
  DEFAULT_LAUNCH_ARGS,
} from "./configDefaults";
import type { AppStore } from "../ipc/context";
import { DEFAULT_RESTART } from "../../shared/restartSchedule";
import { withRestartDefaults } from "./restartDefaults";
import {
  DEFAULT_ARK_PROFILE_BACKUP,
  sanitizeArkProfileBackup,
} from "../../shared/arkProfiles";
import {
  DEFAULT_VALHEIM_CONFIG,
  storedValheimConfig,
  withValheimDefaults,
} from "./valheimDefaults";
import {
  DEFAULT_ARK_CONFIG,
  sanitizeArkLaunch,
} from "../games/ark/launchConfig";

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  launchArgs: DEFAULT_LAUNCH_ARGS,
  valheimConfig: DEFAULT_VALHEIM_CONFIG,
  astroneerConfig: DEFAULT_ASTRONEER_CONFIG,
  dragonwildsConfig: DEFAULT_DRAGONWILDS_CONFIG,
  enshroudedConfig: DEFAULT_ENSHROUDED_CONFIG,
  arkConfig: DEFAULT_ARK_CONFIG,
  backup: DEFAULT_BACKUP,
  restart: DEFAULT_RESTART,
  arkProfileBackup: DEFAULT_ARK_PROFILE_BACKUP,
};

export class ServerConfigStore {
  constructor(private store: Store<AppStore>) {}

  get(serverId: string): ServerConfig {
    const all = this.store.get(
      "serversConfig",
      {} as Record<string, ServerConfig>,
    );
    const existing = all[serverId];
    if (!existing)
      return { ...DEFAULT_SERVER_CONFIG, valheimConfig: withValheimDefaults() };
    return {
      launchArgs: { ...DEFAULT_LAUNCH_ARGS, ...existing.launchArgs },
      valheimConfig: withValheimDefaults(existing.valheimConfig),
      astroneerConfig: {
        ...DEFAULT_ASTRONEER_CONFIG,
        ...existing.astroneerConfig,
      },
      dragonwildsConfig: {
        ...DEFAULT_DRAGONWILDS_CONFIG,
        ...existing.dragonwildsConfig,
      },
      enshroudedConfig: {
        ...DEFAULT_ENSHROUDED_CONFIG,
        ...existing.enshroudedConfig,
      },
      arkConfig: sanitizeArkLaunch(existing.arkConfig),
      backup: { ...DEFAULT_BACKUP, ...existing.backup },
      restart: withRestartDefaults(existing.restart),
      arkProfileBackup: sanitizeArkProfileBackup(existing.arkProfileBackup),
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
      enshroudedConfig: {
        ...current.enshroudedConfig,
        ...patch.enshroudedConfig,
      },
      arkConfig: { ...current.arkConfig, ...patch.arkConfig },
      backup: { ...current.backup, ...patch.backup },
      restart: withRestartDefaults(patch.restart, current.restart),
      arkProfileBackup: sanitizeArkProfileBackup({
        ...current.arkProfileBackup,
        ...patch.arkProfileBackup,
      }),
    };
    const all = this.store.get(
      "serversConfig",
      {} as Record<string, ServerConfig>,
    );
    this.store.set("serversConfig", {
      ...all,
      [serverId]: {
        ...next,
        valheimConfig: storedValheimConfig(next.valheimConfig),
      },
    });
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
      enshroudedConfig: DEFAULT_ENSHROUDED_CONFIG,
      arkConfig: DEFAULT_ARK_CONFIG,
      backup: {
        backupDir: preservedBackupDir,
        backupKeep: this.store.get("backupKeep", 10),
        backupIntervalMinutes: this.store.get("backupIntervalMinutes", 0),
        backupBeforeUpdate: DEFAULT_BACKUP.backupBeforeUpdate,
      },
      restart: withRestartDefaults(this.store.get("restartSchedule")),
      arkProfileBackup: DEFAULT_ARK_PROFILE_BACKUP,
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
