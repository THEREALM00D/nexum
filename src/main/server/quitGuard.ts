import { dialog, Notification } from "electron/main";
import type { BrowserWindow } from "electron/main";
import type { IpcContext } from "../ipc/context";
import type { ServerManager } from "./ServerManager";
import { getLanguage } from "../i18n/language";
import { lt, managerLine } from "../i18n/logStrings";
import { trayStrings } from "../tray/trayStrings";

// Au-delà, on quitte quand même : `stop()` a déjà ses propres délais (30 s
// pour un signal de console, puis taskkill), ceci ne couvre que le cas d'un
// serveur déjà en cours d'arrêt dont on attend seulement la fin.
const STOPPING_WAIT_MS = 45_000;

interface OwnedServer {
  id: string;
  name: string;
  manager: ServerManager;
}

/**
 * Serveurs lancés par Nexum et encore en marche. Ils sont dans le job Windows
 * de Nexum (libuv) : ils meurent avec lui, sans sauvegarde (vérifié avec
 * Enshrouded et Valheim). Les serveurs adoptés survivent, on n'y touche pas.
 */
function ownedRunningServers(ctx: IpcContext): OwnedServer[] {
  return ctx.servers.list().flatMap((server) => {
    const manager = ctx.serverManagers
      .entries()
      .find((e) => e.serverId === server.id)?.manager;
    if (!manager?.ownsProcess()) return [];
    const status = manager.getStatus();
    if (status === "stopped" || status === "crashed") return [];
    return [{ id: server.id, name: server.name, manager }];
  });
}

async function waitWhileStopping(manager: ServerManager): Promise<void> {
  const start = Date.now();
  while (
    manager.getStatus() === "stopping" &&
    Date.now() - start < STOPPING_WAIT_MS
  ) {
    await new Promise((r) => setTimeout(r, 500));
  }
}

/** Arrête un serveur avec SA config d'arrêt (CTRL+C, CTRL+Pause, API REST…). */
async function stopForQuit(ctx: IpcContext, s: OwnedServer): Promise<void> {
  if (s.manager.getStatus() === "stopping") return waitWhileStopping(s.manager);
  s.manager.log(managerLine(lt().stoppingBeforeQuit));
  await s.manager.stop(ctx.getStopConfig(s.id)).catch(() => undefined);
}

/**
 * Avant de quitter Nexum (menu Quitter, fermeture de la fenêtre sans zone de
 * notification, installation d'une mise à jour) : si des serveurs lancés par
 * Nexum tournent, demande confirmation puis les arrête proprement, tous en
 * même temps. Renvoie false si l'utilisateur annule (ne pas quitter).
 */
export async function confirmAndStopServers(
  ctx: IpcContext,
  win: BrowserWindow | null,
): Promise<boolean> {
  const owned = ownedRunningServers(ctx);
  if (owned.length === 0) return true;

  const s = trayStrings(getLanguage());
  const options = {
    type: "warning" as const,
    title: s.quitTitle,
    message: s.quitMessage(owned.length),
    detail: s.quitDetail(owned.map((o) => `• ${o.name}`).join("\n")),
    buttons: [s.quitStop, s.quitCancel],
    defaultId: 0,
    cancelId: 1,
    noLink: true,
  };
  // Fenêtre cachée (Quitter depuis l'icône) : boîte indépendante, sinon elle
  // serait rattachée à une fenêtre invisible.
  const parent = win && !win.isDestroyed() && win.isVisible() ? win : null;
  const { response } = parent
    ? await dialog.showMessageBox(parent, options)
    : await dialog.showMessageBox(options);
  if (response !== 0) return false;

  if (Notification.isSupported()) {
    new Notification({ title: s.stoppingTitle, body: s.stoppingBody }).show();
  }
  await Promise.all(owned.map((o) => stopForQuit(ctx, o)));
  return true;
}
