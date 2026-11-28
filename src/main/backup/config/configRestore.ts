import { normalize, sep } from "path";
import { writeFileSync } from "fs";
import type { IpcContext } from "../../ipc/context";
import { AppError } from "../../utils/appError";
import { backupBeforeWrite } from "../../utils/ini";
import { lt, managerLine } from "../../i18n/logStrings";
import { getLanguage } from "../../i18n/language";
import {
  createConfigBackup,
  isConfigBackupId,
  parseConfigBackupId,
  readConfigBackup,
} from "./configBackups";
import { configTargets, targetPathOf } from "./configSnapshot";

/**
 * Remet les fichiers d'une copie, serveur arrêté (le jeu réécrit sa config à
 * l'arrêt et en lit une partie au démarrage). La config actuelle est
 * **toujours** copiée avant (`beforeRestore`), même sans l'option. Un
 * fichier absent de la copie n'est pas supprimé.
 */
export function restoreConfigBackup(
  ctx: IpcContext,
  serverId: string,
  id: unknown,
): void {
  const manager = ctx.serverManagers.getOrCreate(serverId);
  const status = manager.getStatus();
  if (status !== "stopped" && status !== "crashed")
    throw new AppError("CONFIG_BACKUP_SERVER_RUNNING");
  const backup = readConfigBackup(ctx, serverId, id);
  createConfigBackup(ctx, serverId, "beforeRestore");
  for (const [name, content] of backup) {
    const path = targetPathOf(ctx, serverId, name);
    if (!path) continue;
    backupBeforeWrite(path);
    writeFileSync(path, content);
  }
  const createdAt = isConfigBackupId(id)
    ? parseConfigBackupId(id).createdAt
    : Date.now();
  const date = new Date(createdAt).toLocaleString(
    getLanguage() === "fr" ? "fr-FR" : "en-US",
    { dateStyle: "short", timeStyle: "short" },
  );
  manager.logOutsideSession(
    [managerLine(lt().configBackupRestored(date))],
    (line) => ctx.broadcastLog(serverId, line),
  );
}

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
