import os from "os";
import si from "systeminformation";
import type { SystemStats } from "../../shared/types";
import { processTreeStats } from "../servers/processMatch";

// Sous Windows, si.processes() lance un PowerShell (Get-CimInstance
// Win32_Process) qui coûte ~1,5 s de CPU : interrogé toutes les 2 s avec
// si.mem() (autre PowerShell), le monitoring saturait le CPU des petites
// machines (signalé sur Discord en 0.12.2). On ne relit donc la liste des
// processus que si un serveur tourne, et au plus toutes les 15 s.
const GAME_PROC_REFRESH_MS = 15_000;

interface GameProcInfo {
  pid: number;
  memRss: number;
  started: number | null;
  fetchedAt: number;
}

export class SystemMonitor {
  private timer: ReturnType<typeof setTimeout> | null = null;
  // Incrémenté à chaque start/stop : un tick encore en vol d'une boucle
  // précédente ne reprogramme rien (sinon deux boucles tourneraient).
  private generation = 0;
  private gameProc: GameProcInfo | null = null;
  private gameProcPending: Promise<GameProcInfo> | null = null;

  /**
   * `serverPid` : PID racine du serveur actif (lancé ou adopté), null s'il
   * ne tourne pas. On part du PID connu du ServerManager plutôt que du nom de
   * l'exécutable : avec le client du jeu ou un 2e serveur du même jeu lancé,
   * le nom seul affichait la RAM d'un autre programme.
   */
  async getStats(serverPid: number | null = null): Promise<SystemStats> {
    // currentLoad s'appuie sur os.cpus() (aucun processus lancé) ; mémoire
    // et uptime viennent directement de Node.
    const cpuLoad = await si.currentLoad();
    const total = os.totalmem();
    const used = total - os.freemem();

    // Serveur arrêté : on oublie le cache, sinon un redémarrage dans les 15 s
    // reprendrait l'heure de démarrage de l'ancien process.
    if (serverPid === null) this.gameProc = null;
    const proc = serverPid !== null ? await this.getGameProc(serverPid) : null;
    const serverUptime = proc?.started
      ? Math.max(0, Math.floor((Date.now() - proc.started) / 1000))
      : 0;

    return {
      cpu: Math.round(cpuLoad.currentLoad),
      ram: Math.round((used / total) * 100),
      ramUsed: parseFloat((used / 1024 ** 3).toFixed(2)),
      ramTotal: parseFloat((total / 1024 ** 3).toFixed(2)),
      ramUsedByGame: proc
        ? parseFloat((proc.memRss / 1024 ** 2).toFixed(2))
        : 0,
      serverUptime,
      uptime: os.uptime(),
    };
  }

  /** Infos du process du jeu, en cache GAME_PROC_REFRESH_MS. */
  private async getGameProc(pid: number): Promise<GameProcInfo | null> {
    const cached = this.gameProc;
    if (
      cached &&
      cached.pid === pid &&
      Date.now() - cached.fetchedAt < GAME_PROC_REFRESH_MS
    ) {
      return cached.memRss > 0 ? cached : null;
    }
    // Un seul appel en vol : getStats peut aussi venir de l'IPC monitor:getStats.
    this.gameProcPending ??= this.fetchGameProc(pid).finally(() => {
      this.gameProcPending = null;
    });
    const info = await this.gameProcPending;
    this.gameProc = info;
    return info.pid === pid && info.memRss > 0 ? info : null;
  }

  private async fetchGameProc(pid: number): Promise<GameProcInfo> {
    const empty = { pid, memRss: 0, started: null, fetchedAt: Date.now() };
    try {
      const stats = processTreeStats((await si.processes()).list, pid);
      return stats ? { ...empty, ...stats } : empty;
    } catch {
      return empty;
    }
  }

  /**
   * Boucle à base de setTimeout : le tick suivant n'est programmé qu'une fois
   * le précédent terminé (un setInterval empilait les appels quand un cycle
   * durait plus que l'intervalle). `shouldPoll` permet de sauter les ticks
   * quand la fenêtre est cachée (zone de notification) ou réduite.
   */
  startPolling(
    intervalMs: number,
    onStats: (stats: SystemStats) => void,
    getServerPid: () => number | null = () => null,
    shouldPoll: () => boolean = () => true,
  ): void {
    this.stopPolling();
    const gen = this.generation;
    const tick = async () => {
      if (shouldPoll()) {
        try {
          onStats(await this.getStats(getServerPid()));
        } catch {
          // ignore : on réessaie au tick suivant
        }
      }
      if (gen === this.generation) this.timer = setTimeout(tick, intervalMs);
    };
    this.timer = setTimeout(tick, intervalMs);
  }

  stopPolling(): void {
    this.generation++;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
