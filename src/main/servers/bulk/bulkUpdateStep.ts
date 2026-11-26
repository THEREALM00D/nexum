import type { BulkStep } from "../../../shared/types";
import type { IpcContext } from "../../ipc/context";
import {
  checkServerUpdate,
  parseSteamCmdPercent,
  updateStoppedServer,
  type UpdateCheck,
} from "../../server/serverUpdate";
import {
  start,
  stop,
  StepFailure,
  type StepContext,
  type StepUpdate,
} from "./bulkStepTools";

/** Installe la mise à jour trouvée, serveur **arrêté**. Renvoie le compte rendu. */
async function installUpdate(
  ctx: IpcContext,
  serverId: string,
  update: StepUpdate,
  check: UpdateCheck,
): Promise<string[]> {
  if (check.kind !== "available") return [];
  update({ phase: "updating", percent: undefined });
  const result = await updateStoppedServer(
    ctx,
    serverId,
    check.update,
    (line) => {
      const percent = parseSteamCmdPercent(line);
      if (percent !== null) update({ percent });
    },
  );
  if (!result.updated) throw new StepFailure(result.error, result.report);
  update({ build: check.update.latestBuild, percent: undefined });
  return result.report;
}

/** Issue d'un serveur que la mise à jour n'a pas touché. */
function notUpdatedOutcome(kind: UpdateCheck["kind"]): BulkStep["outcome"] {
  if (kind === "steamLibrary") return "steamLibrary";
  if (kind === "noSteamCmd") return "noSteamCmd";
  if (kind === "unknown") return "updateUnknown";
  return "upToDate";
}

/**
 * Mise à jour (« mettre à jour les arrêtés », « arrêter, mettre à jour et
 * redémarrer »). Statut et PID relus après la vérification (jusqu'à 30 s
 * de SteamCMD) : un serveur démarré ou relancé à la main entre-temps est
 * passé, jamais mis à jour lancé.
 */
export async function runUpdateStep(
  ctx: IpcContext,
  step: BulkStep,
  restartAfter: boolean,
  { stopConfig, shouldContinue, update }: StepContext,
): Promise<string[]> {
  const manager = ctx.serverManagers.getOrCreate(step.serverId);
  const pid = manager.getPid();
  const running = () => manager.getStatus() === "running";
  // Lancé au départ puis arrêté à la main : passé ; arrêté au départ puis
  // démarré à la main : passé aussi.
  if (restartAfter && !running()) {
    update({ state: "skipped", outcome: "notRunning" });
    return [];
  }
  if (!restartAfter && running()) {
    update({ state: "skipped", outcome: "alreadyRunning" });
    return [];
  }
  update({ phase: "checking" });
  const check = await checkServerUpdate(ctx, step.serverId);
  const unchanged = restartAfter
    ? running() && manager.getPid() === pid
    : !running();
  if (!unchanged || !shouldContinue()) {
    update({
      state: "skipped",
      outcome: restartAfter ? "notRunning" : "alreadyRunning",
    });
    return [];
  }

  if (restartAfter) await stop(ctx, step.serverId, stopConfig, update);
  const report = await installUpdate(ctx, step.serverId, update, check);
  const updated = check.kind === "available";
  if (!restartAfter) {
    update({
      state: "done",
      outcome: updated ? "updated" : notUpdatedOutcome(check.kind),
    });
    return report;
  }
  if (!shouldContinue()) {
    update({ state: "skipped", outcome: "stopped" });
    return report;
  }
  await start(ctx, step.serverId, update);
  // Relancé sans mise à jour : la raison si la vérification n'a pas pu se
  // faire (SteamCMD absent, bibliothèque Steam, Steam injoignable).
  update({
    state: "done",
    outcome: updated
      ? "updatedRestarted"
      : check.kind === "upToDate"
        ? "upToDateRestarted"
        : notUpdatedOutcome(check.kind),
  });
  return report;
}
