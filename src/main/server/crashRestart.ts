import { BrowserWindow, Notification } from "electron/main";
import type { AutoRestartGaveUpNotice, Server } from "../../shared/types";
import type { IpcContext } from "../ipc/context";
import { getLanguage } from "../i18n/language";
import { showWindow } from "../tray/windowLifecycle";
import { trayStrings } from "../tray/trayStrings";
import { startServer } from "./startServer";
import { appErrorLogText } from "../utils/appError";
import { lt, managerLine } from "../i18n/logStrings";

// Délai avant la relance : laisse au jeu le temps de libérer ses fichiers et
// ses ports, et à l'utilisateur celui de voir ce qui s'est passé.
const RESTART_DELAY_MS = 10_000;
// Au-delà de MAX_RESTARTS plantages dans la fenêtre, on arrête de relancer :
// un serveur qui plante au démarrage (monde corrompu, mod cassé) bouclerait.
const MAX_RESTARTS = 3;
const WINDOW_MS = 30 * 60_000;
// Référence gardée : une Notification libérée par le ramasse-miettes ne
// reçoit plus son `click`.
let gaveUpNotification: Notification | null = null;

/**
 * Relance automatique d'un serveur planté (`Server.autoRestart`, case de
 * `ServerDialog`). Passe par `startServer` comme un démarrage manuel : mêmes
 * vérifications (ports, mot de passe Valheim, `prepare`). Appelé avant la
 * fermeture de la session plantée : « relance dans 10 s » et l'abandon y sont
 * écrits ; le compte rendu de la relance va dans la nouvelle session.
 */
export function registerCrashRestart(ctx: IpcContext): void {
  const crashes = new Map<string, number[]>();

  ctx.serverManagers.onCrash((id) => {
    const server = ctx.servers.list().find((s) => s.id === id);
    if (!server?.autoRestart) return;
    const mgr = ctx.serverManagers.getOrCreate(id);

    const now = Date.now();
    const recent = (crashes.get(id) ?? []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= MAX_RESTARTS) {
      crashes.set(id, recent);
      mgr.log(
        managerLine(lt().autoRestartGaveUp(MAX_RESTARTS, WINDOW_MS / 60_000)),
      );
      notifyGaveUp(server);
      return;
    }
    recent.push(now);
    crashes.set(id, recent);
    const attempt = recent.length;
    mgr.log(
      managerLine(
        lt().autoRestarting(RESTART_DELAY_MS / 1000, attempt, MAX_RESTARTS),
      ),
    );

    setTimeout(async () => {
      // Entre-temps : serveur supprimé, option décochée ou relancé à la main.
      const current = ctx.servers.list().find((s) => s.id === id);
      if (!current?.autoRestart || mgr.getStatus() !== "crashed") return;
      const res = await startServer(ctx, id, (line) =>
        ctx.broadcastLog(id, line),
      ).catch((e: Error) => ({ success: false, error: e.message }));
      mgr.log(
        managerLine(
          res.success
            ? lt().autoRestarted(attempt, MAX_RESTARTS)
            : lt().autoRestartFailed(appErrorLogText(res.error ?? "")),
        ),
      );
    }, RESTART_DELAY_MS);
  });
}

/**
 * Abandon de la relance : toast dans l'app (bouton vers les logs) et, si
 * personne ne regarde la fenêtre (cachée dans la zone de notification ou en
 * arrière-plan), notification Windows qui la rouvre au clic.
 */
function notifyGaveUp(server: Server): void {
  const notice: AutoRestartGaveUpNotice = {
    serverId: server.id,
    crashes: MAX_RESTARTS,
    minutes: WINDOW_MS / 60_000,
  };
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((w) =>
    w.webContents.send("server:autoRestartGaveUp", notice),
  );

  const watched = windows.some((w) => w.isVisible() && w.isFocused());
  if (watched || !Notification.isSupported()) return;
  const s = trayStrings(getLanguage());
  gaveUpNotification = new Notification({
    title: s.crashGaveUpTitle,
    body: s.crashGaveUpBody(server.name, notice.crashes, notice.minutes),
  });
  gaveUpNotification.on("click", () => showWindow(windows[0] ?? null));
  gaveUpNotification.show();
}
