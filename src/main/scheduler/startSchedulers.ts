import type { IpcContext } from "../ipc/context";
import { backupServer } from "../backup/serverBackup";
import { destroyWildDinos } from "../games/ark/wildDinos";
import { backupPlayerProfiles } from "../games/ark/profiles/profileBackups";
import { appErrorLogText } from "../utils/appError";
import { lt, managerLine } from "../i18n/logStrings";
import { nextRestartAt } from "../../shared/restartSchedule";
import { IntervalScheduler } from "./IntervalScheduler";
import { runScheduledRestart } from "./scheduledRestart";
import { checkUpdateWhileRunning } from "./updateWatch";

/** Planificateurs à intervalle, instanciés une fois dans `registerIpcHandlers`. */
export interface IntervalSchedulers {
  backup: IntervalScheduler;
  updateCheck: IntervalScheduler;
  wildDinos: IntervalScheduler;
  arkProfiles: IntervalScheduler;
}

export function createIntervalSchedulers(): IntervalSchedulers {
  return {
    backup: new IntervalScheduler(),
    updateCheck: new IntervalScheduler(),
    wildDinos: new IntervalScheduler(),
    arkProfiles: new IntervalScheduler(),
  };
}

/**
 * Démarre les tâches planifiées de tous les serveurs : redémarrage, sauvegarde
 * auto, vérification des mises à jour, créatures sauvages et profils des
 * joueurs d'ARK. Chaque
 * tick relit la config : un réglage changé s'applique sans rien réarmer.
 */
export function startSchedulers(
  ctx: IpcContext,
  schedulers: IntervalSchedulers,
): void {
  const isRunning = (serverId: string) =>
    ctx.serverManagers
      .entries()
      .find((entry) => entry.serverId === serverId)
      ?.manager.getStatus() === "running";
  const schedulesOf = (intervalMinutes: (serverId: string) => number) => () =>
    ctx.servers.list().map((server) => ({
      serverId: server.id,
      intervalMinutes: intervalMinutes(server.id),
      running: isRunning(server.id),
    }));

  // Sauvegarde automatique de chaque serveur lancé, à son intervalle.
  schedulers.backup.start(
    schedulesOf(
      (serverId) => ctx.getServerConfig(serverId).backup.backupIntervalMinutes,
    ),
    async (serverId) => {
      // Arrêté pendant l'attente dans la file : rien à faire.
      if (!isRunning(serverId)) return;
      // Un échec était avalé sans trace : il va dans les logs du serveur.
      try {
        await backupServer(ctx, serverId);
      } catch (error) {
        ctx.serverManagers
          .getOrCreate(serverId)
          .log(
            managerLine(
              lt().autoBackupFailed(appErrorLogText((error as Error).message)),
            ),
          );
      }
    },
  );

  // Redémarrage planifié : l'heure configurée est celle de l'arrêt.
  ctx.restartScheduler.start(
    () =>
      ctx.servers.list().map((server) => ({
        serverId: server.id,
        config: ctx.getServerConfig(server.id).restart,
        running: isRunning(server.id),
      })),
    async (serverId, stopAt) => {
      await runScheduledRestart(ctx, serverId, {
        stopAt,
        warnings: ctx.getServerConfig(serverId).restart.warnings,
        kind: "restart",
        // Annulé si l'heure n'est plus planifiée (désactivé, heure retirée).
        stillWanted: () => {
          const restart = ctx.getServerConfig(serverId).restart;
          return (
            restart.enabled &&
            nextRestartAt(restart, new Date(stopAt - 1000))?.getTime() ===
              stopAt
          );
        },
      });
    },
  );

  // Vérification de la version du jeu pendant que le serveur tourne.
  schedulers.updateCheck.start(
    schedulesOf((serverId) => {
      const { restart } = ctx.getServerConfig(serverId);
      return restart.checkUpdates ? restart.checkUpdatesHours * 60 : 0;
    }),
    (serverId) => checkUpdateWhileRunning(ctx, serverId),
  );

  // ARK : DestroyWildDinos à intervalle (après le démarrage : afterStart.ts).
  schedulers.wildDinos.start(
    schedulesOf((serverId) => {
      const server = ctx.servers.list().find((item) => item.id === serverId);
      const { wildDinos } = ctx.getServerConfig(serverId).restart;
      return server?.gameType === "ark" && wildDinos.repeat
        ? wildDinos.everyHours * 60
        : 0;
    }),
    async (serverId) => {
      if (isRunning(serverId)) await destroyWildDinos(ctx, serverId);
    },
  );

  // ARK : profils des joueurs (seulement ceux qui ont changé), à intervalle.
  schedulers.arkProfiles.start(
    schedulesOf((serverId) => {
      const server = ctx.servers.list().find((item) => item.id === serverId);
      return server?.gameType === "ark"
        ? ctx.getServerConfig(serverId).arkProfileBackup.intervalMinutes
        : 0;
    }),
    async (serverId) => {
      if (!isRunning(serverId)) return;
      try {
        await backupPlayerProfiles(ctx, serverId, { announce: true });
      } catch (error) {
        ctx.serverManagers
          .getOrCreate(serverId)
          .log(
            managerLine(
              lt().arkProfilesFailed(appErrorLogText((error as Error).message)),
            ),
          );
      }
    },
  );
}
