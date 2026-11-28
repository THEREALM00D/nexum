import { join } from "path";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import type { IpcContext } from "../../../ipc/context";
import type { ArkProfilePlayer } from "../../../../shared/types";
import { AppError } from "../../../utils/appError";
import { lt, managerLine } from "../../../i18n/logStrings";
import { arkRconClient } from "../rcon";
import { readProfileInfo, readTribeId } from "./profileFile";
import {
  isEosId,
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
export function diskError(
  error: unknown,
  code: "ARK_PROFILE_COPY_FAILED" | "ARK_PROFILE_READ_FAILED",
): AppError {
  if (error instanceof AppError) return error;
  const fsError = error as NodeJS.ErrnoException;
  return new AppError(code, {
    path: fsError?.path ?? "",
    detail: fsError?.code ?? String(error),
  });
}

/** Ligne `[Manager]`, serveur lancé ou non (courte session à elle sinon). */
export const logProfileLine = (
  ctx: IpcContext,
  serverId: string,
  line: string,
) =>
  ctx.serverManagers
    .getOrCreate(serverId)
    .logOutsideSession([managerLine(line)], (sent) =>
      ctx.broadcastLog(serverId, sent),
    );

/** Profil en cours d'écriture par le jeu : repris à la prochaine sauvegarde. */
const STILL_WRITING_MS = 3000;

/** Copie un profil s'il a changé depuis sa dernière version ; vrai si copié. */
function backupProfile(
  world: string,
  playerDir: string,
  eosId: string,
  options: { keep: number; waitForWrites: boolean },
): boolean {
  const name = profileFileName(eosId);
  const path = join(world, name);
  const modifiedAt = statSync(path).mtimeMs;
  const age = Date.now() - modifiedAt;
  // Daté dans le futur (horloge changée) : âge négatif, pas « en écriture ».
  if (options.waitForWrites && age >= 0 && age < STILL_WRITING_MS) return false;
  // Pas modifié depuis la dernière version : inutile de le relire.
  const [latest] = listVersions(playerDir);
  if (latest && modifiedAt < latest.createdAt) return false;
  const profile = readFileSync(path);
  if (latestProfile(playerDir)?.equals(profile)) return false;

  const files = [{ name, content: profile }];
  const link = join(world, tribeLinkFileName(eosId));
  if (existsSync(link)) {
    files.push({ name: tribeLinkFileName(eosId), content: readFileSync(link) });
    // La tribu est gardée pour référence, jamais restaurée (partagée).
    const tribeId = readTribeId(link);
    const tribe = tribeId ? join(world, `${tribeId}.arktribe`) : null;
    if (tribe && existsSync(tribe))
      files.push({ name: `${tribeId}.arktribe`, content: readFileSync(tribe) });
  }
  writeVersion(playerDir, files);
  rotateVersions(playerDir, options.keep);
  return true;
}

/**
 * Copie les profils (et le lien et le fichier de tribu) qui ont changé depuis
 * leur dernière version : un profil inchangé n'est pas recopié, sinon les
 * sauvegardes horaires d'un joueur absent effaceraient ses anciennes versions.
 * Un profil illisible n'empêche pas les autres : la 1re erreur est levée à la
 * fin, codée. `waitForWrites` faux (restauration, serveur arrêté) : même un
 * profil écrit il y a moins de 3 s est copié.
 */
export function backupChangedProfiles(
  ctx: IpcContext,
  serverId: string,
  options: { eosIds?: string[]; waitForWrites?: boolean } = {},
): number {
  const world = worldDir(ctx, serverId);
  if (!existsSync(world)) return 0;
  const keep = ctx.getServerConfig(serverId).arkProfileBackup.keep;
  const store = profilesDir(ctx, serverId);
  // EOS ID comparés sans casse (ListPlayers et noms de fichiers).
  const wanted = options.eosIds?.map((eosId) => eosId.toLowerCase());
  let saved = 0;
  let firstError: unknown = null;
  let names: string[];
  try {
    names = readdirSync(world);
  } catch (error) {
    throw diskError(error, "ARK_PROFILE_READ_FAILED");
  }
  for (const name of names) {
    const eosId = name.slice(0, -".arkprofile".length);
    if (name !== profileFileName(eosId) || !isEosId(eosId)) continue;
    if (wanted && !wanted.includes(eosId.toLowerCase())) continue;
    try {
      const copied = backupProfile(world, join(store, eosId), eosId, {
        keep,
        waitForWrites: options.waitForWrites ?? true,
      });
      if (copied) saved++;
    } catch (error) {
      firstError ??= error;
    }
  }
  if (firstError) throw diskError(firstError, "ARK_PROFILE_COPY_FAILED");
  return saved;
}

/**
 * Sauvegarde des profils (planifiée, bouton, déconnexion d'un joueur). Ligne
 * dans les logs seulement si un profil a été copié ; annonce en jeu
 * (`announce`) si demandé et si RCON est activé. Lève une erreur codée.
 */
export async function backupPlayerProfiles(
  ctx: IpcContext,
  serverId: string,
  options: { eosIds?: string[]; announce?: boolean } = {},
): Promise<number> {
  const saved = backupChangedProfiles(ctx, serverId, {
    eosIds: options.eosIds,
  });
  if (saved === 0) return 0;
  logProfileLine(ctx, serverId, lt().arkProfilesSaved(saved));
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
  try {
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
  } catch (error) {
    throw diskError(error, "ARK_PROFILE_READ_FAILED");
  }
}
