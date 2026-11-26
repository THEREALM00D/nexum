import type { BulkStep } from "../../../shared/types";
import type { IpcContext } from "../../ipc/context";
import type { StopConfig } from "../../server/ServerManager";
import { startServer } from "../../server/startServer";

/** Change l'étape du serveur et prévient le renderer. */
export type StepUpdate = (patch: Partial<BulkStep>) => void;

export interface StepContext {
  /** Config du dernier palier d'annonce, ou celle du bouton Arrêter. */
  stopConfig: StopConfig;
  /** Faux une fois l'action annulée (Nexum quitte) : plus rien ne démarre. */
  shouldContinue: () => boolean;
  update: StepUpdate;
}

/** Échec d'une étape : erreur codée, plus les lignes déjà écrites pour les logs. */
export class StepFailure extends Error {
  constructor(
    message: string | undefined,
    readonly report: string[] = [],
  ) {
    super(message ?? "");
  }
}

const sendLog = (ctx: IpcContext, serverId: string) => (line: string) =>
  ctx.broadcastLog(serverId, line);

export async function start(
  ctx: IpcContext,
  serverId: string,
  update: StepUpdate,
) {
  update({ phase: "starting", percent: undefined });
  const result = await startServer(ctx, serverId, sendLog(ctx, serverId));
  if (!result.success) throw new StepFailure(result.error);
}

export async function stop(
  ctx: IpcContext,
  serverId: string,
  stopConfig: StopConfig,
  update: StepUpdate,
) {
  update({ phase: "stopping" });
  const result = await ctx.serverManagers
    .getOrCreate(serverId)
    .stop(stopConfig);
  if (!result.success) throw new StepFailure(result.error);
  // Comme `ServerManager.restart` : le temps que les ports se libèrent.
  await new Promise((resolve) => setTimeout(resolve, 1500));
}
