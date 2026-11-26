import { useTranslation } from "react-i18next";
import type { BulkRun, BulkStep, Server } from "@shared/types";
import { appErrorMessage } from "../../../utils/appErrorMessage";
import { formatNumber } from "../../../utils/format";

/** Serveurs déjà traités (fait, échec ou passé). */
export function finishedSteps(run: BulkRun): number {
  return run.steps.filter(
    (step) => step.state !== "waiting" && step.state !== "running",
  ).length;
}

/** Serveur en cours (le premier qui n'est pas traité), ou null. */
export function currentStep(run: BulkRun): BulkStep | null {
  return (
    run.steps.find((step) => step.state === "running") ??
    run.steps.find((step) => step.state === "waiting") ??
    null
  );
}

/** Nom d'un serveur, ou son id s'il a été supprimé entre-temps. */
export function serverName(servers: Server[], serverId: string): string {
  return servers.find((server) => server.id === serverId)?.name ?? serverId;
}

/** Phase d'annonces en cours : aucun serveur traité, des annonces partent. */
function isWarning(run: BulkRun): boolean {
  return (
    !run.steps.some((step) => step.state === "running") &&
    run.steps.some((step) => step.phase === "warning")
  );
}

/** Résumé de l'action : « Serveur 2 sur 4 », ou bilan une fois terminée. */
export function useBulkSummary() {
  const { t } = useTranslation();
  return (run: BulkRun): string => {
    const total = run.steps.length;
    if (!run.finished) {
      return t("servers.bulk.progress.current", {
        current: Math.min(finishedSteps(run) + 1, total),
        total,
      });
    }
    const countOf = (state: BulkStep["state"]) =>
      run.steps.filter((step) => step.state === state).length;
    const failed = countOf("failed");
    const skipped = countOf("skipped");
    return [
      t("servers.bulk.progress.finished", {
        count: total,
        succeeded: countOf("done"),
      }),
      failed > 0 ? t("servers.bulk.progress.failed", { count: failed }) : "",
      skipped > 0
        ? t("servers.bulk.progress.skippedCount", { count: skipped })
        : "",
    ]
      .filter(Boolean)
      .join(" ");
  };
}

/**
 * Bouton « Arrêter après X ». Pendant les annonces, aucun serveur n'est en
 * cours : le bouton annule les annonces et l'action.
 */
export function useStopAfterLabel() {
  const { t } = useTranslation();
  return (run: BulkRun, servers: Server[]): string | null => {
    const current = currentStep(run);
    if (run.finished || !current) return null;
    if (isWarning(run))
      return t(
        run.stopAfterCurrent
          ? "servers.bulk.progress.cancelRequested"
          : "servers.bulk.progress.cancelWarnings",
      );
    return t(
      run.stopAfterCurrent
        ? "servers.bulk.progress.stopAfterRequested"
        : "servers.bulk.progress.stopAfter",
      { name: serverName(servers, current.serverId) },
    );
  };
}

/** Ligne d'état d'un serveur dans la progression d'une action groupée. */
export function useBulkStepText() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "fr";

  return (step: BulkStep): string => {
    const phaseText = step.phase
      ? t(`servers.bulk.progress.phase.${step.phase}`)
      : "";
    if (step.state === "waiting")
      return phaseText || t("servers.bulk.progress.waiting");
    if (step.state === "running") {
      if (step.percent === undefined) return phaseText;
      return t("servers.bulk.progress.percent", {
        phase: phaseText,
        percent: formatNumber(Math.floor(step.percent), locale, 0),
      });
    }
    if (step.state === "failed") {
      return step.error
        ? t("servers.bulk.progress.failure", {
            error: appErrorMessage(t, step.error, step.error),
          })
        : t("servers.bulk.progress.failureUnknown");
    }
    return step.outcome
      ? t(`servers.bulk.progress.outcome.${step.outcome}`, {
          build: step.build ?? "",
        })
      : t("servers.bulk.progress.skipped");
  };
}
