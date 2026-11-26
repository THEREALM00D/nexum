import type { BulkAction, BulkRun, ServerStatus } from "../../../shared/types";
import { sendToRenderer } from "../../ipc/rendererEvents";

// État de l'action groupée en cours (une seule à la fois), gardé dans le
// main : la page Serveurs le relit au montage et suit ses changements.

let current: BulkRun | null = null;
let stopAfterCurrent = false;
/** Annulée parce que Nexum quitte : plus rien ne démarre. */
let cancelled = false;

const isDown = (status: ServerStatus) =>
  status === "stopped" || status === "crashed";

/** Serveurs visés par une action, d'après leur statut au lancement. */
export function bulkTargets(
  action: BulkAction,
  statuses: Record<string, ServerStatus>,
): string[] {
  return Object.entries(statuses)
    .filter(([, status]) => {
      if (action === "startAll" || action === "updateStopped")
        return isDown(status);
      if (action === "stopUpdateRestartAll")
        return isDown(status) || status === "running";
      return status === "running";
    })
    .map(([serverId]) => serverId);
}

export const stopsServers = (action: BulkAction) =>
  action === "stopAll" ||
  action === "restartRunning" ||
  action === "stopUpdateRestartAll";

function snapshot(run: BulkRun): BulkRun {
  return {
    ...run,
    stopAfterCurrent,
    steps: run.steps.map((step) => ({ ...step })),
  };
}

/** Envoie l'état au renderer (`servers:bulk:changed`). */
export function emitBulkRun(run: BulkRun): void {
  sendToRenderer("servers:bulk:changed", snapshot(run));
}

export function getBulkRun(): BulkRun | null {
  return current ? snapshot(current) : null;
}

export function hasRunningBulkAction(): boolean {
  return current !== null && !current.finished;
}

/** Nouvelle action : remet les demandes d'arrêt à zéro. */
export function beginBulkRun(run: BulkRun): void {
  current = run;
  stopAfterCurrent = false;
  cancelled = false;
}

export const isStopAfterRequested = () => stopAfterCurrent;
export const isBulkCancelled = () => cancelled;

/**
 * « Arrêter après ce serveur » : les serveurs suivants sont passés. Pendant
 * les annonces, les comptes à rebours sont annulés tout de suite.
 */
export function requestStopAfterCurrent(): void {
  if (!current || current.finished) return;
  stopAfterCurrent = true;
  emitBulkRun(current);
}

/** Oublie une action terminée (son résultat a été vu). */
export function dismissBulkRun(): void {
  if (current?.finished) current = null;
}

/**
 * Nexum quitte (`quitGuard.ts`) : annonces annulées, plus aucun serveur
 * démarré ni relancé ; le serveur en cours finit son étape.
 */
export function cancelBulkRun(): void {
  if (!current || current.finished) return;
  cancelled = true;
  stopAfterCurrent = true;
  emitBulkRun(current);
}

/** Serveur en cours de mise à jour SteamCMD par l'action groupée, ou null. */
export function bulkUpdatingServer(): string | null {
  if (!current || current.finished) return null;
  const step = current.steps.find(
    (candidate) =>
      candidate.state === "running" && candidate.phase === "updating",
  );
  return step?.serverId ?? null;
}
