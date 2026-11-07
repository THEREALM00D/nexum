import { existsSync } from "fs";
import type { IpcContext } from "../ipc/context";
import type { BackupEntry, Server } from "../../shared/types";
import { getGameSavePath } from "../games/registry";
import { getGameSaveRequest } from "../games/saveRequests";
import { hasExpectedExe } from "../servers/detectGameType";
import { AppError, appErrorLogText } from "../utils/appError";
import { lt, managerLine } from "../i18n/logStrings";
import { newestMtime, waitForStableSave } from "./saveFiles";

interface BackupOptions {
  /** Sauvegarde d'avant mise à jour (suffixe, rotation à part). */
  beforeUpdate?: boolean;
  /** Où écrire les lignes `[Manager]` (défaut : session du serveur). */
  log?: (line: string) => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Heure d'une écriture du jeu, date comprise si ce n'est pas aujourd'hui. */
function saveTime(ms: number): string {
  const d = new Date(ms);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${time}`;
}

/**
 * Serveur lancé : demande au jeu de sauvegarder s'il sait le faire (API REST
 * Palworld), attend que les fichiers ne bougent plus, puis zippe. Si le jeu
 * a écrit pendant le ZIP, le ZIP est refait une fois. Sinon, la sauvegarde
 * contient la dernière autosauvegarde du jeu : on l'écrit avec son heure.
 * `notes` : lignes à écrire après « Sauvegarde créée » (ce qu'elle contient).
 */
async function backupRunningServer(
  ctx: IpcContext,
  server: Server,
  savePath: string,
  zip: () => Promise<BackupEntry>,
  log: (line: string) => void,
): Promise<{ entry: BackupEntry; notes: string[] }> {
  const request = getGameSaveRequest(
    server.gameType,
    server.path,
    ctx.configParser,
  );
  let requestedAt: number | undefined;
  if ("run" in request) {
    log(managerLine(lt().saveRequested));
    const at = Date.now();
    try {
      await request.run();
      requestedAt = at;
    } catch (e) {
      log(
        managerLine(
          lt().saveRequestFailed(appErrorLogText((e as Error).message)),
        ),
      );
    }
  }

  for (let attempt = 1; ; attempt++) {
    const wait = await waitForStableSave(savePath, {
      changedAfter: requestedAt,
    });
    if (requestedAt !== undefined && (wait.newest ?? 0) < requestedAt) {
      log(managerLine(lt().saveNotWritten));
      requestedAt = undefined;
    } else if (!wait.stable) {
      log(managerLine(lt().saveStillWriting));
    }

    const entry = await zip();
    const changed = newestMtime(savePath) !== wait.newest;
    if (changed && attempt === 1) {
      log(managerLine(lt().backupRetryChanged));
      ctx.backup.delete(entry.path);
      continue;
    }
    const notes: string[] = [];
    if (changed) notes.push(managerLine(lt().backupChangedDuringZip));
    if (requestedAt === undefined && wait.newest !== null) {
      notes.push(managerLine(lt().backupFromAutosave(saveTime(wait.newest))));
      if (
        "unavailable" in request &&
        request.unavailable === "restApiDisabled"
      ) {
        notes.push(managerLine(lt().backupRestApiHint));
      }
    }
    return { entry, notes };
  }
}

/**
 * Sauvegarde le monde d'un serveur dans son dossier de sauvegarde, puis
 * applique la rotation. Point d'entrée unique : bouton « Créer une
 * sauvegarde », sauvegarde automatique et sauvegarde d'avant mise à jour.
 * Serveur lancé : voir `backupRunningServer`.
 */
export async function backupServer(
  ctx: IpcContext,
  serverId: string,
  { beforeUpdate = false, log }: BackupOptions = {},
): Promise<BackupEntry> {
  const server = ctx.servers.list().find((s) => s.id === serverId);
  const serverPath = ctx.getServerPath(serverId);
  if (!server || !serverPath) throw new AppError("NO_SERVER_PATH");
  const cfg = ctx.getServerConfig(serverId);
  const dir = ctx.getBackupDir(serverId);
  const savePath = getGameSavePath(server.gameType, serverPath, cfg);
  const mgr = ctx.serverManagers.getOrCreate(serverId);
  const write = log ?? ((line: string) => mgr.log(line));
  const zip = () => ctx.backup.create(serverPath, dir, savePath, beforeUpdate);

  const { entry, notes } =
    mgr.getStatus() === "running" && existsSync(savePath)
      ? await backupRunningServer(ctx, server, savePath, zip, write)
      : { entry: await zip(), notes: [] };
  ctx.backup.rotate(dir, cfg.backup.backupKeep);
  write(managerLine(lt().backupCreated(entry.name)));
  notes.forEach(write);
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
    return await backupServer(ctx, serverId, { beforeUpdate: true, log });
  } catch (e) {
    throw new AppError("BACKUP_BEFORE_UPDATE_FAILED", {
      msg: (e as Error).message,
    });
  }
}
