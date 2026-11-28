import type { IpcContext } from "../../ipc/context";
import { ArkRconClient } from "./ArkRconClient";
import { readRconSettings } from "./gameUserSettingsIni";

/** Client RCON d'un serveur ARK, null si RCON est désactivé dans l'INI. */
export function arkRconClient(
  ctx: IpcContext,
  serverId: string,
): ArkRconClient | null {
  const rcon = readRconSettings(
    ctx.getServerPath(serverId),
    ctx.getServerConfig(serverId).arkConfig.rconPort,
  );
  return rcon.enabled ? new ArkRconClient(rcon.port, rcon.password) : null;
}
