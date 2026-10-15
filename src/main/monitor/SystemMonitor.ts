import os from "os";
import si from "systeminformation";
import type { GameType, SystemStats } from "../../shared/types";
import { PROCESS_NAME_PREFIXES } from "../servers/ServerManagerRegistry";

// Sous Windows, si.processes() lance un PowerShell (Get-CimInstance
// Win32_Process) qui coûte ~1,5 s de CPU : interrogé toutes les 2 s avec
// si.mem() (autre PowerShell), le monitoring saturait le CPU des petites
// machines (signalé sur Discord en 0.12.2). On ne relit donc la liste des
// processus que si un serveur tourne, et au plus toutes les 15 s.
const GAME_PROC_REFRESH_MS = 15_000;

interface GameProcInfo {
  prefix: string;
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

  async getStats(
    gameType: GameType = "palworld",
    serverRunning = true,
  ): Promise<SystemStats> {
    // currentLoad s'appuie sur os.cpus() (aucun processus lancé) ; mémoire
    // et uptime viennent directement de Node.
    const cpuLoad = await si.currentLoad();
    const total = os.totalmem();
    const used = total - os.freemem();

    // Serveur arrêté : on oublie le cache, sinon un redémarrage dans les 15 s
    // reprendrait l'heure de démarrage de l'ancien process.
    if (!serverRunning) this.gameProc = null;
    const proc = serverRunning ? await this.getGameProc(gameType) : null;
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
  private async getGameProc(gameType: GameType): Promise<GameProcInfo | null> {
    const prefix = PROCESS_NAME_PREFIXES[gameType] ?? "palserver";
    const cached = this.gameProc;
    if (
      cached &&
      cached.prefix === prefix &&
      Date.now() - cached.fetchedAt < GAME_PROC_REFRESH_MS
    ) {
      return cached.memRss > 0 ? cached : null;
    }
    // Un seul appel en vol : getStats peut aussi venir de l'IPC monitor:getStats.
    this.gameProcPending ??= this.fetchGameProc(prefix).finally(() => {
      this.gameProcPending = null;
    });
    const info = await this.gameProcPending;
    this.gameProc = info;
    return info.prefix === prefix && info.memRss > 0 ? info : null;
  }

  private async fetchGameProc(prefix: string): Promise<GameProcInfo> {
    const empty = { prefix, memRss: 0, started: null, fetchedAt: Date.now() };
    try {
      const procs = await si.processes();
      // Le lanceur peut consommer peu de RAM face au vrai process serveur
      // (ex. PalServer.exe vs PalServer-Win64-Shipping.exe) — on prend le plus
      // gourmand des process matchant le préfixe pour couvrir les deux cas.
      const gameProc = procs.list
        .filter((p) => p.name.toLowerCase().startsWith(prefix))
        .reduce<(typeof procs.list)[number] | undefined>(
          (best, p) => (!best || p.memRss > best.memRss ? p : best),
          undefined,
        );
      if (!gameProc) return empty;
      const started = gameProc.started
        ? new Date(gameProc.started).getTime()
        : NaN;
      return {
        ...empty,
        memRss: gameProc.memRss,
        started: Number.isNaN(started) ? null : started,
      };
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
    getGameType: () => GameType = () => "palworld",
    isServerRunning: () => boolean = () => true,
    shouldPoll: () => boolean = () => true,
  ): void {
    this.stopPolling();
    const gen = this.generation;
    const tick = async () => {
      if (shouldPoll()) {
        try {
          onStats(await this.getStats(getGameType(), isServerRunning()));
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
