import type { Server, WatchdogEvent } from "../../shared/types";
import { notifyWatchdog } from "./serverAlerts";

// Dernier événement de la surveillance par serveur (démarrage bloqué, RAM) :
// gardé ici, le Dashboard le relit au montage (un toast se perdait au
// rechargement) jusqu'à ce qu'il soit masqué.
const events = new Map<string, WatchdogEvent>();

export function reportWatchdogEvent(
  server: Server,
  event: Omit<WatchdogEvent, "serverId" | "at">,
): void {
  const full: WatchdogEvent = { ...event, serverId: server.id, at: Date.now() };
  events.set(server.id, full);
  notifyWatchdog(server, full);
}

export function getWatchdogEvent(serverId: string): WatchdogEvent | null {
  return events.get(serverId) ?? null;
}

export function dismissWatchdogEvent(serverId: string): void {
  events.delete(serverId);
}
