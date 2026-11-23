import { ipcMain } from "electron/main";
import type { IpcContext } from "../../../ipc/context";
import type { ArkLaunchConfig, ArkSettings } from "../../../../shared/types";
import {
  GAME_USER_SETTINGS_KEYS,
  readGameUserSettings,
  writeGameUserSettings,
  type GameUserSettingsKey,
} from "../gameUserSettingsIni";
import { validateArkLaunch } from "../launchConfig";
import { appError } from "../../../utils/appError";

const BOOLEAN_KEYS: GameUserSettingsKey[] = ["ServerPVE", "RCONEnabled"];
const isTrue = (value: unknown) => String(value).toLowerCase() === "true";
const iniBool = (value: unknown) => (isTrue(value) ? "True" : "False");

type Result = { success: boolean; error?: string };

export function registerArkHandlers(ctx: IpcContext): void {
  // Vue fusionnée pour la page Config partagée (ConfigPage) : clés de
  // GameUserSettings.ini + ligne de commande de Nexum.
  ipcMain.handle("arkconfig:read", (): ArkSettings => {
    // Les mods ont leur page : hors de la vue de la page Config.
    const { map, port, queryPort, rconPort, maxPlayers, battlEye, customArgs } =
      ctx.getArkConfig();
    const launch = {
      map,
      port,
      queryPort,
      rconPort,
      maxPlayers,
      battlEye,
      customArgs,
    };
    const ini = readGameUserSettings(ctx.getActiveServerPath());
    return {
      ...launch,
      SessionName: ini.SessionName,
      ServerPassword: ini.ServerPassword,
      ServerAdminPassword: ini.ServerAdminPassword,
      ServerPVE: isTrue(ini.ServerPVE),
      // Clé absente = activé au prochain démarrage (prepareArkStart).
      RCONEnabled: ini.RCONEnabled === "" || isTrue(ini.RCONEnabled),
    };
  });

  ipcMain.handle("arkconfig:write", (_, settings: ArkSettings): Result => {
    const serverPath = ctx.getActiveServerPath();
    if (!serverPath) {
      return { success: false, error: appError("NO_SERVER_PATH") };
    }
    // Le serveur réécrit GameUserSettings.ini à l'arrêt avec les valeurs
    // lues au démarrage : la modification serait perdue (l'UI bloque aussi,
    // voir lockWhileRunning).
    const status = ctx.serverManagers.getActive()?.getStatus() ?? "stopped";
    if (status !== "stopped" && status !== "crashed") {
      return { success: false, error: appError("CONFIG_LOCKED") };
    }
    // Sans les mods (page Mods) : la mise à jour fusionne, la liste reste.
    const launch: Omit<ArkLaunchConfig, "mods"> = {
      map: String(settings.map ?? "").trim(),
      port: Number(settings.port),
      queryPort: Number(settings.queryPort),
      rconPort: Number(settings.rconPort),
      maxPlayers: Number(settings.maxPlayers),
      battlEye: settings.battlEye === true,
      customArgs: String(settings.customArgs ?? ""),
    };
    const invalid = validateArkLaunch(launch);
    if (invalid) return { success: false, error: invalid };
    try {
      const pairs = Object.fromEntries(
        GAME_USER_SETTINGS_KEYS.map((key) => {
          const value = settings[key];
          return [
            key,
            BOOLEAN_KEYS.includes(key) ? iniBool(value) : String(value ?? ""),
          ];
        }),
      );
      // Le port RCON se règle avec les autres ports (ligne de commande) : le
      // fichier reçoit la même valeur.
      pairs.RCONPort = String(launch.rconPort);
      writeGameUserSettings(serverPath, pairs);
      ctx.updateArkConfig(undefined, launch);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}
