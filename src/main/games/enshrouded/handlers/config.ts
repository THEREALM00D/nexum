import { ipcMain } from "electron/main";
import type { IpcContext } from "../../../ipc/context";
import type {
  EnshroudedLaunchConfig,
  EnshroudedSettings,
  EnshroudedUserGroup,
} from "../../../../shared/types";
import {
  readSettings,
  readUserGroups,
  writeSettings,
  writeUserGroups,
} from "../serverJson";
import { appError } from "../../../utils/appError";

const MAX_SLOTS = 16;

const validPort = (p: number) => Number.isInteger(p) && p >= 1 && p <= 65535;
const validSlots = (n: number) =>
  Number.isInteger(n) && n >= 1 && n <= MAX_SLOTS;

type Result = { success: boolean; error?: string };

/**
 * Le serveur réécrit enshrouded_server.json à chaque démarrage (vérifié) :
 * une modification faite serveur lancé serait perdue au redémarrage suivant
 * ou écrasée. Même règle que Dragonwilds (l'UI bloque aussi).
 */
function lockedOrNoPath(ctx: IpcContext): Result | null {
  if (!ctx.getActiveServerPath()) {
    return { success: false, error: appError("NO_SERVER_PATH") };
  }
  const status = ctx.serverManagers.getActive()?.getStatus() ?? "stopped";
  if (status !== "stopped" && status !== "crashed") {
    return { success: false, error: appError("CONFIG_LOCKED") };
  }
  return null;
}

function validateGroups(
  groups: EnshroudedUserGroup[],
  slotCount: number,
): string | null {
  const names = groups.map((g) => g.name.trim());
  if (names.some((n) => !n) || new Set(names).size !== names.length) {
    return appError("ENSHROUDED_GROUP_INVALID");
  }
  const reserved = groups.reduce((sum, g) => sum + g.reservedSlots, 0);
  const slotsOk = groups.every(
    (g) => Number.isInteger(g.reservedSlots) && g.reservedSlots >= 0,
  );
  if (!slotsOk || reserved > slotCount) {
    return appError("ENSHROUDED_SLOTS_INVALID", { max: slotCount });
  }
  return null;
}

export function registerEnshroudedHandlers(ctx: IpcContext): void {
  ipcMain.handle("enshrouded:getConfig", () => ctx.getEnshroudedConfig());
  ipcMain.handle(
    "enshrouded:setConfig",
    (_, patch: Partial<EnshroudedLaunchConfig>) =>
      ctx.updateEnshroudedConfig(undefined, patch),
  );

  // Vue de la page Config : clés gérées du JSON + arguments de Nexum.
  ipcMain.handle("enshroudedconfig:read", (): EnshroudedSettings => ({
    ...readSettings(ctx.getActiveServerPath()),
    customArgs: ctx.getEnshroudedConfig().customArgs,
  }));

  ipcMain.handle(
    "enshroudedconfig:write",
    (_, settings: EnshroudedSettings): Result => {
      const blocked = lockedOrNoPath(ctx);
      if (blocked) return blocked;
      if (!validPort(Number(settings.queryPort))) {
        return { success: false, error: appError("PORT_INVALID") };
      }
      if (!validSlots(Number(settings.slotCount))) {
        return {
          success: false,
          error: appError("ENSHROUDED_SLOTS_INVALID", { max: MAX_SLOTS }),
        };
      }
      const { customArgs, ...json } = settings;
      writeSettings(ctx.getActiveServerPath(), {
        ...json,
        queryPort: Number(json.queryPort),
        slotCount: Number(json.slotCount),
      });
      ctx.updateEnshroudedConfig(undefined, { customArgs });
      return { success: true };
    },
  );

  ipcMain.handle("enshrouded:getGroups", () =>
    readUserGroups(ctx.getActiveServerPath()),
  );

  ipcMain.handle(
    "enshrouded:setGroups",
    (_, groups: EnshroudedUserGroup[]): Result => {
      const blocked = lockedOrNoPath(ctx);
      if (blocked) return blocked;
      const serverPath = ctx.getActiveServerPath();
      const cleaned = groups.map((g) => ({
        ...g,
        name: g.name.trim(),
        reservedSlots: Number(g.reservedSlots),
      }));
      const error = validateGroups(
        cleaned,
        Number(readSettings(serverPath).slotCount),
      );
      if (error) return { success: false, error };
      writeUserGroups(serverPath, cleaned);
      return { success: true };
    },
  );
}
