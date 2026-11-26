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
  useBulkStepText,
} from "../hooks/useBulkStepText";

interface Props {
  run: BulkRun;
  servers: Server[];
  onStopAfterCurrent: () => void;
  onShowDetails: () => void;
}

/** Action groupée en cours, fenêtre de progression fermée. */
export default function BulkProgressBanner({
  run,
  servers,
  onStopAfterCurrent,
  onShowDetails,
}: Props) {
  const { t } = useTranslation();
  const stepText = useBulkStepText();
  const total = run.steps.length;
  const finished = finishedSteps(run);
  const current = currentStep(run);
  const currentName = current
    ? (servers.find((server) => server.id === current.serverId)?.name ?? "")
    : "";

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
            {t("servers.bulk.progress.current", {
              current: Math.min(finished + 1, total),
              total,
            })}
            {current && ` · ${currentName} · ${stepText(current)}`}
          </Typography>
        </Typography>
        <LinearProgress
          variant="determinate"
          value={total === 0 ? 100 : (finished / total) * 100}
        />
      </Stack>
      {current && (
        <Button onClick={onStopAfterCurrent} disabled={run.stopAfterCurrent}>
          {t(
            run.stopAfterCurrent
              ? "servers.bulk.progress.stopAfterRequested"
              : "servers.bulk.progress.stopAfter",
            { name: currentName },
          )}
        </Button>
      )}
      <Button variant="outlined" onClick={onShowDetails}>
        {t("servers.bulk.progress.showDetails")}
      </Button>
    </Paper>
  );
}
