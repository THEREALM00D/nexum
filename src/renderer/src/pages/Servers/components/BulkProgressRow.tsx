import { Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SyncIcon from "@mui/icons-material/Sync";
import type { SvgIconComponent } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import type { BulkStep, BulkStepState } from "@shared/types";

// Couleurs des statuts (`utils/status.ts`) : en cours orange, fait vert,
// échec rouge, attente et passé neutres.
const BADGES: Record<
  BulkStepState,
  { icon: SvgIconComponent; background: string }
> = {
  waiting: { icon: MoreHorizIcon, background: "action.selected" },
  running: { icon: SyncIcon, background: "warning.main" },
  done: { icon: CheckIcon, background: "success.main" },
  failed: { icon: CloseIcon, background: "error.main" },
  skipped: { icon: SkipNextIcon, background: "action.selected" },
};

interface Props {
  step: BulkStep;
  name: string;
  detail: string;
  onViewLogs: () => void;
}

/** Un serveur dans la progression d'une action groupée. */
export default function BulkProgressRow({
  step,
  name,
  detail,
  onViewLogs,
}: Props) {
  const { t } = useTranslation();
  const { icon: Icon, background } = BADGES[step.state];
  const neutral = step.state === "waiting" || step.state === "skipped";
  const detailColor =
    step.state === "failed"
      ? "error.light"
      : step.state === "running"
        ? "warning.main"
        : "text.secondary";

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: "center",
        py: 1.25,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          flex: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: background,
          color: neutral ? "text.secondary" : "background.default",
        }}
      >
        <Icon sx={{ fontSize: 16 }} aria-hidden />
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {name}
        </Typography>
        <Typography variant="caption" sx={{ color: detailColor }}>
          {detail}
        </Typography>
        {step.state === "running" && (
          <LinearProgress
            color="warning"
            variant={
              step.percent === undefined ? "indeterminate" : "determinate"
            }
            value={step.percent ?? 0}
            sx={{ mt: 0.75 }}
          />
        )}
      </Stack>
      {step.state === "failed" && (
        <Button size="small" onClick={onViewLogs}>
          {t("servers.bulk.progress.viewLogs")}
        </Button>
      )}
    </Stack>
  );
}
