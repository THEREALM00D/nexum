import { ipcMain } from "electron/main";
import type { IpcContext } from "../context";
import type { BulkAction, OnlinePlayers } from "../../../shared/types";
import { startBulkRun } from "../../servers/bulk/bulkRunner";
import {
  dismissBulkRun,
  getBulkRun,
  requestStopAfterCurrent,
} from "../../servers/bulk/bulkState";

const BULK_ACTIONS: BulkAction[] = [
  "startAll",
  "restartRunning",
  "stopAll",
  "updateStopped",
  "stopUpdateRestartAll",
];

/** Actions groupées de la page Serveurs (voir `src/main/servers/bulk/CLAUDE.md`). */
export function registerBulkHandlers(ctx: IpcContext): void {
  ipcMain.handle("bulk:run", (_, action: BulkAction, warnPlayers: boolean) => {
    // Le renderer n'envoie que des actions typées : une autre ne lance rien.
    if (!BULK_ACTIONS.includes(action)) return getBulkRun();
    return startBulkRun(ctx, action, warnPlayers === true);
  });
  ipcMain.handle("bulk:get", () => getBulkRun());
  ipcMain.handle("bulk:stopAfterCurrent", () => requestStopAfterCurrent());
  ipcMain.handle("bulk:dismiss", () => dismissBulkRun());
  ipcMain.handle("bulk:onlinePlayers", (): OnlinePlayers[] => {
    const statuses = ctx.serverManagers.statuses();
    return Object.entries(statuses)
      .filter(([, status]) => status === "running")
      .map(([serverId]) => ({
        serverId,
        count: ctx.getOnlinePlayers(serverId),
      }));
  });
}
