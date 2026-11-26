import type { RestartConfig } from "../../shared/types";
import { nextRestartAt } from "../../shared/restartSchedule";

export interface ScheduledRestart {
  serverId: string;
  config: RestartConfig;
  running: boolean;
}

const TICK_MS = 30 * 1000;

/**
 * Redémarrage planifié de chaque serveur (config par serveur). L'heure
 * planifiée est celle de l'**arrêt** : le compte à rebours
 * (`runScheduledRestart`) est lancé assez tôt pour la première annonce
 * (30 min avant avec 30, 15… 1). Une heure juste après minuit fait donc
 * commencer les annonces la veille.
 */
export class RestartScheduler {
  private timer: NodeJS.Timeout | null = null;
  /** Dernier arrêt déclenché par serveur (horodatage), pour ne pas le relancer. */
  private lastStopAt = new Map<string, number>();

  start(
    getSchedules: () => ScheduledRestart[],
    onRestart: (serverId: string, stopAt: number) => Promise<void>,
  ): void {
    this.stop();
    this.timer = setInterval(() => {
      const now = Date.now();
      for (const { serverId, config, running } of getSchedules()) {
        if (!config.enabled || !running) continue;
        const next = nextRestartAt(config, new Date(now))?.getTime();
        if (next === undefined) continue;
        // `warnings` est trié du plus long au plus court.
        const lead = (config.warnings[0] ?? 0) * 60 * 1000;
        if (next - now > lead + TICK_MS) continue;
        if (this.lastStopAt.get(serverId) === next) continue;
        this.lastStopAt.set(serverId, next);
        onRestart(serverId, next).catch(() => {});
      }
    }, TICK_MS);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
