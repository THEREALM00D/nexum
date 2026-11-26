import { useTranslation } from "react-i18next";
import type { BulkRun, BulkStep } from "@shared/types";
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
