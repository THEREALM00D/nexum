// Relances automatiques d'un serveur (après un plantage ou un démarrage
// bloqué), comptées ensemble : au-delà de MAX_RESTARTS dans la fenêtre, on
// arrête de relancer, sinon un serveur qui ne démarre jamais bouclerait.

export const MAX_RESTARTS = 3;
export const RESTART_WINDOW_MS = 30 * 60_000;

const attempts = new Map<string, number[]>();

/**
 * Compte une relance. `gaveUp` : déjà MAX_RESTARTS dans la fenêtre, ne pas
 * relancer ; sinon `attempt` est le numéro de cette relance (1 à 3).
 */
export function recordRestartAttempt(serverId: string): {
  attempt: number;
  gaveUp: boolean;
} {
  const now = Date.now();
  const recent = (attempts.get(serverId) ?? []).filter(
    (at) => now - at < RESTART_WINDOW_MS,
  );
  if (recent.length >= MAX_RESTARTS) {
    attempts.set(serverId, recent);
    return { attempt: recent.length, gaveUp: true };
  }
  recent.push(now);
  attempts.set(serverId, recent);
  return { attempt: recent.length, gaveUp: false };
}
