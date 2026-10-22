import type { IpcContext } from "../ipc/context";
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
 * vérifications (ports, mot de passe Valheim, `prepare`). Les lignes écrites
 * avant la relance ne vont que dans la console (la session plantée est close),
 * le compte rendu est écrit dans la nouvelle session.
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
