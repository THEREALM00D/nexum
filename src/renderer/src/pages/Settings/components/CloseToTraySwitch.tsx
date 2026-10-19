import { useEffect, useState } from "react";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../context/NotificationContext";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";

/**
 * « Garder Nexum dans la zone de notification à la fermeture ». Actif par
 * défaut : sauvegardes auto, redémarrages planifiés et logs de session ont
 * besoin que Nexum tourne. Désactivé, fermer la fenêtre quitte Nexum.
 */
export default function CloseToTraySwitch() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.api.app
      .getCloseToTray()
      .then(setEnabled)
      .catch(() => setEnabled(null))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (next: boolean) => {
    try {
      setEnabled(await window.api.app.setCloseToTray(next));
      notify(
        t(
          next
            ? "settings.startup.closeToTray.on"
            : "settings.startup.closeToTray.off",
        ),
        "success",
      );
    } catch (e) {
      notify((e as Error).message, "error");
    }
  };

  return (
    <LoadingSkeleton loading={loading}>
      <FormControlLabel
        disabled={enabled === null}
        control={
          <Switch
            checked={enabled ?? true}
            onChange={(e) => toggle(e.target.checked)}
          />
        }
        label={
          <Box>
            <Typography variant="body2">
              {t("settings.startup.closeToTray.label")}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t("settings.startup.closeToTray.helper")}
            </Typography>
          </Box>
        }
      />
    </LoadingSkeleton>
  );
}
