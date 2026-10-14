import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next";
import type { AppUpdateStatus } from "@shared/types";
import { useAppUpdate } from "./hooks/useAppUpdate";
import UpdateStatusDetails from "./UpdateStatusDetails";

// États où lancer une nouvelle vérification manuelle est pertinent — pas
// pendant un check/téléchargement déjà en cours, ni quand une action est
// déjà proposée (mise à jour dispo ou prête à installer).
const CAN_CHECK_STATES: AppUpdateStatus["state"][] = [
  "idle",
  "upToDate",
  "error",
  "unavailable",
  "devMode",
];

/** Version de l'app + état de la mise à jour (Sidebar et page Paramètres). */
export default function UpdateIndicator({
  align = "center",
}: {
  align?: "center" | "left";
}) {
  const { t } = useTranslation();
  const { currentVersion, status, check, download, install } = useAppUpdate();
  const justify = align === "center" ? "center" : "flex-start";

  return (
    <Box sx={{ textAlign: align, mb: align === "center" ? 1.5 : 0 }}>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: justify, gap: 0.25 }}
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
      <UpdateStatusDetails
        status={status}
        justify={justify}
        onRetry={check}
        onDownload={download}
        onInstall={install}
      />
    </Box>
  );
}
