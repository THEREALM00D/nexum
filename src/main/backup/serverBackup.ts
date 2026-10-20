import { existsSync } from "fs";
import type { IpcContext } from "../ipc/context";
import type { BackupEntry } from "../../shared/types";
import { getGameSavePath } from "../games/registry";
import { hasExpectedExe } from "../servers/detectGameType";
import { AppError } from "../utils/appError";
import { lt, managerLine } from "../i18n/logStrings";

/**
 * Sauvegarde le monde d'un serveur dans son dossier de sauvegarde, puis
 * applique la rotation. Partagée par le bouton « Créer une sauvegarde », la
 * sauvegarde automatique et la sauvegarde d'avant mise à jour.
 */
export async function backupServer(
  ctx: IpcContext,
  serverId: string,
  beforeUpdate = false,
): Promise<BackupEntry> {
  const server = ctx.servers.list().find((s) => s.id === serverId);
  const serverPath = ctx.getServerPath(serverId);
  if (!server || !serverPath) throw new AppError("NO_SERVER_PATH");
  const cfg = ctx.getServerConfig(serverId);
  const dir = ctx.getBackupDir(serverId);
  const entry = await ctx.backup.create(
    serverPath,
    dir,
    getGameSavePath(server.gameType, serverPath, cfg),
    beforeUpdate,
  );
  ctx.backup.rotate(dir, cfg.backup.backupKeep);
  return entry;
}

/**
 * Sauvegarde le monde avant une mise à jour du jeu (SteamCMD) ou des mods :
 * un patch qui casse la sauvegarde ne fait plus perdre de progression.
 *
 * Renvoie null quand il n'y a rien à faire : option désactivée, première
 * installation (pas d'exécutable, donc pas encore de monde ; pour Valheim, le
 * dossier des mondes serait celui du jeu solo) ou aucun monde sur le disque.
 * Lève `BACKUP_BEFORE_UPDATE_FAILED` si la sauvegarde échoue : l'appelant
 * annule alors la mise à jour.
 */
export async function backupBeforeUpdate(
  ctx: IpcContext,
  serverId: string,
  log: (line: string) => void,
): Promise<BackupEntry | null> {
  const server = ctx.servers.list().find((s) => s.id === serverId);
  if (!server?.path) return null;
  const cfg = ctx.getServerConfig(serverId);
  if (!cfg.backup.backupBeforeUpdate) return null;
  if (!hasExpectedExe(server.path, server.gameType)) return null;
  if (!existsSync(getGameSavePath(server.gameType, server.path, cfg))) {
    log(managerLine(lt().backupNoWorld));
    return null;
  }

  log(managerLine(lt().backupBeforeUpdate));
  try {
    const entry = await backupServer(ctx, serverId, true);
    log(managerLine(lt().backupCreated(entry.name)));
    return entry;
  } catch (e) {
    throw new AppError("BACKUP_BEFORE_UPDATE_FAILED", {
      msg: (e as Error).message,
    });
  }
}
