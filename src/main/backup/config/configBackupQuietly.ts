import type { IpcContext } from "../../ipc/context";
import type { GameType } from "../../../shared/types";
import { getLaunchSpec, type LaunchSpec } from "../../games/registry";
import { appErrorLogText } from "../../utils/appError";
import { lt, managerLine } from "../../i18n/logStrings";
import { createConfigBackup } from "./configBackups";

/**
 * Copie de la config sans bloquer ce qui la déclenche (démarrage, écriture) :
 * un échec va dans les logs du serveur.
 */
export function configBackupQuietly(
  ctx: IpcContext,
  serverId: string,
  reason: "interval" | "beforeSave" | "beforeStart",
): void {
  try {
    createConfigBackup(ctx, serverId, reason);
  } catch (error) {
    ctx.serverManagers
      .getOrCreate(serverId)
      .logOutsideSession(
        [
          managerLine(
            lt().configBackupFailed(appErrorLogText((error as Error).message)),
          ),
        ],
        (line) => ctx.broadcastLog(serverId, line),
      );
  }
}

/**
 * Spec de lancement dont le `prepare` est précédé de la copie « avant
 * démarrage » : exécuté par `ServerManager.start` juste avant le lancement,
 * donc **après** l'arrêt lors d'un redémarrage (ARK réécrit sa config à
 * l'arrêt). Jamais bloquant.
 */
export function launchSpecWithConfigBackup(
  ctx: IpcContext,
  serverId: string,
  gameType: GameType,
): LaunchSpec {
  const spec = getLaunchSpec(
    gameType,
    ctx.getServerPath(serverId),
    ctx.getServerConfig(serverId),
  );
  return {
    ...spec,
    prepare: () => {
      if (ctx.getServerConfig(serverId).configBackup.beforeStart)
        configBackupQuietly(ctx, serverId, "beforeStart");
      return spec.prepare?.() ?? null;
    },
  };
}
