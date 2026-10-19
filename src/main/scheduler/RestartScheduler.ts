import type { RestartConfig } from "../../shared/types";

export interface ScheduledRestart {
  serverId: string;
  config: RestartConfig;
}

/**
 * Redémarrage quotidien : chaque serveur a sa propre heure (config par
 * serveur). Avant, seul le serveur actif (sélectionné dans l'interface) était
 * redémarré.
 */
export class RestartScheduler {
  private timer: NodeJS.Timeout | null = null;
  /** Dernier déclenchement par serveur, pour ne pas relancer dans la même minute. */
  private lastRunKeys = new Map<string, string>();

  start(
    getSchedules: () => ScheduledRestart[],
    onRestart: (serverId: string) => Promise<void>,
  ): void {
    this.stop();
    this.timer = setInterval(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const current = `${hh}:${mm}`;
      const key = `${now.toDateString()}-${current}`;
      for (const { serverId, config } of getSchedules()) {
        if (!config.enabled || config.time !== current) continue;
        if (this.lastRunKeys.get(serverId) === key) continue;
        this.lastRunKeys.set(serverId, key);
        onRestart(serverId).catch(() => {});
      }
    }, 30 * 1000);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
