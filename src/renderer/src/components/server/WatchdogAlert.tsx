import { useEffect, useState } from "react";
import { Alert, Button, IconButton, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import type { WatchdogEvent } from "@shared/types";
import { useNavigate } from "../../context/NavigationContext";
import { formatNumber } from "../../utils/format";

/**
 * Ce que la surveillance a fait seule (démarrage bloqué, RAM) : relu dans le
 * main au montage (un toast se perdait au rechargement), affiché jusqu'à ce
 * qu'on le masque.
 */
export default function WatchdogAlert({ serverId }: { serverId: string }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [event, setEvent] = useState<WatchdogEvent | null>(null);

  useEffect(() => {
    window.api.server
      .getWatchdogEvent(serverId)
      .then(setEvent)
      .catch(() => setEvent(null));
    return window.api.server.onWatchdog((next) => {
      if (next.serverId === serverId) setEvent(next);
    });
  }, [serverId]);

  if (!event) return null;
  const params = {
    time: format(event.at, "HH:mm"),
    // Pluriels i18next (« 1 minute », « 10 minutes »).
    count: event.minutes ?? 0,
    attempt: event.attempt,
    max: event.maxAttempts,
    ram: formatNumber(event.ramGb ?? 0, i18n.resolvedLanguage ?? "fr", 1),
    limit: event.limitGb,
  };
  const dismiss = () => {
    setEvent(null);
    window.api.server.dismissWatchdogEvent(serverId).catch(() => {});
  };

  return (
    <Alert
      severity={
        event.kind === "stuckGaveUp" || event.kind === "ramGaveUp"
          ? "error"
          : "warning"
      }
      // `action` remplace le bouton de fermeture de l'Alert : les deux ici.
      action={
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <Button color="inherit" size="small" onClick={() => navigate("logs")}>
            {t("serverWatchdog.viewLogs")}
          </Button>
          <IconButton
            color="inherit"
            size="small"
            aria-label={t("serverWatchdog.dismiss")}
            onClick={dismiss}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      }
    >
      {t(
        event.kind === "ramLimit" && !event.playersWarned
          ? "serverWatchdog.ramLimitNoWarning"
          : `serverWatchdog.${event.kind}`,
        params,
      )}
    </Alert>
  );
}
