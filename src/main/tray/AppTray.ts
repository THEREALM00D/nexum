import { app, Menu, Tray } from "electron/main";
import { join } from "path";
import { nativeImage } from "electron";
import type { MenuItemConstructorOptions } from "electron/main";
import devIconPath from "../../../resources/icon.ico?asset";
import type { IpcContext } from "../ipc/context";
import { restartServer, startServer } from "../server/startServer";
import { trayStrings, type TrayLanguage } from "./trayStrings";

interface TrayOptions {
  showWindow: () => void;
  quit: () => void;
  getLanguage: () => TrayLanguage;
}

// App installée : `resources/` (dossier buildResources) n'est pas embarqué,
// l'icône est copiée via `extraResources` (electron-builder.yml).
const iconPath = (): string =>
  app.isPackaged ? join(process.resourcesPath, "icon.ico") : devIconPath;

/**
 * Icône de Nexum dans la zone de notification (près de l'horloge). Clic :
 * rouvre la fenêtre. Clic droit : état de chaque serveur avec Démarrer /
 * Arrêter / Redémarrer, et Quitter. Le menu est reconstruit à chaque
 * ouverture pour toujours montrer les statuts à jour.
 */
export function createAppTray(ctx: IpcContext, opts: TrayOptions): Tray {
  const tray = new Tray(nativeImage.createFromPath(iconPath()));
  const log = (id: string) => (line: string) => ctx.broadcastLog(id, line);

  const buildMenu = (): Menu => {
    const s = trayStrings(opts.getLanguage());
    const statuses = ctx.serverManagers.statuses();
    const servers: MenuItemConstructorOptions[] = ctx.servers
      .list()
      .map((server) => {
        const status = statuses[server.id] ?? "stopped";
        const busy = status === "starting" || status === "stopping";
        const up = status === "running";
        return {
          label: `${server.name} — ${s.status[status]}`,
          submenu: [
            {
              label: s.start,
              enabled: !up && !busy,
              click: () => void startServer(ctx, server.id, log(server.id)),
            },
            {
              label: s.stop,
              enabled: up,
              click: () =>
                void ctx.serverManagers
                  .getOrCreate(server.id)
                  .stop(ctx.getStopConfig(server.id)),
            },
            {
              label: s.restart,
              enabled: up,
              click: () => void restartServer(ctx, server.id, log(server.id)),
            },
          ],
        };
      });

    return Menu.buildFromTemplate([
      { label: s.open, click: opts.showWindow },
      { type: "separator" },
      ...(servers.length > 0
        ? servers
        : [{ label: s.noServers, enabled: false }]),
      { type: "separator" },
      { label: s.quit, click: opts.quit },
    ]);
  };

  const refreshTooltip = () => {
    const running = Object.values(ctx.serverManagers.statuses()).filter(
      (st) => st === "running",
    ).length;
    tray.setToolTip(trayStrings(opts.getLanguage()).tooltip(running));
  };

  tray.on("click", opts.showWindow);
  tray.on("right-click", () => tray.popUpContextMenu(buildMenu()));
  refreshTooltip();
  // Vit aussi longtemps que l'app : unref pour ne jamais retenir sa fermeture.
  setInterval(refreshTooltip, 5000).unref();
  return tray;
}
