import { join } from "path";
import { existsSync, readFileSync, renameSync, writeFileSync } from "fs";
import type { IpcContext } from "../../../ipc/context";
import { AppError } from "../../../utils/appError";
import { getLanguage } from "../../../i18n/language";
import { lt } from "../../../i18n/logStrings";
import { readProfileInfo } from "./profileFile";
import {
  isEosId,
  isVersionId,
  listVersions,
  profileFileName,
  profilesDir,
  tribeLinkFileName,
  worldDir,
} from "./profileStore";
import {
  backupChangedProfiles,
  diskError,
  logProfileLine,
} from "./profileBackups";

/** Remplace un fichier du monde sans laisser de fichier à moitié écrit. */
function replaceFile(path: string, content: Buffer): void {
  const temporary = `${path}.nexum-tmp`;
  writeFileSync(temporary, content);
  renameSync(temporary, path);
}

/** Fichiers d'une version, lus en mémoire. */
function readVersion(versionDir: string, eosId: string) {
  const profilePath = join(versionDir, profileFileName(eosId));
  if (!existsSync(profilePath)) throw new AppError("ARK_PROFILE_NOT_FOUND");
  try {
    const linkPath = join(versionDir, tribeLinkFileName(eosId));
    return {
      profile: readFileSync(profilePath),
      link: existsSync(linkPath) ? readFileSync(linkPath) : null,
      playerName: readProfileInfo(profilePath).playerName,
    };
  } catch (error) {
    throw diskError(error, "ARK_PROFILE_READ_FAILED");
  }
}

/**
 * Remet le profil d'un joueur (`.arkprofile` + `.arktributetribe`) à une
 * version, serveur arrêté (il réécrirait le sien). Le fichier de tribu,
 * partagé par ses membres, n'est pas touché. Le profil actuel est d'abord
 * sauvegardé (sans le délai « en cours d'écriture » : l'arrêt du jeu vient
 * de l'écrire) ; la version est lue avant, car la rotation de cette
 * sauvegarde peut la supprimer.
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

  const playerDir = join(profilesDir(ctx, serverId), eosId);
  const version = readVersion(join(playerDir, versionId), eosId);
  const createdAt = listVersions(playerDir).find(
    (candidate) => candidate.id === versionId,
  )?.createdAt;

  const world = worldDir(ctx, serverId);
  const current = join(world, profileFileName(eosId));
  const hadProfile = existsSync(current);
  backupChangedProfiles(ctx, serverId, {
    eosIds: [eosId],
    waitForWrites: false,
  });
  try {
    replaceFile(current, version.profile);
    if (version.link)
      replaceFile(join(world, tribeLinkFileName(eosId)), version.link);
  } catch (error) {
    throw diskError(error, "ARK_PROFILE_COPY_FAILED");
  }

  const date = new Date(createdAt ?? Date.now()).toLocaleString(
    getLanguage() === "fr" ? "fr-FR" : "en-US",
    { dateStyle: "short", timeStyle: "short" },
  );
  logProfileLine(
    ctx,
    serverId,
    lt().arkProfileRestored(version.playerName ?? eosId, date, hadProfile),
  );
}
