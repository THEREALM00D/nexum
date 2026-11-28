import { dirname, join } from "path";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "fs";
import type { IpcContext } from "../../ipc/context";
import type {
  ConfigBackupEntry,
  ConfigBackupReason,
} from "../../../shared/types";
import { AppError } from "../../utils/appError";
import {
  changedBetween,
  folderIndex,
  readCurrentConfig,
  readSnapshotFolder,
  sameSnapshot,
  type ConfigSnapshot,
} from "./configSnapshot";

// Copies des fichiers de config du jeu : un dossier par copie, nommé
// `config-<date UTC à la milliseconde>[_<n>][-<raison>]`, dans
// `<dossier des sauvegardes>/config/`. Millisecondes : deux copies de la
// même seconde (avant enregistrement puis avant démarrage) restent dans le
// bon ordre pour la comparaison et la rotation.
const SUFFIXES: Record<ConfigBackupReason, string> = {
  manual: "",
  interval: "-interval",
  beforeSave: "-before-save",
  beforeStart: "-before-start",
  beforeRestore: "-before-restore",
};
const BACKUP_ID =
  /^config-(\d{4}-\d{2}-\d{2})_(\d{2})-(\d{2})-(\d{2})(?:-(\d{3}))?(?:_(\d+))?(-interval|-before-save|-before-start|-before-restore)?$/;

export const configBackupDir = (ctx: IpcContext, serverId: string) =>
  join(ctx.getBackupDir(serverId), "config");

export const isConfigBackupId = (value: unknown): value is string =>
  typeof value === "string" && BACKUP_ID.test(value);

export function parseConfigBackupId(id: string): {
  createdAt: number;
  sequence: number;
  reason: ConfigBackupReason;
} {
  const [, day, hours, minutes, seconds, millis, sequence, suffix] =
    id.match(BACKUP_ID) ?? [];
  const reason = (Object.entries(SUFFIXES).find(
    ([, text]) => text === (suffix ?? ""),
  )?.[0] ?? "manual") as ConfigBackupReason;
  return {
    createdAt: Date.parse(
      `${day}T${hours}:${minutes}:${seconds}.${millis ?? "000"}Z`,
    ),
    sequence: Number(sequence ?? 1),
    reason,
  };
}

/** Copies du serveur, plus récente d'abord. */
function backupIds(ctx: IpcContext, serverId: string): string[] {
  const folder = configBackupDir(ctx, serverId);
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter(isConfigBackupId)
    .map((id) => ({ id, ...parseConfigBackupId(id) }))
    .sort(
      (first, second) =>
        second.createdAt - first.createdAt || second.sequence - first.sequence,
    )
    .map((backup) => backup.id);
}

function newId(folder: string, reason: ConfigBackupReason): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 23);
  let id = `config-${stamp}${SUFFIXES[reason]}`;
  for (let index = 2; existsSync(join(folder, id)); index++)
    id = `config-${stamp}_${index}${SUFFIXES[reason]}`;
  return id;
}

function writeSnapshot(folder: string, snapshot: ConfigSnapshot): void {
  for (const [name, content] of snapshot) {
    const path = join(folder, ...name.split("/"));
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
}

/** Erreur codée telle quelle, erreur du disque → `code` (chemin + code système). */
export function configBackupError(
  error: unknown,
  code:
    "CONFIG_BACKUP_FAILED" | "CONFIG_RESTORE_FAILED" = "CONFIG_BACKUP_FAILED",
): AppError {
  if (error instanceof AppError) return error;
  const fsError = error as NodeJS.ErrnoException;
  return new AppError(code, {
    path: fsError?.path ?? "",
    detail: fsError?.code ?? String(error),
  });
}

/**
 * Copie la config actuelle si elle diffère de la dernière copie (sinon rien :
 * renvoie null). Dossier `.tmp` renommé à la fin, puis rotation (`keep`).
 */
export function createConfigBackup(
  ctx: IpcContext,
  serverId: string,
  reason: ConfigBackupReason,
): string | null {
  try {
    const current = readCurrentConfig(ctx, serverId);
    if (current.size === 0) return null;
    const folder = configBackupDir(ctx, serverId);
    const [latest] = backupIds(ctx, serverId);
    if (
      latest &&
      sameSnapshot(current, readSnapshotFolder(join(folder, latest)))
    )
      return null;
    mkdirSync(folder, { recursive: true });
    const id = newId(folder, reason);
    const temporary = join(folder, `${id}.tmp`);
    rmSync(temporary, { recursive: true, force: true });
    writeSnapshot(temporary, current);
    renameSync(temporary, join(folder, id));
    const { keep } = ctx.getServerConfig(serverId).configBackup;
    for (const old of backupIds(ctx, serverId).slice(keep))
      rmSync(join(folder, old), { recursive: true, force: true });
    return id;
  } catch (error) {
    throw configBackupError(error);
  }
}

/**
 * Liste sans tout relire : tailles par `stat`, contenu lu seulement pour un
 * fichier de même taille dans deux copies voisines.
 */
export function listConfigBackups(
  ctx: IpcContext,
  serverId: string,
): ConfigBackupEntry[] {
  const folder = configBackupDir(ctx, serverId);
  const ids = backupIds(ctx, serverId);
  const indexes = ids.map((id) => folderIndex(join(folder, id)));
  return ids.map((id, position) => {
    const { createdAt, reason } = parseConfigBackupId(id);
    const index = indexes[position];
    return {
      id,
      createdAt,
      reason,
      files: [...index.keys()].sort(),
      changed: changedBetween(index, indexes[position + 1] ?? null).sort(),
      size: [...index.values()].reduce((sum, file) => sum + file.size, 0),
    };
  });
}

export function deleteConfigBackup(
  ctx: IpcContext,
  serverId: string,
  id: unknown,
): void {
  if (!isConfigBackupId(id)) throw new AppError("CONFIG_BACKUP_NOT_FOUND");
  rmSync(join(configBackupDir(ctx, serverId), id), {
    recursive: true,
    force: true,
  });
}

export function readConfigBackup(
  ctx: IpcContext,
  serverId: string,
  id: unknown,
): ConfigSnapshot {
  if (!isConfigBackupId(id)) throw new AppError("CONFIG_BACKUP_NOT_FOUND");
  const folder = join(configBackupDir(ctx, serverId), id);
  if (!existsSync(folder)) throw new AppError("CONFIG_BACKUP_NOT_FOUND");
  return readSnapshotFolder(folder);
}
