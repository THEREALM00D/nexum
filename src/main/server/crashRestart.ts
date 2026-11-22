import type { IpcContext } from "../ipc/context";
import { notifyGaveUp, notifyStartFailed } from "./serverAlerts";
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
      notifyGaveUp(server, MAX_RESTARTS, WINDOW_MS / 60_000);
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
      const sendLog = (line: string) => ctx.broadcastLog(id, line);
      const result = await startServer(ctx, id, sendLog).catch(
        (error: Error) => ({ success: false, error: error.message }),
      );
      if (result.success) {
        mgr.log(managerLine(lt().autoRestarted(attempt, MAX_RESTARTS)));
        return;
      }
      // La session plantée est close : compte rendu dans une session à lui.
      const error = result.error ?? "";
      mgr.logStartFailure(
        managerLine(lt().autoRestartFailed(appErrorLogText(error))),
        sendLog,
      );
      notifyStartFailed(current, "crashRestart", error);
    }, RESTART_DELAY_MS);
  });
}
