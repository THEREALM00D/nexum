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
  finishedSteps,
  serverName,
  useBulkStepText,
  useBulkSummary,
  useStopAfterLabel,
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
  const summary = useBulkSummary();
  const stopAfterLabel = useStopAfterLabel();
  if (!run) return null;

  const total = run.steps.length;
  const stopLabel = stopAfterLabel(run, servers);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        {t(`servers.bulk.actions.${run.action}`)}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
          {summary(run)}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={total === 0 ? 100 : (finishedSteps(run) / total) * 100}
        />
        <Stack sx={{ mt: 1 }}>
          {run.steps.map((step) => (
            <BulkProgressRow
              key={step.serverId}
              step={step}
              name={serverName(servers, step.serverId)}
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
        {stopLabel && (
          <Button onClick={onStopAfterCurrent} disabled={run.stopAfterCurrent}>
            {stopLabel}
          </Button>
        )}
        <Button variant="contained" onClick={onClose}>
          {t("servers.bulk.progress.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
