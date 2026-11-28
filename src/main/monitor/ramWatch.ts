import si from "systeminformation";
import type { IpcContext } from "../ipc/context";
import { lt, managerLine } from "../i18n/logStrings";
import { processTreeStats } from "../servers/processMatch";
import { canAnnounce, isRestartPending } from "../scheduler/restartCountdown";
import { runScheduledRestart } from "../scheduler/scheduledRestart";
import { reportWatchdogEvent } from "../server/watchdogEvents";

const TICK_MS = 60 * 1000;
/** Lectures d'affilée au-dessus de la limite avant de redémarrer (5 min). */
const READINGS = 5;

/**
 * Limite de RAM par serveur (`Server.ramLimitGb`). ⚠️ `si.processes()` lance
 * un PowerShell (voir `CLAUDE.md`) : une seule lecture par minute pour tous
 * les serveurs, et aucune quand aucun serveur lancé n'a de limite.
 */
export function startRamWatch(ctx: IpcContext): void {
  const overCount = new Map<string, number>();
  let busy = false;

  setInterval(async () => {
    if (busy) return;
    const targets = ctx.servers.list().flatMap((server) => {
      const limitGb = server.ramLimitGb ?? 0;
      const manager = ctx.serverManagers.getOrCreate(server.id);
      const pid = manager.getPid();
      if (limitGb <= 0 || !pid || manager.getStatus() !== "running") return [];
      return [{ server, manager, pid, limitGb }];
    });
    const targetIds = new Set(targets.map((target) => target.server.id));
    for (const serverId of [...overCount.keys()])
      if (!targetIds.has(serverId)) overCount.delete(serverId);
    if (targets.length === 0) return;

    busy = true;
    try {
      const { list } = await si.processes();
      for (const { server, manager, pid, limitGb } of targets) {
        // Déjà en cours de redémarrage (planifié, action groupée…).
        if (isRestartPending(server.id)) {
          overCount.delete(server.id);
          continue;
        }
        const stats = processTreeStats(list, pid);
        if (!stats) continue;
        const ramGb = stats.memRss / 1024 ** 2;
        if (ramGb <= limitGb) {
          overCount.delete(server.id);
          continue;
        }
        const count = (overCount.get(server.id) ?? 0) + 1;
        overCount.set(server.id, count);
        if (count < READINGS) continue;
        overCount.delete(server.id);
        // Sans API REST ni RCON, personne à prévenir : arrêt tout de suite
        // (sinon le compte à rebours attendait 30 min pour rien).
        const warnings = canAnnounce(ctx, server.id)
          ? ctx.getServerConfig(server.id).restart.warnings
          : [];
        const playersWarned = warnings.length > 0;
        manager.log(
          managerLine(lt().ramLimitExceeded(ramGb, limitGb, playersWarned)),
        );
        reportWatchdogEvent(server, {
          kind: "ramLimit",
          ramGb,
          limitGb,
          playersWarned,
        });
        void runScheduledRestart(ctx, server.id, {
          stopAt: Date.now() + (warnings[0] ?? 0) * 60_000,
          warnings,
          kind: "restart",
          // Annulé si la limite est retirée pendant les annonces.
          stillWanted: () =>
            (ctx.servers.list().find((candidate) => candidate.id === server.id)
              ?.ramLimitGb ?? 0) > 0,
        }).catch(() => {});
      }
    } catch {
      // Liste des processus illisible : nouvel essai à la minute suivante.
    } finally {
      busy = false;
    }
  }, TICK_MS);
}
