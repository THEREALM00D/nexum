import type { BulkRun } from "../../../shared/types";
import type { IpcContext } from "../../ipc/context";
import type { StopConfig } from "../../server/ServerManager";
import { canAnnounce, runCountdown } from "../../scheduler/restartCountdown";

/**
 * Phase d'annonces, **en parallèle** : chaque serveur lancé qui sait
 * prévenir ses joueurs (API REST, RCON) suit les annonces de sa
 * Planification, comme un redémarrage planifié. Renvoie la config d'arrêt
 * du dernier palier par serveur (null : compte à rebours annulé, serveur
 * arrêté ou relancé à la main). Les autres serveurs ne sont pas attendus.
 */
export async function warnPlayers(
  ctx: IpcContext,
  run: BulkRun,
  /** Faux après « Arrêter après » : comptes à rebours annulés tout de suite. */
  stillWanted: () => boolean,
  onChange: () => void,
): Promise<Map<string, StopConfig | null>> {
  const configs = new Map<string, StopConfig | null>();
  const warned = run.steps.filter(
    (step) =>
      step.state === "waiting" &&
      step.wasRunning &&
      canAnnounce(ctx, step.serverId),
  );
  for (const step of warned) step.phase = "warning";
  onChange();
  await Promise.all(
    warned.map(async (step) => {
      const { warnings } = ctx.getServerConfig(step.serverId).restart;
      const stopConfig = await runCountdown(ctx, step.serverId, {
        stopAt: Date.now() + (warnings[0] ?? 0) * 60_000,
        warnings,
        kind: "restart",
        stillWanted,
      });
      configs.set(step.serverId, stopConfig);
    }),
  );
  return configs;
}
