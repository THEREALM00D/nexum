import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useTranslation } from "react-i18next";
import { useAppUpdate } from "./hooks/useAppUpdate";

// États où lancer une nouvelle vérification manuelle est pertinent — pas
// pendant un check/téléchargement déjà en cours, ni quand une action est
// déjà proposée (mise à jour dispo ou prête à installer).
const CAN_CHECK_STATES = ["idle", "error", "unavailable"];

export default function UpdateIndicator({
  align = "center",
}: {
  align?: "center" | "left";
}) {
  const { t } = useTranslation();
  const { currentVersion, status, check, download, install } = useAppUpdate();

  return (
    <Box sx={{ textAlign: align, mb: align === "center" ? 1.5 : 0 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: align === "center" ? "center" : "flex-start",
          gap: 0.25,
        }}
      >
        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          {t("sidebar.version", { version: currentVersion })}
        </Typography>
        {CAN_CHECK_STATES.includes(status.state) && (
          <Tooltip title={t("sidebar.update.checkNow")}>
            <IconButton size="small" onClick={check} sx={{ p: 0.25 }}>
              <RefreshIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {status.state === "checking" && (
        <Typography
          variant="caption"
          sx={{ display: "block", color: "text.disabled" }}
        >
          {t("sidebar.update.checking")}
        </Typography>
      )}

      {status.state === "available" && (
        <Button
          size="small"
          fullWidth
          variant="outlined"
          color="warning"
          startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
          onClick={download}
          sx={{ mt: 0.5, fontSize: 11, py: 0.25 }}
        >
          {t("sidebar.update.download", { version: status.version })}
        </Button>
      )}

      {status.state === "downloading" && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.75,
            mt: 0.5,
          }}
        >
          <CircularProgress
            size={12}
            variant="determinate"
            value={status.percent}
          />
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {t("sidebar.update.downloading", { percent: status.percent })}
          </Typography>
        </Box>
      )}

      {status.state === "downloaded" && (
        <Tooltip title={t("sidebar.update.installHint")}>
          <Button
            size="small"
            fullWidth
            variant="contained"
            color="warning"
            startIcon={<RestartAltIcon sx={{ fontSize: 14 }} />}
            onClick={install}
            sx={{ mt: 0.5, fontSize: 11, py: 0.25 }}
          >
            {t("sidebar.update.install", { version: status.version })}
          </Button>
        </Tooltip>
      )}

      {status.state === "error" && (
        <Tooltip title={status.message}>
          <Typography
            variant="caption"
            sx={{ display: "block", color: "error.main" }}
          >
            {t("sidebar.update.error")}
          </Typography>
        </Tooltip>
      )}

      {status.state === "unavailable" && (
        <Typography
          variant="caption"
          sx={{ display: "block", color: "text.disabled" }}
        >
          {t("sidebar.update.unavailable")}
        </Typography>
      )}
    </Box>
  );
}
