import type { IpcContext } from "../ipc/context";
import type { StopConfig } from "../server/ServerManager";
import { createGracefulShutdown } from "../server/shutdownClient";
import { appErrorLogText } from "../utils/appError";
import { lt, managerLine } from "../i18n/logStrings";

/** Une annonce partie jusqu'à 30 s après son heure (tick du planificateur) reste envoyée. */
const LATE_TOLERANCE_MS = 30 * 1000;
/** Vérification de l'annulation pendant l'attente d'un palier. */
const POLL_MS = 5 * 1000;

export type AnnounceKind = "restart" | "update";

export interface Countdown {
  /** Heure de l'arrêt (horodatage). */
  stopAt: number;
  /** Annonces en minutes avant l'arrêt, de la plus longue à la plus courte. */
  warnings: number[];
  kind: AnnounceKind;
  /** Faux si la planification a changé entre-temps : compte à rebours annulé. */
  stillWanted: () => boolean;
}

/**
 * Serveurs occupés : un seul compte à rebours ou une seule action à la fois
 * par serveur (redémarrage planifié, mise à jour trouvée, action groupée).
 */
const pending = new Set<string>();

export function isRestartPending(serverId: string): boolean {
  return pending.has(serverId);
}

/** Réserve le serveur ; faux s'il est déjà occupé. À libérer par `releaseRestartLock`. */
export function acquireRestartLock(serverId: string): boolean {
  if (pending.has(serverId)) return false;
  pending.add(serverId);
  return true;
}

export function releaseRestartLock(serverId: string): void {
  pending.delete(serverId);
}

/** Exécute `run` si aucun compte à rebours n'est en cours pour ce serveur. */
export async function withRestartLock(
  serverId: string,
  run: () => Promise<void>,
): Promise<void> {
  if (!acquireRestartLock(serverId)) return;
  try {
    await run();
  } finally {
    releaseRestartLock(serverId);
  }
}

/** Le serveur peut-il prévenir ses joueurs (API REST, RCON) ? */
export function canAnnounce(ctx: IpcContext, serverId: string): boolean {
  return createGracefulShutdown(ctx.getStopConfig(serverId)) !== null;
}

/** Message vide : texte par défaut dans la langue de Nexum au moment de l'envoi. */
export function announceText(
  ctx: IpcContext,
  serverId: string,
  minutes: number,
  kind: AnnounceKind,
): string {
  const custom = ctx.getServerConfig(serverId).restart.message.trim();
  if (custom) return custom.split("{minutes}").join(String(minutes));
  return kind === "update"
    ? lt().updateAnnounce(minutes)
    : lt().restartAnnounce(minutes);
}

function timeOfDay(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/** Attend `until` ; faux dès que `alive()` ne tient plus. */
async function waitUntil(
  until: number,
  alive: () => boolean,
): Promise<boolean> {
  while (Date.now() < until) {
    if (!alive()) return false;
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(POLL_MS, until - Date.now())),
    );
  }
  return alive();
}

/**
 * Annonces aux joueurs jusqu'au dernier palier, puis config d'arrêt de ce
 * palier : le plus petit délai part par `ServerManager.stop` (annonce,
 * sauvegarde, attente ARK ou `/shutdown` Palworld), comme avant. Sans accès
 * admin (pas de client d'annonce), aucune annonce : arrêt à l'heure.
 * Null si le compte à rebours est annulé (serveur arrêté ou relancé à la
 * main, planification changée).
 */
export async function runCountdown(
  ctx: IpcContext,
  serverId: string,
  countdown: Countdown,
): Promise<StopConfig | null> {
  const manager = ctx.serverManagers.getOrCreate(serverId);
  const pid = manager.getPid();
  const alive = () =>
    manager.getStatus() === "running" &&
    manager.getPid() === pid &&
    countdown.stillWanted();
  const stopConfig = ctx.getStopConfig(serverId);
  const graceful = createGracefulShutdown(stopConfig);
  const remainingMs = countdown.stopAt - Date.now() + LATE_TOLERANCE_MS;
  const warnings = graceful
    ? countdown.warnings.filter((minutes) => minutes * 60_000 <= remainingMs)
    : [];

  const isUpdate = countdown.kind === "update";
  if (warnings.length > 0) {
    const time = timeOfDay(countdown.stopAt);
    manager.log(
      managerLine(
        isUpdate
          ? lt().updateCountdownStarted(time)
          : lt().restartCountdownStarted(time),
      ),
    );
  }
  const cancelled = () => {
    manager.log(
      managerLine(
        isUpdate ? lt().updateRestartCancelled : lt().restartCancelled,
      ),
    );
    return null;
  };

  // Tous les paliers sauf le dernier : annonce seule (il n'y en a qu'avec
  // un client d'annonce).
  for (const minutes of graceful ? warnings.slice(0, -1) : []) {
    if (!(await waitUntil(countdown.stopAt - minutes * 60_000, alive)))
      return cancelled();
    const message = announceText(ctx, serverId, minutes, countdown.kind);
    try {
      await graceful?.client.announce(message);
      manager.log(managerLine(lt().announceSent(message)));
    } catch (error) {
      // Annonce ratée (serveur occupé) : les suivantes et l'arrêt partent quand même.
      const reason = appErrorLogText((error as Error).message);
      manager.log(managerLine(graceful?.unavailableLine(reason) ?? reason));
    }
  }

  const last = warnings.at(-1) ?? 0;
  if (!(await waitUntil(countdown.stopAt - last * 60_000, alive)))
    return cancelled();
  return {
    ...stopConfig,
    shutdownWaittime: last * 60,
    shutdownMessage:
      last > 0 ? announceText(ctx, serverId, last, countdown.kind) : "",
  };
}
