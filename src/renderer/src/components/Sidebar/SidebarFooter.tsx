import {
  Box,
  ButtonBase,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import type { AppUpdateStatus } from "@shared/types";
import { FOCUS_RING_SX } from "../../theme";
import LoadingSkeleton from "../common/LoadingSkeleton";
import DiscordButton from "./DiscordButton";
import { useAppUpdate } from "./hooks/useAppUpdate";
import { CAN_CHECK_STATES } from "./UpdateIndicator";
import UpdateStatusDetails from "./UpdateStatusDetails";

// États qui demandent un bouton ou un message : une seconde ligne, seul cas
// où le pied de la Sidebar dépasse une ligne.
const ACTION_STATES: AppUpdateStatus["state"][] = [
  "available",
  "downloading",
  "downloaded",
  "error",
];

/** Bas de la Sidebar dépliée : aide à gauche, état de la mise à jour à droite. */
export default function SidebarFooter() {
  const { t } = useTranslation();
  const { currentVersion, status, loading, check, download, install } =
    useAppUpdate();
  const canCheck = CAN_CHECK_STATES.includes(status.state);
  // « 0.00.0 » : largeur réaliste pour le skeleton avant la vraie version
  const version = t("sidebar.version", {
    version: currentVersion || "0.00.0",
  });

  const tooltip = (() => {
    switch (status.state) {
      case "upToDate":
        return t("sidebar.update.checkedAt", {
          version,
          time: format(status.checkedAt, "HH:mm"),
        });
      case "checking":
        return t("sidebar.update.checking");
      case "unavailable":
        return t("sidebar.update.unavailable");
      case "devMode":
        return t("sidebar.update.devMode");
      default:
        return t("sidebar.update.checkNow");
    }
  })();

  return (
    <Box>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <DiscordButton collapsed={false} />
        <LoadingSkeleton loading={loading}>
          <Tooltip title={tooltip}>
            <ButtonBase
              onClick={canCheck ? check : undefined}
              aria-disabled={!canCheck}
              sx={{
                gap: 0.5,
                px: 0.5,
                py: 0.25,
                borderRadius: 1,
                color:
                  status.state === "upToDate"
                    ? "success.main"
                    : "text.secondary",
                cursor: canCheck ? "pointer" : "default",
                ...FOCUS_RING_SX,
              }}
            >
              {status.state === "upToDate" ? (
                <>
                  <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />
                  <Typography variant="caption">
                    {t("sidebar.update.upToDateShort")}
                  </Typography>
                </>
              ) : (
                <>
                  {status.state === "checking" && (
                    <CircularProgress size={10} color="inherit" />
                  )}
                  <Typography variant="caption">{version}</Typography>
                  {canCheck && <RefreshIcon sx={{ fontSize: 13 }} />}
                </>
              )}
            </ButtonBase>
          </Tooltip>
        </LoadingSkeleton>
      </Stack>
      {!loading && ACTION_STATES.includes(status.state) && (
        <Box sx={{ px: 1, pb: 1 }}>
          <UpdateStatusDetails
            status={status}
            justify="center"
            onRetry={check}
            onDownload={download}
            onInstall={install}
          />
        </Box>
      )}
    </Box>
  );
}
