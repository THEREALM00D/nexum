import type { IpcContext } from "../ipc/context";
import { notifyGaveUp, notifyStartFailed } from "./serverAlerts";
import { startServer } from "./startServer";
import { appErrorLogText } from "../utils/appError";
import { lt, managerLine } from "../i18n/logStrings";
import {
  MAX_RESTARTS,
  RESTART_WINDOW_MS,
  recordRestartAttempt,
} from "./restartAttempts";

// Délai avant la relance : laisse au jeu le temps de libérer ses fichiers et
// ses ports, et à l'utilisateur celui de voir ce qui s'est passé.
export const RESTART_DELAY_MS = 10_000;

/**
 * Relance automatique d'un serveur planté (`Server.autoRestart`, case de
 * `ServerDialog`). Passe par `startServer` comme un démarrage manuel : mêmes
 * vérifications (ports, mot de passe Valheim, `prepare`). Appelé avant la
 * fermeture de la session plantée : « relance dans 10 s » et l'abandon y sont
 * écrits ; le compte rendu de la relance va dans la nouvelle session.
 */
export function registerCrashRestart(ctx: IpcContext): void {
  ctx.serverManagers.onCrash((id) => {
    const server = ctx.servers.list().find((candidate) => candidate.id === id);
    if (!server?.autoRestart) return;
    const mgr = ctx.serverManagers.getOrCreate(id);

    // Compteur partagé avec la relance d'un démarrage bloqué.
    const { attempt, gaveUp } = recordRestartAttempt(id);
    if (gaveUp) {
      mgr.log(
        managerLine(
          lt().autoRestartGaveUp(MAX_RESTARTS, RESTART_WINDOW_MS / 60_000),
        ),
      );
      notifyGaveUp(server, MAX_RESTARTS, RESTART_WINDOW_MS / 60_000);
      return;
    }
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
