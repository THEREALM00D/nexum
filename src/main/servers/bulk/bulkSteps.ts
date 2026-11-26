import type { BulkAction, BulkStep } from "../../../shared/types";
import type { IpcContext } from "../../ipc/context";
import { start, stop, type StepContext } from "./bulkStepTools";
import { runUpdateStep } from "./bulkUpdateStep";

/**
 * Traite un serveur, par les mêmes chemins que les boutons d'un serveur
 * (`startServer`, `ServerManager.stop`) et que la mise à jour planifiée
 * (`serverUpdate.ts`). Renvoie les lignes à écrire dans ses logs.
 * Redémarrer = arrêter puis démarrer (pas `restartServer`) : une annulation
 * entre les deux ne relance pas un serveur que Nexum est en train de quitter.
 */
export async function runBulkStep(
  ctx: IpcContext,
  action: BulkAction,
  step: BulkStep,
  context: StepContext,
): Promise<string[]> {
  const { serverId } = step;
  const { stopConfig, shouldContinue, update } = context;
  const running =
    ctx.serverManagers.getOrCreate(serverId).getStatus() === "running";

  if (action === "startAll") {
    if (running) {
      update({ state: "skipped", outcome: "alreadyRunning" });
      return [];
    }
    await start(ctx, serverId, update);
    update({ state: "done", outcome: "started" });
    return [];
  }

  if (action === "stopAll" || action === "restartRunning") {
    if (!running) {
      update({ state: "skipped", outcome: "notRunning" });
      return [];
    }
    await stop(ctx, serverId, stopConfig, update);
    if (action === "stopAll" || !shouldContinue()) {
      update({ state: "done", outcome: "stopped" });
      return [];
    }
    await start(ctx, serverId, update);
    update({ state: "done", outcome: "restarted" });
    return [];
  }

  return runUpdateStep(
    ctx,
    step,
    action === "stopUpdateRestartAll" && step.wasRunning,
    context,
  );
}
