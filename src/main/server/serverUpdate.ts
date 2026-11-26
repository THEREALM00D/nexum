import type { IpcContext } from "../ipc/context";
import { isSteamLibraryInstall, STEAM_APP_IDS } from "../steamcmd/SteamCMD";
import { backupBeforeUpdate } from "../backup/serverBackup";
import { appErrorLogText } from "../utils/appError";
import { lt, managerLine } from "../i18n/logStrings";

// Mise à jour du jeu d'un serveur donné (pas du serveur actif) : redémarrage
// planifié, mise à jour trouvée pendant que le serveur tourne, actions
// groupées de la page Serveurs.

export interface PendingUpdate {
  installedBuild: string;
  latestBuild: string;
}

/**
 * Résultat d'une vérification. `unknown` : Steam injoignable ou build
 * illisible, jamais lu comme « pas à jour » (voir `checkGameUpdateOnStart`).
 */
export type UpdateCheck =
  | { kind: "available"; update: PendingUpdate }
  | { kind: "upToDate" | "unknown" | "steamLibrary" | "noSteamCmd" };

export async function checkServerUpdate(
  ctx: IpcContext,
  serverId: string,
): Promise<UpdateCheck> {
  const server = ctx.servers
    .list()
    .find((candidate) => candidate.id === serverId);
  if (!server?.path) return { kind: "unknown" };
  if (isSteamLibraryInstall(server.path)) return { kind: "steamLibrary" };
  if (!ctx.steamcmd.isInstalled()) return { kind: "noSteamCmd" };
  const result = await ctx.steamcmd.checkForUpdate(
    server.path,
    STEAM_APP_IDS[server.gameType],
  );
  if (result.installedBuild && result.requiredBuild) {
    return {
      kind: "available",
      update: {
        installedBuild: result.installedBuild,
        latestBuild: result.requiredBuild,
      },
    };
  }
  return { kind: result.upToDate ? "upToDate" : "unknown" };
}

/**
 * Mise à jour du jeu à installer, ou null : à jour, vérification impossible
 * ou serveur que Nexum ne met pas à jour (raison écrite par `log`).
 */
export async function findPendingUpdate(
  ctx: IpcContext,
  serverId: string,
  log: (line: string) => void,
): Promise<PendingUpdate | null> {
  const check = await checkServerUpdate(ctx, serverId);
  if (check.kind === "available") return check.update;
  if (check.kind === "steamLibrary")
    log(managerLine(lt().autoUpdateSkippedSteam));
  if (check.kind === "noSteamCmd")
    log(managerLine(lt().autoUpdateSkippedNoSteamCmd));
  if (check.kind === "upToDate") log(managerLine(lt().gameUpToDateRestart));
  return null;
}

export interface ServerUpdateResult {
  /** Lignes à écrire dans la session qui suit (serveur arrêté : pas de session). */
  report: string[];
  updated: boolean;
  /** Erreur codée de la sauvegarde ou de SteamCMD. */
  error?: string;
}

/**
 * Sauvegarde puis mise à jour SteamCMD, serveur arrêté. Les lignes écrites
 * serveur arrêté n'ont pas de session de log et la vue est vidée au
 * démarrage : le compte rendu est renvoyé pour la session suivante.
 * `onProgress` reçoit chaque ligne de SteamCMD (affichée aussi en direct).
 */
export async function updateStoppedServer(
  ctx: IpcContext,
  serverId: string,
  update: PendingUpdate,
  onProgress?: (line: string) => void,
): Promise<ServerUpdateResult> {
  const report: string[] = [];
  try {
    await backupBeforeUpdate(ctx, serverId, (line) => report.push(line));
  } catch (error) {
    const message = (error as Error).message;
    report.push(managerLine(lt().updateBackupFailed(appErrorLogText(message))));
    return { report, updated: false, error: message };
  }

  const server = ctx.servers
    .list()
    .find((candidate) => candidate.id === serverId);
  if (!server) return { report, updated: false };
  const result = await ctx.steamcmd.installGame(
    server.gameType,
    server.path,
    (line) => {
      ctx.broadcastLog(serverId, line);
      onProgress?.(line);
    },
  );
  report.push(
    result.success
      ? managerLine(lt().gameUpdated(update.installedBuild, update.latestBuild))
      : managerLine(
          lt().updateFailed(appErrorLogText(result.error ?? "SteamCMD")),
        ),
  );
  return {
    report,
    updated: result.success,
    error: result.success ? undefined : (result.error ?? "SteamCMD"),
  };
}

/** Pourcentage d'une ligne de SteamCMD (`… progress: 42.35 (…)`), ou null. */
export function parseSteamCmdPercent(line: string): number | null {
  const match = /progress:\s*(\d+(?:\.\d+)?)/i.exec(line);
  if (!match) return null;
  const percent = Number(match[1]);
  return percent >= 0 && percent <= 100 ? percent : null;
}
