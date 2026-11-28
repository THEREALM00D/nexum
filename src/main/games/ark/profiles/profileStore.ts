import { basename, dirname, join } from "path";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "fs";
import type { IpcContext } from "../../../ipc/context";
import type { ArkProfileVersion } from "../../../../shared/types";
import { getGameSavePath } from "../../registry";
import { EOS_ID } from "./profileFile";

/** Dossier d'une version : heure UTC, comme les ZIP du monde. */
const VERSION_ID = /^(\d{4}-\d{2}-\d{2})_(\d{2})-(\d{2})-(\d{2})(?:-\d+)?$/;

export const profileFileName = (eosId: string) => `${eosId}.arkprofile`;
export const tribeLinkFileName = (eosId: string) => `${eosId}.arktributetribe`;

/** Dossier du monde (carte choisie, `AltSaveDirectoryName` compris). */
export function worldDir(ctx: IpcContext, serverId: string): string {
  return getGameSavePath(
    "ark",
    ctx.getServerPath(serverId),
    ctx.getServerConfig(serverId),
  );
}

/**
 * `<dossier des sauvegardes>/player-profiles/<dossier du monde>/<Carte>/`
 * (`SavedArks` ou `AltSaveDirectoryName`) : les profils d'un autre monde,
 * même de la même carte, sont d'autres personnages.
 * `BackupManager.list` ne lit que les `.zip` : ce dossier ne s'y mêle pas.
 */
export function profilesDir(ctx: IpcContext, serverId: string): string {
  const world = worldDir(ctx, serverId);
  return join(
    ctx.getBackupDir(serverId),
    "player-profiles",
    basename(dirname(world)),
    basename(world),
  );
}

export const isEosId = (value: unknown): value is string =>
  typeof value === "string" && EOS_ID.test(value);
export const isVersionId = (value: unknown): value is string =>
  typeof value === "string" && VERSION_ID.test(value);

function createdAtOf(versionId: string): number {
  const [, day, hours, minutes, seconds] = versionId.match(VERSION_ID) ?? [];
  return Date.parse(`${day}T${hours}:${minutes}:${seconds}Z`);
}

/** Versions d'un joueur, plus récente d'abord. */
export function listVersions(playerDir: string): ArkProfileVersion[] {
  if (!existsSync(playerDir)) return [];
  const eosId = basename(playerDir);
  return readdirSync(playerDir)
    .filter(isVersionId)
    .flatMap((id) => {
      try {
        const size = statSync(join(playerDir, id, profileFileName(eosId))).size;
        return [{ id, createdAt: createdAtOf(id), size }];
      } catch {
        return [];
      }
    })
    .sort(
      (first, second) =>
        second.createdAt - first.createdAt || second.id.localeCompare(first.id),
    );
}

/** Nom libre pour une nouvelle version (deux sauvegardes dans la même seconde). */
function newVersionId(playerDir: string): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);
  let id = stamp;
  for (let index = 2; existsSync(join(playerDir, id)); index++)
    id = `${stamp}-${index}`;
  return id;
}

/**
 * Écrit une version (fichiers en mémoire) dans un dossier `.tmp` renommé à la
 * fin : une copie interrompue n'apparaît jamais comme une version.
 */
export function writeVersion(
  playerDir: string,
  files: { name: string; content: Buffer }[],
): void {
  mkdirSync(playerDir, { recursive: true });
  const id = newVersionId(playerDir);
  const temporary = join(playerDir, `${id}.tmp`);
  rmSync(temporary, { recursive: true, force: true });
  mkdirSync(temporary);
  for (const file of files)
    writeFileSync(join(temporary, file.name), file.content);
  renameSync(temporary, join(playerDir, id));
}

/** Garde les `keep` versions les plus récentes (et retire les `.tmp` restés). */
export function rotateVersions(playerDir: string, keep: number): void {
  for (const version of listVersions(playerDir).slice(keep))
    rmSync(join(playerDir, version.id), { recursive: true, force: true });
  for (const name of readdirSync(playerDir))
    if (name.endsWith(".tmp"))
      rmSync(join(playerDir, name), { recursive: true, force: true });
}

/** Contenu du profil de la dernière version, null s'il n'y en a pas. */
export function latestProfile(playerDir: string): Buffer | null {
  const [latest] = listVersions(playerDir);
  if (!latest) return null;
  try {
    return readFileSync(
      join(playerDir, latest.id, profileFileName(basename(playerDir))),
    );
  } catch {
    return null;
  }
}
