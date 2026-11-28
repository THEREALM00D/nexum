import { join } from "path";
import {
  existsSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "fs";
import type { IpcContext } from "../../../ipc/context";
import type { ArkProfilePlayer } from "../../../../shared/types";
import { AppError } from "../../../utils/appError";
import { getLanguage } from "../../../i18n/language";
import { lt, managerLine } from "../../../i18n/logStrings";
import { arkRconClient } from "../rcon";
import { readProfileInfo, readTribeId } from "./profileFile";
import {
  isEosId,
  isVersionId,
  latestProfile,
  listVersions,
  profileFileName,
  profilesDir,
  rotateVersions,
  tribeLinkFileName,
  worldDir,
  writeVersion,
} from "./profileStore";

/** Erreur du disque (droits, lecteur absent, disque plein) → code traduit. */
function copyFailed(error: unknown): AppError {
  if (error instanceof AppError) return error;
  const fsError = error as NodeJS.ErrnoException;
  return new AppError("ARK_PROFILE_COPY_FAILED", {
    path: fsError?.path ?? "",
    detail: fsError?.code ?? String(error),
  });
}

/** Profil en cours d'écriture par le jeu : repris à la prochaine sauvegarde. */
const STILL_WRITING_MS = 3000;

/**
 * Copie les profils (et le lien et le fichier de tribu) qui ont changé depuis
 * leur dernière version : un profil inchangé n'est pas recopié, sinon les
 * sauvegardes horaires d'un joueur absent effaceraient ses anciennes versions.
 * Renvoie le nombre de profils copiés. Lève sur une erreur du disque.
 */
function backupChangedProfiles(
  ctx: IpcContext,
  serverId: string,
  eosIds?: string[],
): number {
  const world = worldDir(ctx, serverId);
  if (!existsSync(world)) return 0;
  const keep = ctx.getServerConfig(serverId).arkProfileBackup.keep;
  const store = profilesDir(ctx, serverId);
  let saved = 0;
  for (const name of readdirSync(world)) {
    const eosId = name.slice(0, -".arkprofile".length);
    if (name !== profileFileName(eosId) || !isEosId(eosId)) continue;
    if (eosIds && !eosIds.includes(eosId)) continue;
    const path = join(world, name);
    if (Date.now() - statSync(path).mtimeMs < STILL_WRITING_MS) continue;
    const profile = readFileSync(path);
    const playerDir = join(store, eosId);
    if (latestProfile(playerDir)?.equals(profile)) continue;

    const files = [{ name, content: profile }];
    const link = join(world, tribeLinkFileName(eosId));
    if (existsSync(link)) {
      files.push({
        name: tribeLinkFileName(eosId),
        content: readFileSync(link),
      });
      // La tribu est gardée pour référence, jamais restaurée (partagée).
      const tribeId = readTribeId(link);
      const tribe = tribeId ? join(world, `${tribeId}.arktribe`) : null;
      if (tribe && existsSync(tribe))
        files.push({
          name: `${tribeId}.arktribe`,
          content: readFileSync(tribe),
        });
    }
    writeVersion(playerDir, files);
    rotateVersions(playerDir, keep);
    saved++;
  }
  return saved;
}

const logLine = (ctx: IpcContext, serverId: string, line: string) =>
  ctx.serverManagers
    .getOrCreate(serverId)
    .logOutsideSession([managerLine(line)], (sent) =>
      ctx.broadcastLog(serverId, sent),
    );

/**
 * Sauvegarde des profils (planifiée, bouton, déconnexion d'un joueur). Ligne
 * dans les logs seulement si un profil a été copié ; annonce en jeu
 * (`announce`) si demandé et si RCON est activé. Lève sur une erreur du disque.
 */
export async function backupPlayerProfiles(
  ctx: IpcContext,
  serverId: string,
  options: { eosIds?: string[]; announce?: boolean } = {},
): Promise<number> {
  let saved: number;
  try {
    saved = backupChangedProfiles(ctx, serverId, options.eosIds);
  } catch (error) {
    throw copyFailed(error);
  }
  if (saved === 0) return 0;
  logLine(ctx, serverId, lt().arkProfilesSaved(saved));
  const running =
    ctx.serverManagers.getOrCreate(serverId).getStatus() === "running";
  if (
    options.announce &&
    running &&
    ctx.getServerConfig(serverId).arkProfileBackup.announce
  ) {
    await arkRconClient(ctx, serverId)
      ?.announce(lt().arkProfilesAnnounce)
      .catch(() => {});
  }
  return saved;
}

/** Joueurs qui ont au moins une version, le plus récemment sauvegardé d'abord. */
export function listProfilePlayers(
  ctx: IpcContext,
  serverId: string,
): ArkProfilePlayer[] {
  const store = profilesDir(ctx, serverId);
  if (!existsSync(store)) return [];
  return readdirSync(store)
    .filter(isEosId)
    .flatMap((eosId) => {
      const playerDir = join(store, eosId);
      const versions = listVersions(playerDir);
      if (versions.length === 0) return [];
      const info = readProfileInfo(
        join(playerDir, versions[0].id, profileFileName(eosId)),
      );
      return [{ eosId, ...info, versions }];
    })
    .sort(
      (first, second) =>
        second.versions[0].createdAt - first.versions[0].createdAt,
    );
}

/** Remplace un fichier du monde sans laisser de fichier à moitié écrit. */
function replaceFile(path: string, content: Buffer): void {
  const temporary = `${path}.nexum-tmp`;
  writeFileSync(temporary, content);
  renameSync(temporary, path);
}

/**
 * Remet le profil d'un joueur (`.arkprofile` + `.arktributetribe`) à une
 * version, serveur arrêté (il réécrirait le sien). Le fichier de tribu,
 * partagé par ses membres, n'est pas touché. Le profil actuel est d'abord
 * sauvegardé s'il a changé ; la version est lue avant, car la rotation de
 * cette sauvegarde peut la supprimer.
 */
export function restorePlayerProfile(
  ctx: IpcContext,
  serverId: string,
  eosId: unknown,
  versionId: unknown,
): void {
  if (!isEosId(eosId) || !isVersionId(versionId))
    throw new AppError("ARK_PROFILE_NOT_FOUND");
  const status = ctx.serverManagers.getOrCreate(serverId).getStatus();
  if (status !== "stopped" && status !== "crashed")
    throw new AppError("ARK_PROFILE_SERVER_RUNNING");

  const versionDir = join(profilesDir(ctx, serverId), eosId, versionId);
  const profilePath = join(versionDir, profileFileName(eosId));
  if (!existsSync(profilePath)) throw new AppError("ARK_PROFILE_NOT_FOUND");
  const profile = readFileSync(profilePath);
  const linkPath = join(versionDir, tribeLinkFileName(eosId));
  const link = existsSync(linkPath) ? readFileSync(linkPath) : null;
  const { playerName } = readProfileInfo(profilePath);
  const createdAt = listVersions(join(profilesDir(ctx, serverId), eosId)).find(
    (version) => version.id === versionId,
  )?.createdAt;

  try {
    backupChangedProfiles(ctx, serverId, [eosId]);
    const world = worldDir(ctx, serverId);
    replaceFile(join(world, profileFileName(eosId)), profile);
    if (link) replaceFile(join(world, tribeLinkFileName(eosId)), link);
  } catch (error) {
    throw copyFailed(error);
  }

  const date = new Date(createdAt ?? Date.now()).toLocaleString(
    getLanguage() === "fr" ? "fr-FR" : "en-US",
    { dateStyle: "short", timeStyle: "short" },
  );
  logLine(ctx, serverId, lt().arkProfileRestored(playerName ?? eosId, date));
}
