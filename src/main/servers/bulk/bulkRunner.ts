import type { BulkAction, BulkRun, BulkStep } from "../../../shared/types";
import type { IpcContext } from "../../ipc/context";
import type { StopConfig } from "../../server/ServerManager";
import { AppError, appErrorLogText } from "../../utils/appError";
import { lt, managerLine } from "../../i18n/logStrings";
import {
  acquireRestartLock,
  releaseRestartLock,
} from "../../scheduler/restartCountdown";
import { warnPlayers } from "./bulkWarnings";
import { runBulkStep } from "./bulkSteps";
import { StepFailure } from "./bulkStepTools";
import {
  beginBulkRun,
  bulkTargets,
  emitBulkRun,
  getBulkRun,
  hasRunningBulkAction,
  isBulkCancelled,
  isStopAfterRequested,
  stopsServers,
} from "./bulkState";

/** Écart entre deux démarrages, comme le démarrage automatique. */
const START_GAP_MS = 5000;

/** Erreur codée d'un échec, ou son message brut. */
function stepErrorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Traite un serveur ; renvoie les lignes à écrire dans ses logs. */
async function processStep(
  ctx: IpcContext,
  run: BulkRun,
  step: BulkStep,
  stopConfig: StopConfig,
): Promise<string[]> {
  Object.assign(step, { state: "running" });
  emitBulkRun(run);
  try {
    return await runBulkStep(ctx, run.action, step, {
      stopConfig,
      shouldContinue: () => !isBulkCancelled(),
      update: (patch) => {
        Object.assign(step, patch);
        emitBulkRun(run);
      },
    });
  } catch (error) {
    Object.assign(step, { state: "failed", error: stepErrorText(error) });
    return [
      ...(error instanceof StepFailure ? error.report : []),
      managerLine(lt().bulkStepFailed(appErrorLogText(stepErrorText(error)))),
    ];
  }
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
  const actionLine = managerLine(lt().bulkActionStarted(run.action));
  try {
    const warnedConfigs =
      run.warnPlayers && stopsServers(run.action)
        ? await warnPlayers(
            ctx,
            run,
            () => !isStopAfterRequested(),
            () => emitBulkRun(run),
          )
        : new Map<string, StopConfig | null>();

    let previousStarted = false;
    for (const step of locked) {
      const warnedConfig = warnedConfigs.get(step.serverId);
      const stopRequested = isStopAfterRequested();
      if (stopRequested || warnedConfig === null) {
        // Compte à rebours annulé par une relance ou un arrêt à la main :
        // « n'était plus lancé » ; par « Arrêter après » : passé.
        Object.assign(step, {
          state: "skipped",
          phase: undefined,
          outcome: stopRequested ? undefined : "notRunning",
        });
        release(step.serverId);
        continue;
      }
      if (run.action === "startAll" && previousStarted)
        await new Promise((resolve) => setTimeout(resolve, START_GAP_MS));
      const manager = ctx.serverManagers.getOrCreate(step.serverId);
      if (manager.getStatus() === "running") manager.log(actionLine);
      const lines = await processStep(
        ctx,
        run,
        step,
        warnedConfig ?? ctx.getStopConfig(step.serverId),
      );
      // Compte rendu ou échec : dans la session du serveur s'il tourne,
      // sinon une courte session à lui (sans session, une ligne n'irait dans
      // aucun fichier). Rien à ajouter : pas de session vide.
      if (lines.length > 0)
        ctx.serverManagers
          .getOrCreate(step.serverId)
          .logOutsideSession([actionLine, ...lines], (line) =>
            ctx.broadcastLog(step.serverId, line),
          );
      step.phase = undefined;
      previousStarted = step.outcome === "started";
      release(step.serverId);
      emitBulkRun(run);
    }
  } catch (error) {
    // Erreur hors d'une étape (config illisible…) : rien ne reste « en cours ».
    for (const step of run.steps) {
      if (step.state === "waiting" || step.state === "running")
        Object.assign(step, {
          state: "failed",
          phase: undefined,
          error: stepErrorText(error),
        });
    }
  } finally {
    for (const serverId of [...held]) release(serverId);
    run.finished = true;
    emitBulkRun(run);
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
  if (hasRunningBulkAction()) throw new AppError("BULK_ACTION_RUNNING");
  const statuses = ctx.serverManagers.statuses();
  const steps: BulkStep[] = bulkTargets(action, statuses).map((serverId) => ({
    serverId,
    wasRunning: statuses[serverId] === "running",
    state: "waiting",
  }));
  const run: BulkRun = {
    action,
    warnPlayers: warnPlayersFirst,
    steps,
    stopAfterCurrent: false,
    finished: false,
  };
  beginBulkRun(run);
  void execute(ctx, run);
  return getBulkRun() ?? run;
}
