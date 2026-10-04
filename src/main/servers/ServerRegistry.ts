import { randomUUID } from "crypto";
import type Store from "electron-store";
import type { Server } from "../../shared/types";
import type { AppStore } from "../ipc/context";

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
  constructor(private store: Store<AppStore>) {}

  list(): Server[] {
    return this.store.get("servers", [] as Server[]);
  }

  getActiveId(): string | null {
    return this.store.get("activeServerId", null as string | null);
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
    this.store.set("activeServerId", server.id);
    // On garde `serverPath` dans le store pour rétrocompat (peut être lu par
    // d'anciens handlers pas encore migrés). Pas grave qu'il reste.
    return server;
  }

  setActive(id: string | null): void {
    if (id !== null && !this.list().some((s) => s.id === id)) {
      throw new Error(`Serveur introuvable : ${id}`);
    }
    this.store.set("activeServerId", id);
  }

  create(input: {
    name: string;
    path: string;
    gameType?: Server["gameType"];
    color?: string | null;
    autoStart?: boolean;
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
    };
    this.store.set("servers", [...servers, server]);
    if (!this.getActiveId()) this.store.set("activeServerId", server.id);
    return server;
  }

  update(id: string, patch: Partial<Omit<Server, "id" | "createdAt">>): Server {
    const servers = this.list();
    const idx = servers.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Serveur introuvable : ${id}`);
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
      this.store.set("activeServerId", next[0]?.id ?? null);
    }
  }

  private inferNameFromPath(path: string): string {
    const segments = path.replace(/[/\\]+$/, "").split(/[/\\]/);
    return segments[segments.length - 1] || "Server";
  }
}
