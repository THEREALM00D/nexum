import type { IpcContext } from "../../ipc/context";
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
