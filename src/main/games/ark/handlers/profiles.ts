import { ipcMain } from "electron/main";
import type { IpcContext } from "../../../ipc/context";
import type {
  ArkProfileBackupConfig,
  ArkProfilePlayer,
} from "../../../../shared/types";
import { appErrorLogText } from "../../../utils/appError";
import { lt } from "../../../i18n/logStrings";
import {
  backupPlayerProfiles,
  listProfilePlayers,
  logProfileLine,
} from "../profiles/profileBackups";
import { restorePlayerProfile } from "../profiles/profileRestore";

type Result = { success: boolean; saved?: number; error?: string };

/** Le jeu écrit le profil à la déconnexion : copié un peu après. */
const AFTER_LEAVE_MS = 15 * 1000;

// Erreurs déjà codées par profileBackups.ts.
const failure = (error: unknown): Result => ({
  success: false,
  error: (error as Error).message,
});

/**
 * Profil d'un joueur qui vient de partir (`onLeave` du suivi des joueurs,
 * qui passe par RCON). Seulement si la sauvegarde des profils est activée.
 */
export function backupProfileAfterLeave(
  ctx: IpcContext,
  serverId: string,
  eosId: string,
): void {
  const server = ctx.servers.list().find((item) => item.id === serverId);
  if (server?.gameType !== "ark") return;
  if (ctx.getServerConfig(serverId).arkProfileBackup.intervalMinutes <= 0)
    return;
  setTimeout(() => {
    // Serveur arrêté pendant l'attente : la ligne va dans une courte session.
    backupPlayerProfiles(ctx, serverId, { eosIds: [eosId] }).catch((error) =>
      logProfileLine(
        ctx,
        serverId,
        lt().arkProfilesFailed(appErrorLogText((error as Error).message)),
      ),
    );
  }, AFTER_LEAVE_MS);
}

// Onglet Profils des joueurs de la page Sauvegardes d'ARK. serverId explicite.
export function registerArkProfileHandlers(ctx: IpcContext): void {
  ipcMain.handle(
    "ark:profiles:getConfig",
    (_, serverId: string): ArkProfileBackupConfig =>
      ctx.getServerConfig(serverId).arkProfileBackup,
  );

  ipcMain.handle(
    "ark:profiles:setConfig",
    (_, serverId: string, config: ArkProfileBackupConfig) =>
      ctx.updateServerConfig(serverId, { arkProfileBackup: config })
        .arkProfileBackup,
  );

  ipcMain.handle(
    "ark:profiles:list",
    (_, serverId: string): ArkProfilePlayer[] =>
      listProfilePlayers(ctx, serverId),
  );

  ipcMain.handle(
    "ark:profiles:backupNow",
    async (_, serverId: string): Promise<Result> => {
      try {
        const saved = await backupPlayerProfiles(ctx, serverId, {
          announce: true,
        });
        return { success: true, saved };
      } catch (error) {
        return failure(error);
      }
    },
  );

  ipcMain.handle(
    "ark:profiles:restore",
    (_, serverId: string, eosId: unknown, versionId: unknown): Result => {
      try {
        restorePlayerProfile(ctx, serverId, eosId, versionId);
        return { success: true };
      } catch (error) {
        return failure(error);
      }
    },
  );
}
