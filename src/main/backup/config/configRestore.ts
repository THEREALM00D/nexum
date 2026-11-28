import { join, normalize, sep } from "path";
import { writeFileSync } from "fs";
import type { IpcContext } from "../../ipc/context";
import { AppError } from "../../utils/appError";
import { backupBeforeWrite } from "../../utils/ini";
import { lt, managerLine } from "../../i18n/logStrings";
import { logDateTime } from "../../i18n/logDate";
import {
  configBackupError,
  createConfigBackup,
  parseConfigBackupId,
  readConfigBackup,
} from "./configBackups";
import { configTargets, targetPathOf } from "./configSnapshot";

const normalized = (path: string) => normalize(path).toLowerCase();

/**
 * Serveurs dont un fichier de config est `filePath` (ou est dans un de leurs
 * dossiers de config, comme `BepInEx/config`).
 */
export function serversOwningConfig(
  ctx: IpcContext,
  filePath: string,
): string[] {
  const wanted = normalized(filePath);
  return ctx.servers
    .list()
    .filter((server) =>
      configTargets(ctx, server.id).some((target) => {
        const path = normalized(target.path);
        return target.isDirectory
          ? wanted.startsWith(path + sep)
          : wanted === path;
      }),
    )
    .map((server) => server.id);
}

/**
 * Vrai si ce serveur ou un autre qui partage ses fichiers de config (deux
 * serveurs ARK dans le même dossier, savedir Valheim commun) n'est pas
 * arrêté : ARK réécrit sa config à l'arrêt, la restauration serait perdue.
 */
function configInUse(ctx: IpcContext, serverId: string): boolean {
  const owners = new Set([serverId]);
  for (const target of configTargets(ctx, serverId)) {
    const probe = target.isDirectory ? join(target.path, "_") : target.path;
    for (const owner of serversOwningConfig(ctx, probe)) owners.add(owner);
  }
  return [...owners].some((owner) => {
    const status = ctx.serverManagers.getOrCreate(owner).getStatus();
    return status !== "stopped" && status !== "crashed";
  });
}

/**
 * Remet les fichiers d'une copie, serveurs arrêtés. La config actuelle est
 * **toujours** copiée avant (`beforeRestore`), même sans l'option. Un fichier
 * absent de la copie n'est pas supprimé.
 */
export function restoreConfigBackup(
  ctx: IpcContext,
  serverId: string,
  id: unknown,
): void {
  if (configInUse(ctx, serverId))
    throw new AppError("CONFIG_BACKUP_SERVER_RUNNING");
  const backup = readConfigBackup(ctx, serverId, id);
  createConfigBackup(ctx, serverId, "beforeRestore");
  try {
    for (const [name, content] of backup) {
      const path = targetPathOf(ctx, serverId, name);
      if (!path) continue;
      backupBeforeWrite(path);
      writeFileSync(path, content);
    }
  } catch (error) {
    throw configBackupError(error, "CONFIG_RESTORE_FAILED");
  }
  // `id` validé par readConfigBackup.
  const date = logDateTime(parseConfigBackupId(id as string).createdAt);
  ctx.serverManagers
    .getOrCreate(serverId)
    .logOutsideSession([managerLine(lt().configBackupRestored(date))], (line) =>
      ctx.broadcastLog(serverId, line),
    );
}
