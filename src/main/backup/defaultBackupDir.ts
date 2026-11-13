import { join, resolve } from "path";
import type { ServerRegistry } from "../servers/ServerRegistry";
import type { ServerConfigStore } from "../servers/ServerConfigStore";

// `backupDir` vide = dossier par défaut du serveur, résolu à chaque usage
// (`ctx.getBackupDir`). `backup:getConfig` renvoie le dossier effectif et la
// page Sauvegardes renvoie toute la config : sans ce garde-fou, changer la
// rotation enregistrait le défaut en chemin absolu, qui ne suivait plus le
// dossier de données.

export function defaultBackupDirForServer(
  userDataPath: string,
  serverId: string,
): string {
  return join(userDataPath, "servers", serverId, "backups");
}

/** Chemin comparable : absolu, sans séparateur final, sans casse (Windows). */
function comparablePath(path: string): string {
  return resolve(path)
    .replace(/[\\/]+$/, "")
    .toLowerCase();
}

export function isDefaultBackupDir(
  backupDir: string,
  userDataPath: string,
  serverId: string,
): boolean {
  if (!backupDir.trim()) return true;
  return (
    comparablePath(backupDir) ===
    comparablePath(defaultBackupDirForServer(userDataPath, serverId))
  );
}

/** Au démarrage : remet à vide les dossiers par défaut déjà enregistrés. */
export function clearSavedDefaultBackupDirs(
  servers: ServerRegistry,
  serverConfigs: ServerConfigStore,
  userDataPath: string,
): void {
  for (const server of servers.list()) {
    const { backup } = serverConfigs.get(server.id);
    if (!backup.backupDir) continue;
    if (!isDefaultBackupDir(backup.backupDir, userDataPath, server.id))
      continue;
    serverConfigs.update(server.id, { backup: { ...backup, backupDir: "" } });
  }
}
