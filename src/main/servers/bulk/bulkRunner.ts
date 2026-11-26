import type {
  BulkAction,
  BulkRun,
  BulkStep,
  ServerStatus,
} from "../../../shared/types";
import type { IpcContext } from "../../ipc/context";
import type { StopConfig } from "../../server/ServerManager";
import { sendToRenderer } from "../../ipc/rendererEvents";
import { AppError } from "../../utils/appError";
import { lt, managerLine } from "../../i18n/logStrings";
import {
  acquireRestartLock,
  releaseRestartLock,
} from "../../scheduler/restartCountdown";
import { warnPlayers } from "./bulkWarnings";
import { runBulkStep, stepErrorText } from "./bulkSteps";

/** Écart entre deux démarrages, comme le démarrage automatique. */
const START_GAP_MS = 5000;

let current: BulkRun | null = null;
let stopAfterCurrent = false;

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

const stopsServers = (action: BulkAction) =>
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

function emit(run: BulkRun): void {
  sendToRenderer("servers:bulk:changed", snapshot(run));
}

export function getBulkRun(): BulkRun | null {
  return current ? snapshot(current) : null;
}

/** « Arrêter après ce serveur » : les serveurs suivants sont passés. */
export function requestStopAfterCurrent(): void {
  if (!current || current.finished) return;
  stopAfterCurrent = true;
  emit(current);
}

/** Oublie une action terminée (fenêtre fermée après la fin). */
export function dismissBulkRun(): void {
  if (current?.finished) current = null;
}

async function execute(ctx: IpcContext, run: BulkRun): Promise<void> {
  // Serveur pris par un compte à rebours (redémarrage planifié, mise à
  // jour trouvée) : passé. Chaque verrou est rendu dès son serveur traité.
  const held = new Set<string>();
  const release = (serverId: string) => {
    if (held.delete(serverId)) releaseRestartLock(serverId);
  };
  const locked = run.steps.filter((step) => {
    if (acquireRestartLock(step.serverId)) {
      held.add(step.serverId);
      return true;
    }
    Object.assign(step, { state: "skipped", outcome: "busy" });
    return false;
  });
  try {
    const actionLine = managerLine(lt().bulkActionStarted(run.action));
    for (const step of locked)
      ctx.serverManagers.getOrCreate(step.serverId).log(actionLine);
    const warnedConfigs =
      run.warnPlayers && stopsServers(run.action)
        ? await warnPlayers(ctx, run, () => emit(run))
        : new Map<string, StopConfig | null>();

    let previousStarted = false;
    for (const step of locked) {
      if (stopAfterCurrent) {
        Object.assign(step, { state: "skipped", phase: undefined });
        continue;
      }
      const warnedConfig = warnedConfigs.get(step.serverId);
      if (warnedConfig === null) {
        Object.assign(step, {
          state: "skipped",
          phase: undefined,
          outcome: "notRunning",
        });
        continue;
      }
      if (run.action === "startAll" && previousStarted)
        await new Promise((resolve) => setTimeout(resolve, START_GAP_MS));
      Object.assign(step, { state: "running" });
      emit(run);
      try {
        await runBulkStep(
          ctx,
          run.action,
          step,
          warnedConfig ?? ctx.getStopConfig(step.serverId),
          (patch) => {
            Object.assign(step, patch);
            emit(run);
          },
        );
      } catch (error) {
        Object.assign(step, { state: "failed", error: stepErrorText(error) });
      }
      step.phase = undefined;
      previousStarted = step.outcome === "started";
      release(step.serverId);
      emit(run);
    }
  } finally {
    for (const serverId of [...held]) release(serverId);
    run.finished = true;
    emit(run);
  }
}

/**
 * Lance une action sur tous les serveurs visés, un serveur après l'autre ;
 * l'échec de l'un n'arrête pas les autres. Une seule action à la fois.
 * Renvoie l'état initial ; la suite arrive par `servers:bulk:changed`.
 */
export function startBulkRun(
  ctx: IpcContext,
  action: BulkAction,
  warnPlayersFirst: boolean,
): BulkRun {
  if (current && !current.finished) throw new AppError("BULK_ACTION_RUNNING");
  const statuses = ctx.serverManagers.statuses();
  const steps: BulkStep[] = bulkTargets(action, statuses).map((serverId) => ({
    serverId,
    wasRunning: statuses[serverId] === "running",
    state: "waiting",
  }));
  stopAfterCurrent = false;
  const run: BulkRun = {
    action,
    warnPlayers: warnPlayersFirst,
    steps,
    stopAfterCurrent: false,
    finished: false,
  };
  current = run;
  void execute(ctx, run);
  return snapshot(run);
}
