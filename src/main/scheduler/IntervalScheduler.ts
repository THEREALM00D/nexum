export interface IntervalSchedule {
  serverId: string;
  /** 0 = tâche désactivée pour ce serveur. */
  intervalMinutes: number;
  running: boolean;
}

const TICK_MS = 30 * 1000;

/**
 * Tâche répétée pour chaque serveur lancé, à son propre intervalle
 * (sauvegarde auto, vérification des mises à jour, créatures sauvages d'ARK).
 *
 * L'intervalle compte depuis le démarrage du serveur (1er tick où il est vu
 * lancé, adoption comprise) et repart de zéro à l'arrêt. La config est relue
 * à chaque tick : un changement d'intervalle s'applique sans rien réarmer.
 * Les tâches dues passent l'une après l'autre (ZIP en compression maximale,
 * SteamCMD : plusieurs en parallèle feraient ramer les serveurs).
 */
export class IntervalScheduler {
  private timer: NodeJS.Timeout | null = null;
  /** Début du décompte (démarrage ou dernière exécution) par serveur. */
  private lastRun = new Map<string, number>();
  private queue: string[] = [];
  private busy = false;

  start(
    getSchedules: () => IntervalSchedule[],
    onRun: (serverId: string) => Promise<void>,
  ): void {
    this.stop();
    this.timer = setInterval(() => {
      const now = Date.now();
      const active = new Set<string>();
      for (const { serverId, intervalMinutes, running } of getSchedules()) {
        if (!running || intervalMinutes <= 0) continue;
        active.add(serverId);
        const last = this.lastRun.get(serverId);
        if (last === undefined) {
          this.lastRun.set(serverId, now);
        } else if (
          now - last >= intervalMinutes * 60 * 1000 &&
          !this.queue.includes(serverId)
        ) {
          this.queue.push(serverId);
        }
      }
      // Arrêté, supprimé ou désactivé : le décompte repartira de zéro.
      for (const serverId of [...this.lastRun.keys()]) {
        if (!active.has(serverId)) this.lastRun.delete(serverId);
      }
      this.queue = this.queue.filter((serverId) => active.has(serverId));
      void this.drain(onRun);
    }, TICK_MS);
  }

  /** Lance les tâches en attente, une seule à la fois. */
  private async drain(
    onRun: (serverId: string) => Promise<void>,
  ): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    try {
      for (
        let serverId = this.queue.shift();
        serverId;
        serverId = this.queue.shift()
      ) {
        // Décompte relancé au départ de la tâche, pas à sa fin.
        if (this.lastRun.has(serverId)) this.lastRun.set(serverId, Date.now());
        await onRun(serverId).catch(() => {});
      }
    } finally {
      this.busy = false;
    }
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.queue = [];
  }
}
