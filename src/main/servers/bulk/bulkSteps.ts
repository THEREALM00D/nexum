import type { BulkAction, BulkStep } from "../../../shared/types";
import type { IpcContext } from "../../ipc/context";
import type { StopConfig } from "../../server/ServerManager";
import { restartServer, startServer } from "../../server/startServer";
import {
  checkServerUpdate,
  parseSteamCmdPercent,
  updateStoppedServer,
} from "../../server/serverUpdate";

/** Change l'étape du serveur et prévient le renderer. */
export type StepUpdate = (patch: Partial<BulkStep>) => void;

/** Échec d'une étape : son erreur codée, gardée telle quelle pour le renderer. */
function fail(error: string | undefined): never {
  throw new Error(error ?? "");
}

const sendLog = (ctx: IpcContext, serverId: string) => (line: string) =>
  ctx.broadcastLog(serverId, line);

function isRunning(ctx: IpcContext, serverId: string): boolean {
  return ctx.serverManagers.getOrCreate(serverId).getStatus() === "running";
}

async function start(ctx: IpcContext, serverId: string, update: StepUpdate) {
  update({ phase: "starting", percent: undefined });
  const result = await startServer(ctx, serverId, sendLog(ctx, serverId));
  if (!result.success) fail(result.error);
}

async function stop(
  ctx: IpcContext,
  serverId: string,
  stopConfig: StopConfig,
  update: StepUpdate,
) {
  update({ phase: "stopping" });
  const result = await ctx.serverManagers
    .getOrCreate(serverId)
    .stop(stopConfig);
  if (!result.success) fail(result.error);
  // Comme `ServerManager.restart` : le temps que les ports se libèrent.
  await new Promise((resolve) => setTimeout(resolve, 1500));
}

/**
 * Vérifie puis installe la mise à jour d'un serveur **arrêté**. Renvoie
 * l'issue et le compte rendu à écrire au prochain démarrage (pas de
 * session de log serveur arrêté).
 */
async function updateIfNeeded(
  ctx: IpcContext,
  serverId: string,
  update: StepUpdate,
  check: Awaited<ReturnType<typeof checkServerUpdate>>,
): Promise<{ updated: boolean; report: string[] }> {
  if (check.kind !== "available") return { updated: false, report: [] };
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
  if (!result.updated) fail(result.error);
  update({ build: check.update.latestBuild, percent: undefined });
  return { updated: true, report: result.report };
}

/** Issue d'un serveur que la mise à jour n'a pas touché. */
function notUpdatedOutcome(
  kind: Awaited<ReturnType<typeof checkServerUpdate>>["kind"],
): BulkStep["outcome"] {
  if (kind === "steamLibrary") return "steamLibrary";
  if (kind === "noSteamCmd") return "noSteamCmd";
  if (kind === "unknown") return "updateUnknown";
  return "upToDate";
}

/**
 * Traite un serveur, par les mêmes chemins que les boutons d'un serveur
 * (`startServer`, `ServerManager.stop`, `restartServer`) et que la mise à
 * jour planifiée (`serverUpdate.ts`). `stopConfig` : config du dernier
 * palier d'annonce, ou celle du bouton Arrêter.
 */
export async function runBulkStep(
  ctx: IpcContext,
  action: BulkAction,
  step: BulkStep,
  stopConfig: StopConfig,
  update: StepUpdate,
): Promise<void> {
  const { serverId } = step;
  const running = isRunning(ctx, serverId);

  if (action === "startAll") {
    if (running) return update({ state: "skipped", outcome: "alreadyRunning" });
    await start(ctx, serverId, update);
    return update({ state: "done", outcome: "started" });
  }

  if (action === "stopAll" || action === "restartRunning") {
    if (!running) return update({ state: "skipped", outcome: "notRunning" });
    if (action === "stopAll") {
      await stop(ctx, serverId, stopConfig, update);
      return update({ state: "done", outcome: "stopped" });
    }
    update({ phase: "stopping" });
    const result = await restartServer(
      ctx,
      serverId,
      sendLog(ctx, serverId),
      stopConfig,
    );
    if (!result.success) fail(result.error);
    return update({ state: "done", outcome: "restarted" });
  }

  // Mise à jour. Un serveur arrêté au départ n'est pas démarré ; un serveur
  // lancé au départ (« arrêter, mettre à jour et redémarrer ») est relancé,
  // même s'il était à jour.
  const restartAfter = action === "stopUpdateRestartAll" && step.wasRunning;
  if (running && !restartAfter)
    return update({ state: "skipped", outcome: "alreadyRunning" });
  update({ phase: "checking" });
  const check = await checkServerUpdate(ctx, serverId);
  if (restartAfter && running) await stop(ctx, serverId, stopConfig, update);
  const { updated, report } = await updateIfNeeded(
    ctx,
    serverId,
    update,
    check,
  );
  if (!restartAfter) {
    return update({
      state: "done",
      outcome: updated ? "updated" : notUpdatedOutcome(check.kind),
    });
  }
  await start(ctx, serverId, update);
  const manager = ctx.serverManagers.getOrCreate(serverId);
  report.forEach((line) => manager.log(line));
  update({
    state: "done",
    // Relancé sans mise à jour : la raison si la vérification n'a pas pu
    // se faire (SteamCMD absent, bibliothèque Steam, Steam injoignable).
    outcome: updated
      ? "updatedRestarted"
      : check.kind === "upToDate"
        ? "upToDateRestarted"
        : notUpdatedOutcome(check.kind),
  });
}

/** Erreur codée d'un échec, ou son message brut. */
export function stepErrorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
