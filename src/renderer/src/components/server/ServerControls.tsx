import { Button, Chip, Paper, Stack } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useTranslation } from "react-i18next";
import type { ServerStatus } from "@shared/types";

const STATUS_COLOR: Record<
  ServerStatus,
  "success" | "warning" | "error" | "default"
> = {
  running: "success",
  starting: "warning",
  stopping: "warning",
  crashed: "error",
  stopped: "default",
};

interface Props {
  status: ServerStatus;
  canStart: boolean;
  canStop: boolean;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
}

export default function ServerControls({
  status,
  canStart,
  canStop,
  onStart,
  onStop,
  onRestart,
}: Props) {
  const { t } = useTranslation();
  return (
    <Paper
      sx={{
        p: 2.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1.5,
      }}
    >
      <Chip
        label={t(`status.${status}`, { defaultValue: status })}
        color={STATUS_COLOR[status] ?? "default"}
        variant="outlined"
      />
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          color="success"
          startIcon={<PlayArrowIcon />}
          disabled={!canStart}
          onClick={onStart}
          size="small"
        >
          {t("dashboard.controls.start")}
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<RestartAltIcon />}
          disabled={!canStop}
          onClick={onRestart}
          size="small"
        >
          {t("dashboard.controls.restart")}
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<StopIcon />}
          disabled={!canStop}
          onClick={onStop}
          size="small"
        >
          {t("dashboard.controls.stop")}
        </Button>
      </Stack>
    </Paper>
  );
}
