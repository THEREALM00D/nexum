import { useEffect, useState } from "react";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../context/NotificationContext";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";
import { errorMessage } from "../../../utils/appErrorMessage";

/**
 * « Recevoir les versions bêta ». Désactivé par défaut : seules les versions
 * stables sont proposées. Le main revérifie aussitôt les mises à jour.
 */
export default function BetaUpdatesSwitch() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.api.update
      .getBetaUpdates()
      .then(setEnabled)
      .catch(() => setEnabled(null))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (next: boolean) => {
    try {
      setEnabled(await window.api.update.setBetaUpdates(next));
      notify(
        t(next ? "settings.updates.beta.on" : "settings.updates.beta.off"),
        "success",
      );
    } catch (e) {
      notify(errorMessage(t, e), "error");
    }
  };

  return (
    <LoadingSkeleton loading={loading}>
      <FormControlLabel
        disabled={enabled === null}
        control={
          <Switch
            checked={enabled ?? false}
            onChange={(e) => toggle(e.target.checked)}
          />
        }
        label={
          <Box>
            <Typography variant="body2">
              {t("settings.updates.beta.label")}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t("settings.updates.beta.helper")}
            </Typography>
          </Box>
        }
      />
    </LoadingSkeleton>
  );
}
