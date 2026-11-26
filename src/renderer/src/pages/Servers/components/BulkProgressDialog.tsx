import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { BulkRun, Server } from "@shared/types";
import BulkProgressRow from "./BulkProgressRow";
import {
  currentStep,
  finishedSteps,
  useBulkStepText,
} from "../hooks/useBulkStepText";

interface Props {
  open: boolean;
  run: BulkRun | null;
  servers: Server[];
  onClose: () => void;
  onStopAfterCurrent: () => void;
  onViewLogs: (serverId: string) => void;
}

/**
 * Avancée d'une action groupée, un serveur par ligne. Fermer ne l'arrête
 * pas (elle tourne dans le main) : un bandeau la suit sur la page.
 */
export default function BulkProgressDialog({
  open,
  run,
  servers,
  onClose,
  onStopAfterCurrent,
  onViewLogs,
}: Props) {
  const { t } = useTranslation();
  const stepText = useBulkStepText();
  if (!run) return null;

  const nameOf = (serverId: string) =>
    servers.find((server) => server.id === serverId)?.name ?? serverId;
  const total = run.steps.length;
  const finished = finishedSteps(run);
  const current = currentStep(run);
  const failed = run.steps.filter((step) => step.state === "failed").length;
  const succeeded = run.steps.filter((step) => step.state === "done").length;
  const summary = run.finished
    ? [
        t("servers.bulk.progress.finished", { succeeded, total }),
        failed > 0 ? t("servers.bulk.progress.failed", { count: failed }) : "",
      ]
        .filter(Boolean)
        .join(" ")
    : t("servers.bulk.progress.current", {
        current: Math.min(finished + 1, total),
        total,
      });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        {t(`servers.bulk.actions.${run.action}`)}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
          {summary}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={total === 0 ? 100 : (finished / total) * 100}
        />
        <Stack sx={{ mt: 1 }}>
          {run.steps.map((step) => (
            <BulkProgressRow
              key={step.serverId}
              step={step}
              name={nameOf(step.serverId)}
              detail={stepText(step)}
              onViewLogs={() => onViewLogs(step.serverId)}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap", gap: 1, pl: 3 }}>
        {!run.finished && (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", flex: "1 1 200px" }}
          >
            {t("servers.bulk.progress.closeHint")}
          </Typography>
        )}
        {!run.finished && current && (
          <Button onClick={onStopAfterCurrent} disabled={run.stopAfterCurrent}>
            {t(
              run.stopAfterCurrent
                ? "servers.bulk.progress.stopAfterRequested"
                : "servers.bulk.progress.stopAfter",
              { name: nameOf(current.serverId) },
            )}
          </Button>
        )}
        <Button variant="contained" onClick={onClose}>
          {t("servers.bulk.progress.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
