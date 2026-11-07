export interface BackupSchedule {
  serverId: string;
  /** 0 = sauvegarde automatique désactivée pour ce serveur. */
  intervalMinutes: number;
  running: boolean;
}

const TICK_MS = 30 * 1000;

/**
 * Sauvegarde automatique de chaque serveur lancé, à son propre intervalle.
 * Avant, un seul minuteur (intervalle du serveur actif) sauvegardait le
 * serveur sélectionné dans l'interface au moment du déclenchement : les
 * autres serveurs lancés n'avaient jamais de sauvegarde automatique.
 *
 * L'intervalle compte depuis le démarrage du serveur (1er tick où il est vu
 * lancé, adoption comprise) et repart de zéro à l'arrêt. La config est relue
 * à chaque tick : un changement d'intervalle s'applique sans rien réarmer.
 * Les sauvegardes dues passent l'une après l'autre (ZIP en compression
 * maximale : plusieurs en parallèle feraient ramer les serveurs).
 */
export class BackupScheduler {
  private timer: NodeJS.Timeout | null = null;
  /** Début du décompte (démarrage ou dernière sauvegarde auto) par serveur. */
  private lastRun = new Map<string, number>();
  private queue: string[] = [];
  private busy = false;

  start(
    getSchedules: () => BackupSchedule[],
    onBackup: (serverId: string) => Promise<void>,
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
      for (const id of [...this.lastRun.keys()]) {
        if (!active.has(id)) this.lastRun.delete(id);
      }
      this.queue = this.queue.filter((id) => active.has(id));
      void this.drain(onBackup);
    }, TICK_MS);
  }

  /** Lance les sauvegardes en attente, une seule à la fois. */
  private async drain(
    onBackup: (serverId: string) => Promise<void>,
  ): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    try {
      for (let id = this.queue.shift(); id; id = this.queue.shift()) {
        // Décompte relancé au départ de la sauvegarde, pas à sa fin.
        if (this.lastRun.has(id)) this.lastRun.set(id, Date.now());
        await onBackup(id).catch(() => {});
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
