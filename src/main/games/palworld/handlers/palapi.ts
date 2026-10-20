import { ipcMain } from "electron/main";
import { PalworldApiClient } from "../PalworldApiClient";
import type { IpcContext } from "../../../ipc/context";
import { AppError } from "../../../utils/appError";

export function registerPalapiHandlers(ctx: IpcContext): void {
  const getClient = (): PalworldApiClient => {
    const serverPath = ctx.getActiveServerPath();
    const cfg = ctx.configParser.read(serverPath);
    if (!cfg.RESTAPIEnabled) throw new AppError("PAL_API_DISABLED");
    return new PalworldApiClient(
      Number(cfg.RESTAPIPort ?? 8212),
      String(cfg.AdminPassword ?? ""),
    );
  };

  ipcMain.handle("palapi:getInfo", () => getClient().getInfo());
  ipcMain.handle("palapi:getPlayers", () => getClient().getPlayers());
  ipcMain.handle("palapi:getMetrics", () => getClient().getMetrics());
  ipcMain.handle("palapi:announce", (_, message: string) =>
    getClient().announce(message),
  );
  ipcMain.handle("palapi:kick", (_, userid: string, message?: string) =>
    getClient().kick(userid, message),
  );
  ipcMain.handle("palapi:ban", (_, userid: string, message?: string) =>
    getClient().ban(userid, message),
  );
  ipcMain.handle("palapi:unban", (_, userid: string) =>
    getClient().unban(userid),
  );
  ipcMain.handle("palapi:shutdown", (_, waittime: number, message?: string) =>
    getClient().shutdown(waittime, message),
  );
}
