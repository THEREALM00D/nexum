import { ipcMain } from "electron/main";
import type { IpcContext } from "../../../ipc/context";
import type {
  DragonwildsLaunchConfig,
  DragonwildsSettings,
} from "../../../../shared/types";
import {
  INI_KEYS,
  readDedicatedServerIni,
  writeDedicatedServerIni,
} from "../dedicatedServerIni";
import { appError } from "../../../utils/appError";

const validPort = (p: number) => Number.isInteger(p) && p >= 1 && p <= 65535;

export function registerDragonwildsHandlers(ctx: IpcContext): void {
  ipcMain.handle("dragonwilds:getConfig", () => ctx.getDragonwildsConfig());
  ipcMain.handle(
    "dragonwilds:setConfig",
    (_, patch: Partial<DragonwildsLaunchConfig>) =>
      ctx.updateDragonwildsConfig(undefined, patch),
  );

  // Vue fusionnée pour la page Config partagée (ConfigPage) : clés de
  // DedicatedServer.ini + ports / mot de passe admin / args de Nexum.
  ipcMain.handle("dragonwildsconfig:read", (): DragonwildsSettings => {
    const launch = ctx.getDragonwildsConfig();
    return {
      ...readDedicatedServerIni(ctx.getActiveServerPath()),
      Port: launch.port,
      BeaconPort: launch.beaconPort,
      AdminPassword: launch.adminPassword,
      customArgs: launch.customArgs,
    };
  });

  ipcMain.handle(
    "dragonwildsconfig:write",
    (_, settings: DragonwildsSettings) => {
      const serverPath = ctx.getActiveServerPath();
      if (!serverPath) {
        return { success: false, error: appError("NO_SERVER_PATH") };
      }
      // Le serveur réécrit DedicatedServer.ini pendant qu'il tourne : la
      // modification serait perdue (l'UI bloque aussi, voir lockWhileRunning).
      const status = ctx.serverManagers.getActive()?.getStatus() ?? "stopped";
      if (status !== "stopped" && status !== "crashed") {
        return { success: false, error: appError("CONFIG_LOCKED") };
      }
      const port = Number(settings.Port);
      const beaconPort = Number(settings.BeaconPort);
      if (!validPort(port) || !validPort(beaconPort)) {
        return { success: false, error: appError("PORT_INVALID") };
      }
      if (port === beaconPort) {
        return { success: false, error: appError("PORTS_SAME") };
      }
      const ownerId = String(settings.OwnerId ?? "").trim();
      if (!/^[A-Za-z0-9]*$/.test(ownerId)) {
        return { success: false, error: appError("DW_OWNER_ID_INVALID") };
      }
      try {
        writeDedicatedServerIni(
          serverPath,
          Object.fromEntries(
            INI_KEYS.map((k) => [k, String(settings[k] ?? "")]),
          ),
        );
        ctx.updateDragonwildsConfig(undefined, {
          port,
          beaconPort,
          adminPassword: String(settings.AdminPassword ?? ""),
          customArgs: String(settings.customArgs ?? ""),
        });
        return { success: true };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    },
  );
}
