import { randomUUID } from "crypto";
import type Store from "electron-store";
import type { Server } from "../../shared/types";
import type { AppStore } from "../ipc/context";
import { AppError } from "../utils/appError";

const DEFAULT_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#06b6d4",
  "#ec4899",
];

export class ServerRegistry {
  /**
   * Serveur actif gardé en mémoire, lu une seule fois au démarrage. Le store
   * (electron-store, sans cache) relit config.json à chaque `get` : une autre
   * instance de Nexum sur le même dossier de données (dev) qui changeait de
   * serveur actif changeait aussi la cible de tous nos handlers « serveur
   * actif » — Arrêter visait un autre serveur, sans rien écrire (issue #144).
   */
  private activeId: string | null;

  constructor(private store: Store<AppStore>) {
    this.activeId = store.get("activeServerId", null as string | null);
  }

  list(): Server[] {
    return this.store.get("servers", [] as Server[]);
  }

  getActiveId(): string | null {
    return this.activeId;
  }

  /** Change le serveur actif en mémoire et le persiste pour le prochain lancement. */
  private writeActive(id: string | null): void {
    this.activeId = id;
    this.store.set("activeServerId", id);
  }

  getActive(): Server | null {
    const id = this.getActiveId();
    if (!id) return null;
    return this.list().find((s) => s.id === id) ?? null;
  }

  /**
   * Migre l'ancien `serverPath` unique en premier serveur de la liste.
   * No-op si `servers` est déjà peuplé ou si aucun `serverPath` legacy n'existe.
   * Retourne le serveur créé (ou null si rien à migrer).
   */
  migrateLegacy(): Server | null {
    const existing = this.list();
    if (existing.length > 0) return null;

    const legacyPath = this.store.get("serverPath", "");
    if (!legacyPath) return null;

    const server: Server = {
      id: randomUUID(),
      name: this.inferNameFromPath(legacyPath),
      gameType: "palworld",
      path: legacyPath,
      color: DEFAULT_COLORS[0],
      createdAt: Date.now(),
    };
    this.store.set("servers", [server]);
    this.writeActive(server.id);
    // On garde `serverPath` dans le store pour rétrocompat (peut être lu par
    // d'anciens handlers pas encore migrés). Pas grave qu'il reste.
    return server;
  }

  setActive(id: string | null): void {
    if (id !== null && !this.list().some((s) => s.id === id)) {
      throw new AppError("SERVER_NOT_FOUND", { id });
    }
    this.writeActive(id);
  }

  create(input: {
    name: string;
    path: string;
    gameType?: Server["gameType"];
    color?: string | null;
    autoStart?: boolean;
    autoRestart?: boolean;
  }): Server {
    const servers = this.list();
    const server: Server = {
      id: randomUUID(),
      name: input.name.trim() || this.inferNameFromPath(input.path),
      gameType: input.gameType ?? "palworld",
      path: input.path,
      color:
        input.color ?? DEFAULT_COLORS[servers.length % DEFAULT_COLORS.length],
      createdAt: Date.now(),
      autoStart: input.autoStart ?? false,
      autoRestart: input.autoRestart ?? false,
    };
    this.store.set("servers", [...servers, server]);
    if (!this.getActiveId()) this.writeActive(server.id);
    return server;
  }

  update(id: string, patch: Partial<Omit<Server, "id" | "createdAt">>): Server {
    const servers = this.list();
    const idx = servers.findIndex((s) => s.id === id);
    if (idx === -1) throw new AppError("SERVER_NOT_FOUND", { id });
    const updated = { ...servers[idx], ...patch };
    const next = [...servers];
    next[idx] = updated;
    this.store.set("servers", next);
    return updated;
  }

  delete(id: string): void {
    const next = this.list().filter((s) => s.id !== id);
    this.store.set("servers", next);
    if (this.getActiveId() === id) {
      this.writeActive(next[0]?.id ?? null);
    }
  }

  private inferNameFromPath(path: string): string {
    const segments = path.replace(/[/\\]+$/, "").split(/[/\\]/);
    return segments[segments.length - 1] || "Server";
  }
}
