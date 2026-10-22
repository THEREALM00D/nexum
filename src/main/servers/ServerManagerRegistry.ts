import si from "systeminformation";
import { ServerManager } from "../server/ServerManager";
import type { GameType, ServerStatus } from "../../shared/types";
import type { ServerRegistry } from "./ServerRegistry";
import type { SessionLogStore } from "../logs/SessionLogStore";
import { findServerProcess, type ProcInfo } from "./processMatch";
import { getGameLogFile } from "../games/registry";
import { AppError } from "../utils/appError";

// Préfixe du nom de processus du serveur de chaque jeu (lanceur et
// `…-Shipping.exe`). Doit être propre au SERVEUR : Dragonwilds →
// RSDragonwildsServer*, le client s'appelle RSDragonwilds*.
export const PROCESS_NAME_PREFIXES: Record<GameType, string> = {
  palworld: "palserver",
  valheim: "valheim_server",
  astroneer: "astroserver",
  dragonwilds: "rsdragonwildsserver",
};

/**
 * Garde une instance `ServerManager` par serveur, indexée par `serverId`.
 * Permet à terme de faire tourner plusieurs serveurs en parallèle (Phase 5).
 * Pour l'instant l'UI ne pilote qu'un seul serveur à la fois, mais le backend
 * est déjà capable d'en gérer N.
 */
export class ServerManagerRegistry {
  private managers = new Map<string, ServerManager>();
  private crashHandler: ((serverId: string) => void) | null = null;

  constructor(
    private servers: ServerRegistry,
    private sessionLogs?: SessionLogStore,
  ) {}

  /**
   * Récupère le manager pour ce serveur, en le créant si nécessaire.
   * Lance si le serverId n'existe pas dans le registre des serveurs.
   */
  getOrCreate(serverId: string): ServerManager {
    if (!this.servers.list().some((s) => s.id === serverId)) {
      throw new AppError("SERVER_NOT_FOUND", { id: serverId });
    }
    let mgr = this.managers.get(serverId);
    if (!mgr) {
      mgr = new ServerManager(this.sessionLogs?.sink(serverId), () =>
        this.crashHandler?.(serverId),
      );
      this.managers.set(serverId, mgr);
    }
    return mgr;
  }

  /** Appelé quand un serveur plante (voir `server/crashRestart.ts`). */
  onCrash(handler: (serverId: string) => void): void {
    this.crashHandler = handler;
  }

  /** Retourne le manager du serveur actif, ou null si aucun n'est sélectionné. */
  getActive(): ServerManager | null {
    const active = this.servers.getActive();
    if (!active) return null;
    return this.getOrCreate(active.id);
  }

  /** Itère sur tous les managers existants (instanciés au moins une fois). */
  entries(): Array<{ serverId: string; manager: ServerManager }> {
    return Array.from(this.managers.entries()).map(([serverId, manager]) => ({
      serverId,
      manager,
    }));
  }

  /**
   * Arrête le serveur s'il tourne encore puis retire son manager du registre.
   * À appeler avant de supprimer un serveur pour ne pas orpheliner son process.
   */
  async remove(serverId: string): Promise<void> {
    const mgr = this.managers.get(serverId);
    if (!mgr) return;
    if (mgr.getStatus() !== "stopped") {
      await mgr.stop().catch(() => {});
    }
    this.managers.delete(serverId);
  }

  /**
   * Status agrégé : pour chaque serveur du registre, retourne son statut.
   * Si aucun manager n'a été instancié pour ce serveur, retourne "stopped".
   */
  statuses(): Record<string, ServerStatus> {
    const result: Record<string, ServerStatus> = {};
    for (const s of this.servers.list()) {
      result[s.id] = this.managers.get(s.id)?.getStatus() ?? "stopped";
    }
    return result;
  }

  /**
   * Au démarrage de Nexum : reprend les serveurs restés lancés d'une session
   * précédente. Une seule lecture de la liste des processus (un PowerShell
   * sous Windows), puis chaque serveur est associé à SON processus — nom de
   * l'exécutable ET dossier du serveur (`findServerProcess`).
   */
  async tryAdoptAll(
    onLog: (serverId: string, line: string) => void,
  ): Promise<void> {
    let procs: ProcInfo[];
    try {
      procs = (await si.processes()).list;
    } catch {
      return;
    }

    const servers = this.servers.list();
    const adopted = new Set<number>();
    for (const server of servers) {
      const prefix = PROCESS_NAME_PREFIXES[server.gameType];
      // Chemin illisible (processus lancé en admin par une ancienne version) :
      // accepté seulement s'il n'y a aucun doute sur le serveur concerné.
      const onlyOfItsGame =
        servers.filter((s) => s.gameType === server.gameType).length === 1;
      const proc = findServerProcess(
        procs.filter((p) => !adopted.has(p.pid)),
        prefix,
        server.path,
        onlyOfItsGame,
      );
      if (!proc) continue;
      const adoptedNow = this.getOrCreate(server.id).adopt(
        proc.pid,
        (line) => onLog(server.id, line),
        getGameLogFile(server.gameType, server.path),
      );
      if (adoptedNow) adopted.add(proc.pid);
    }
  }
}
