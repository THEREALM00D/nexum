import {
  Button,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { BulkRun, Server } from "@shared/types";
import {
  currentStep,
  finishedSteps,
  serverName,
  useBulkStepText,
  useBulkSummary,
  useStopAfterLabel,
} from "../hooks/useBulkStepText";

interface Props {
  run: BulkRun;
  servers: Server[];
  onStopAfterCurrent: () => void;
  onShowDetails: () => void;
  /** Action terminée : le bandeau reste jusqu'à ce qu'on le masque. */
  onDismiss: () => void;
}

/**
 * Action groupée, fenêtre de progression fermée : son avancée, puis son
 * bilan une fois terminée (sinon un échec passait inaperçu).
 */
export default function BulkProgressBanner({
  run,
  servers,
  onStopAfterCurrent,
  onShowDetails,
  onDismiss,
}: Props) {
  const { t } = useTranslation();
  const stepText = useBulkStepText();
  const summary = useBulkSummary();
  const stopAfterLabel = useStopAfterLabel();
  const total = run.steps.length;
  const current = run.finished ? null : currentStep(run);
  const stopLabel = stopAfterLabel(run, servers);
  const failed = run.steps.some((step) => step.state === "failed");

  return (
    <Paper
      variant="outlined"
      sx={{
        px: 2,
        py: 1.25,
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
        borderColor: failed ? "error.main" : undefined,
      }}
    >
      <Stack spacing={0.75} sx={{ flex: "1 1 280px", minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {t(`servers.bulk.actions.${run.action}`)}
          <Typography
            component="span"
            variant="body2"
            sx={{ color: "text.secondary" }}
          >
            {" · "}
            {summary(run)}
            {current &&
              ` · ${serverName(servers, current.serverId)} · ${stepText(current)}`}
          </Typography>
        </Typography>
        <LinearProgress
          variant="determinate"
          color={failed ? "error" : "primary"}
          value={total === 0 ? 100 : (finishedSteps(run) / total) * 100}
        />
      </Stack>
      {stopLabel && (
        <Button onClick={onStopAfterCurrent} disabled={run.stopAfterCurrent}>
          {stopLabel}
        </Button>
      )}
      <Button variant="outlined" onClick={onShowDetails}>
        {t("servers.bulk.progress.showDetails")}
      </Button>
      {run.finished && (
        <Button onClick={onDismiss}>
          {t("servers.bulk.progress.dismiss")}
        </Button>
      )}
    </Paper>
  );
}
