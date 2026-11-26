import type { IpcContext } from "../../ipc/context";
import { appErrorLogText } from "../../utils/appError";
import { lt, managerLine } from "../../i18n/logStrings";
import { ArkRconClient } from "./ArkRconClient";
import { readRconSettings } from "./gameUserSettingsIni";

/** RCON répond lentement, voire pas, tant que le serveur charge le monde. */
const AFTER_START_RETRY_MS = 20 * 1000;
const AFTER_START_TIMEOUT_MS = 15 * 60 * 1000;

function rconClient(ctx: IpcContext, serverId: string): ArkRconClient | null {
  const rcon = readRconSettings(
    ctx.getServerPath(serverId),
    ctx.getServerConfig(serverId).arkConfig.rconPort,
  );
  return rcon.enabled ? new ArkRconClient(rcon.port, rcon.password) : null;
}

/**
 * `DestroyWildDinos` par RCON (pendant que le serveur tourne, toutes les
 * `wildDinos.everyHours`). Résultat écrit dans les logs du serveur.
 */
export async function destroyWildDinos(
  ctx: IpcContext,
  serverId: string,
): Promise<void> {
  const manager = ctx.serverManagers.getOrCreate(serverId);
  const client = rconClient(ctx, serverId);
  if (!client) {
    manager.log(managerLine(lt().wildDinosNoRcon));
    return;
  }
  try {
    await client.destroyWildDinos();
    manager.log(managerLine(lt().wildDinosDone));
  } catch (error) {
    manager.log(
      managerLine(
        lt().wildDinosFailed(appErrorLogText((error as Error).message)),
      ),
    );
  }
}

/**
 * Après un démarrage (`wildDinos.afterStart`) : nouvel essai toutes les
 * 20 s jusqu'à ce que RCON réponde, au plus 15 min. Abandonné si le serveur
 * s'arrête ou est relancé entre-temps.
 */
export async function destroyWildDinosAfterStart(
  ctx: IpcContext,
  serverId: string,
): Promise<void> {
  if (!ctx.getServerConfig(serverId).restart.wildDinos.afterStart) return;
  const manager = ctx.serverManagers.getOrCreate(serverId);
  const client = rconClient(ctx, serverId);
  if (!client) {
    manager.log(managerLine(lt().wildDinosNoRcon));
    return;
  }
  const pid = manager.getPid();
  const deadline = Date.now() + AFTER_START_TIMEOUT_MS;
  let lastError = "";
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, AFTER_START_RETRY_MS));
    if (manager.getStatus() !== "running" || manager.getPid() !== pid) return;
    try {
      await client.destroyWildDinos();
      manager.log(managerLine(lt().wildDinosDone));
      return;
    } catch (error) {
      lastError = (error as Error).message;
    }
  }
  manager.log(managerLine(lt().wildDinosFailed(appErrorLogText(lastError))));
}
