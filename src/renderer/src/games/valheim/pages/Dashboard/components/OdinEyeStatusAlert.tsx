import { Alert, type AlertColor } from "@mui/material";
import { useTranslation } from "react-i18next";
import LoadingSkeleton from "../../../../../components/common/LoadingSkeleton";
import { appErrorMessage } from "../../../../../utils/appErrorMessage";
import type { OdinEyeStatus } from "../hooks/useOdinEyeStatus";

/**
 * Bandeau du suivi des joueurs : non configuré, configuré (serveur arrêté),
 * en attente (serveur qui démarre), connecté, ou injoignable avec la raison.
 * Skeleton tant que la config n'est pas lue ou que la première interrogation
 * d'un serveur déjà lancé n'a pas répondu.
 */
export default function OdinEyeStatusAlert({
  status,
  running,
}: {
  status: OdinEyeStatus;
  running: boolean;
}) {
  const { t } = useTranslation();
  const { loading, configured, url, count, error, waiting } = status;
  const pending =
    running && configured && count === null && error === null && !waiting;

  let severity: AlertColor = "info";
  let text = t("valheimDashboard.noApi");
  if (configured && waiting) {
    text = t("valheimDashboard.odinEye.waiting", { url });
  } else if (configured && error) {
    severity = "warning";
    text = t("valheimDashboard.odinEye.error", {
      reason: appErrorMessage(t, error),
    });
  } else if (configured && running) {
    severity = "success";
    text = t("valheimDashboard.odinEye.connected", { url });
  } else if (configured) {
    text = t("valheimDashboard.odinEye.idle", { url });
  }

  return (
    <LoadingSkeleton loading={loading || pending} fullWidth>
      <Alert severity={severity} sx={{ fontSize: 13 }}>
        {text}
      </Alert>
    </LoadingSkeleton>
  );
}
