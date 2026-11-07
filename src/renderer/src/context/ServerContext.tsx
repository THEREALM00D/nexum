import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import type { Server, ServerStatus, SystemStats } from "../types";
import { monitorService } from "../services/monitorService";
import { serverService } from "../services/serverService";

interface ServerState {
  servers: Server[];
  activeServerId: string | null;
  activeServer: Server | null;
  /** Legacy compat : path du serveur actif (= activeServer?.path) */
  serverPath: string;

  /** Statuses agrégés : un par serveur configuré. */
  statuses: Record<string, ServerStatus>;
  /** Compat : status du serveur actif (= statuses[activeServerId]). */
  status: ServerStatus;

  /**
   * Logs séparés par serveur, toute la session (liste virtualisée à
   * l'affichage). Seul garde-fou mémoire : MAX_LIVE_LINES.
   */
  logsByServer: Record<string, string[]>;
  /** Compat : logs du serveur actif (= logsByServer[activeServerId] ?? []). */
  logs: string[];

  stats: SystemStats | null;

  /**
   * Faux tant que la liste des serveurs, le serveur actif et leurs statuts
   * ne sont pas lus : le shell affiche des skeletons plutôt que les pages du
   * jeu par défaut et des serveurs « Arrêté ».
   */
  loaded: boolean;
}

type Action =
  | { type: "SET_SERVERS"; payload: Server[] }
  | { type: "SET_ACTIVE"; payload: { id: string | null; servers?: Server[] } }
  | { type: "SET_STATUSES"; payload: Record<string, ServerStatus> }
  | {
      type: "SET_SERVER_STATUS";
      payload: { serverId: string; status: ServerStatus };
    }
  | { type: "SET_STATS"; payload: SystemStats }
  | { type: "ADD_LOGS"; payload: { serverId: string; lines: string[] } }
  | { type: "CLEAR_LOGS"; payload?: { serverId?: string } }
  | { type: "SET_LOADED" };

const initialState: ServerState = {
  servers: [],
  activeServerId: null,
  activeServer: null,
  serverPath: "",
  statuses: {},
  status: "stopped",
  logsByServer: {},
  logs: [],
  stats: null,
  loaded: false,
};

// Garde-fou mémoire de la vue en direct (≈ 25 Mo au pire), pas une limite
// d'affichage : un serveur Dragonwilds écrit ~170 000 lignes en 11 h, une
// session de plusieurs jours finirait par peser des centaines de Mo. Au-delà,
// les plus anciennes sortent par paquets ; le fichier de session garde tout.
export const MAX_LIVE_LINES = 100_000;
const TRIM_CHUNK = 10_000;

// Lignes reçues regroupées puis ajoutées en une fois : un démarrage de
// Valheim envoie des centaines de lignes, et chaque ajout recopie le tableau.
const LOG_FLUSH_MS = 100;

function resolveActive(
  servers: Server[],
  id: string | null,
): { activeServer: Server | null; serverPath: string } {
  const active = id ? (servers.find((s) => s.id === id) ?? null) : null;
  return { activeServer: active, serverPath: active?.path ?? "" };
}

function statusForActive(
  statuses: Record<string, ServerStatus>,
  id: string | null,
): ServerStatus {
  return (id && statuses[id]) || "stopped";
}

function logsForActive(
  logsByServer: Record<string, string[]>,
  id: string | null,
): string[] {
  return (id && logsByServer[id]) || [];
}

function reducer(state: ServerState, action: Action): ServerState {
  switch (action.type) {
    case "SET_SERVERS": {
      const { activeServer, serverPath } = resolveActive(
        action.payload,
        state.activeServerId,
      );
      return { ...state, servers: action.payload, activeServer, serverPath };
    }
    case "SET_ACTIVE": {
      const servers = action.payload.servers ?? state.servers;
      const { activeServer, serverPath } = resolveActive(
        servers,
        action.payload.id,
      );
      return {
        ...state,
        servers,
        activeServerId: action.payload.id,
        activeServer,
        serverPath,
        status: statusForActive(state.statuses, action.payload.id),
        logs: logsForActive(state.logsByServer, action.payload.id),
      };
    }
    case "SET_STATUSES":
      return {
        ...state,
        statuses: action.payload,
        status: statusForActive(action.payload, state.activeServerId),
      };
    case "SET_SERVER_STATUS": {
      const statuses = {
        ...state.statuses,
        [action.payload.serverId]: action.payload.status,
      };
      return {
        ...state,
        statuses,
        status: statusForActive(statuses, state.activeServerId),
      };
    }
    case "SET_STATS":
      return { ...state, stats: action.payload };
    case "ADD_LOGS": {
      const { serverId, lines } = action.payload;
      const prev = state.logsByServer[serverId] ?? [];
      const all = prev.concat(lines);
      const nextLogs =
        all.length > MAX_LIVE_LINES
          ? all.slice(all.length - MAX_LIVE_LINES + TRIM_CHUNK)
          : all;
      const logsByServer = { ...state.logsByServer, [serverId]: nextLogs };
      return {
        ...state,
        logsByServer,
        logs: serverId === state.activeServerId ? nextLogs : state.logs,
      };
    }
    case "CLEAR_LOGS": {
      const targetId = action.payload?.serverId ?? state.activeServerId;
      if (!targetId) return state;
      const logsByServer = { ...state.logsByServer, [targetId]: [] };
      return {
        ...state,
        logsByServer,
        logs: targetId === state.activeServerId ? [] : state.logs,
      };
    }
    case "SET_LOADED":
      return { ...state, loaded: true };
    default:
      return state;
  }
}

interface ServerContextValue {
  state: ServerState;
  dispatch: React.Dispatch<Action>;
  /** Recharge la liste de serveurs depuis le main process. */
  refreshServers: () => Promise<Server[]>;
  /** Bascule le serveur actif (côté main + côté state). */
  switchActive: (id: string | null) => Promise<void>;
}

const ServerContext = createContext<ServerContextValue | null>(null);

export function ServerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshServers = async (): Promise<Server[]> => {
    const [list, active] = await Promise.all([
      window.api.servers.list(),
      window.api.servers.getActive(),
    ]);
    dispatch({
      type: "SET_ACTIVE",
      payload: { id: active?.id ?? null, servers: list },
    });
    return list;
  };

  const switchActive = async (id: string | null): Promise<void> => {
    await window.api.servers.setActive(id);
    const list = await window.api.servers.list();
    dispatch({ type: "SET_ACTIVE", payload: { id, servers: list } });
  };

  const refreshStatuses = async () => {
    try {
      const statuses = await serverService.getStatuses();
      dispatch({ type: "SET_STATUSES", payload: statuses });
    } catch {
      // ignore — main peut être indisponible au boot
    }
  };

  useEffect(() => {
    // Statuts lus tout de suite (pas au 1er tick du polling, 3 s plus tard :
    // un serveur lancé s'affichait « Arrêté » avec Démarrer actif).
    Promise.all([refreshServers(), refreshStatuses()])
      .catch(() => {})
      .finally(() => dispatch({ type: "SET_LOADED" }));

    monitorService.startPolling();
    const stopMonitor = monitorService.onStats((stats) => {
      dispatch({ type: "SET_STATS", payload: stats });
    });

    // Logs : regroupés par serveur, ajoutés toutes les LOG_FLUSH_MS ; le
    // reducer expose ceux du serveur actif via `state.logs`.
    const pending = new Map<string, string[]>();
    let flushTimer: ReturnType<typeof setTimeout> | null = null;
    const flushLogs = () => {
      if (flushTimer) clearTimeout(flushTimer);
      flushTimer = null;
      pending.forEach((lines, serverId) =>
        dispatch({ type: "ADD_LOGS", payload: { serverId, lines } }),
      );
      pending.clear();
    };
    const stopLogs = serverService.onLog(({ serverId, line }) => {
      const lines = pending.get(serverId);
      if (lines) lines.push(line);
      else pending.set(serverId, [line]);
      if (!flushTimer) flushTimer = setTimeout(flushLogs, LOG_FLUSH_MS);
    });
    // Nouvelle session (démarrage du serveur) : vue vidée pour ce serveur,
    // les sessions précédentes restent consultables (fichiers sur disque).
    // Les lignes en attente (fin de l'ancienne session) passent avant.
    const stopLogSessions = serverService.onLogSession(({ serverId }) => {
      flushLogs();
      dispatch({ type: "CLEAR_LOGS", payload: { serverId } });
    });

    // Polling des statuses agrégés (3s) : récupère le status de tous les
    // serveurs en une seule IPC call.
    const statusInterval = setInterval(refreshStatuses, 3000);

    return () => {
      stopMonitor();
      stopLogs();
      stopLogSessions();
      if (flushTimer) clearTimeout(flushTimer);
      clearInterval(statusInterval);
      monitorService.stopPolling();
    };
  }, []);

  return (
    <ServerContext.Provider
      value={{ state, dispatch, refreshServers, switchActive }}
    >
      {children}
    </ServerContext.Provider>
  );
}

export function useServer() {
  const ctx = useContext(ServerContext);
  if (!ctx) throw new Error("useServer must be used within ServerProvider");
  return ctx;
}
