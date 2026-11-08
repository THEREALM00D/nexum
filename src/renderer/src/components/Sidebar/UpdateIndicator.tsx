import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next";
import type { AppUpdateStatus } from "@shared/types";
import { useAppUpdate } from "./hooks/useAppUpdate";
import UpdateStatusDetails from "./UpdateStatusDetails";
import LoadingSkeleton from "../common/LoadingSkeleton";

// États où lancer une nouvelle vérification manuelle est pertinent — pas
// pendant un check/téléchargement déjà en cours, ni quand une action est
// déjà proposée (mise à jour dispo ou prête à installer).
export const CAN_CHECK_STATES: AppUpdateStatus["state"][] = [
  "idle",
  "upToDate",
  "error",
  "unavailable",
  "devMode",
];

/** Version de l'app + état de la mise à jour (page Paramètres). */
export default function UpdateIndicator() {
  const { t } = useTranslation();
  const { currentVersion, status, loading, check, download, install } =
    useAppUpdate();

  return (
    <Box>
      <LoadingSkeleton loading={loading}>
        <Stack direction="row" sx={{ alignItems: "center", gap: 0.25 }}>
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {/* « 0.00.0 » : largeur réaliste pour le skeleton avant la vraie version */}
            {t("sidebar.version", { version: currentVersion || "0.00.0" })}
          </Typography>
          {CAN_CHECK_STATES.includes(status.state) && (
            <Tooltip title={t("sidebar.update.checkNow")}>
              <IconButton size="small" onClick={check} sx={{ p: 0.25 }}>
                <RefreshIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </LoadingSkeleton>
      {!loading && (
        <UpdateStatusDetails
          status={status}
          justify="flex-start"
          onRetry={check}
          onDownload={download}
          onInstall={install}
        />
      )}
    </Box>
  );
}
