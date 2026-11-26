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
const BADGES: Record<BulkStepState, { icon: SvgIconComponent; bg: string }> = {
  waiting: { icon: MoreHorizIcon, bg: "action.selected" },
  running: { icon: SyncIcon, bg: "warning.main" },
  done: { icon: CheckIcon, bg: "success.main" },
  failed: { icon: CloseIcon, bg: "error.main" },
  skipped: { icon: SkipNextIcon, bg: "action.selected" },
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
  const { icon: Icon, bg } = BADGES[step.state];
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
          bgcolor: bg,
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
