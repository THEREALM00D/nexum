import {
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import type { AppUpdateStatus } from "@shared/types";

interface Props {
  status: AppUpdateStatus;
  justify: "center" | "flex-start";
  onRetry: () => void;
  onDownload: () => void;
  onInstall: () => void;
}

const actionSx = { mt: 0.5, fontSize: 11, py: 0.25 };

/** Ligne d'état sous la version : un rendu distinct pour chaque état. */
export default function UpdateStatusDetails({
  status,
  justify,
  onRetry,
  onDownload,
  onInstall,
}: Props) {
  const { t } = useTranslation();

  const line = (content: React.ReactNode, color = "text.disabled") => (
    <Stack
      direction="row"
      sx={{ alignItems: "center", justifyContent: justify, gap: 0.5, color }}
    >
      {content}
    </Stack>
  );

  switch (status.state) {
    case "checking":
      return line(
        <>
          <CircularProgress size={10} color="inherit" />
          <Typography variant="caption">
            {t("sidebar.update.checking")}
          </Typography>
        </>,
      );
    case "upToDate":
      return line(
        <>
          <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />
          <Typography variant="caption">
            {t("sidebar.update.upToDate", {
              time: format(status.checkedAt, "HH:mm"),
            })}
          </Typography>
        </>,
        "success.main",
      );
    case "available":
      return (
        <Button
          size="small"
          fullWidth={justify === "center"}
          variant="outlined"
          color="warning"
          startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
          onClick={onDownload}
          sx={actionSx}
        >
          {t("sidebar.update.download", { version: status.version })}
        </Button>
      );
    case "downloading":
      return (
        <Box sx={{ mt: 0.5, maxWidth: justify === "center" ? "none" : 260 }}>
          <LinearProgress
            variant={status.percent > 0 ? "determinate" : "indeterminate"}
            value={status.percent}
            color="warning"
          />
          <Typography
            variant="caption"
            sx={{ display: "block", color: "text.disabled" }}
          >
            {t("sidebar.update.downloading", { percent: status.percent })}
          </Typography>
        </Box>
      );
    case "downloaded":
      return (
        <Tooltip title={t("sidebar.update.installHint")}>
          <Button
            size="small"
            fullWidth={justify === "center"}
            variant="contained"
            color="warning"
            startIcon={<RestartAltIcon sx={{ fontSize: 14 }} />}
            onClick={onInstall}
            sx={actionSx}
          >
            {t("sidebar.update.install", { version: status.version })}
          </Button>
        </Tooltip>
      );
    case "error":
      return (
        <Box sx={{ textAlign: justify === "center" ? "center" : "left" }}>
          <Tooltip title={status.message}>
            <Typography
              variant="caption"
              sx={{ display: "block", color: "error.main" }}
            >
              {t(`sidebar.update.errors.${status.kind}`)}
            </Typography>
          </Tooltip>
          <Button size="small" onClick={onRetry} sx={{ fontSize: 11, py: 0 }}>
            {t("sidebar.update.retry")}
          </Button>
        </Box>
      );
    case "unavailable":
      return line(
        <Typography variant="caption">
          {t("sidebar.update.unavailable")}
        </Typography>,
      );
    case "devMode":
      return line(
        <Typography variant="caption">
          {t("sidebar.update.devMode")}
        </Typography>,
      );
    default:
      return null;
  }
}
