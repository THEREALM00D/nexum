import { useEffect, useState } from "react";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { LaunchAtLoginState } from "@shared/types";
import { useNotification } from "../../../context/NotificationContext";

/**
 * « Lancer Nexum au démarrage de Windows ». Combiné à la case « Démarrer
 * automatiquement » de chaque serveur, un redémarrage du PC relance tout sans
 * intervention. Grisé (avec une explication) quand non supporté : mode dev,
 * où on enregistrerait electron.exe au démarrage.
 */
export default function LaunchAtLoginSwitch() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [state, setState] = useState<LaunchAtLoginState | null>(null);

  useEffect(() => {
    window.api.app
      .getLaunchAtLogin()
      .then(setState)
      .catch(() => setState(null));
  }, []);

  const toggle = async (enabled: boolean) => {
    try {
      const next = await window.api.app.setLaunchAtLogin(enabled);
      setState(next);
      notify(
        t(
          next.enabled
            ? "settings.startup.launchAtLogin.on"
            : "settings.startup.launchAtLogin.off",
        ),
        "success",
      );
    } catch (e) {
      notify((e as Error).message, "error");
    }
  };

  const supported = state?.supported ?? false;

  return (
    <FormControlLabel
      disabled={!supported}
      control={
        <Switch
          checked={state?.enabled ?? false}
          onChange={(e) => toggle(e.target.checked)}
        />
      }
      label={
        <Box>
          <Typography variant="body2">
            {t("settings.startup.launchAtLogin.label")}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {t(
              supported
                ? "settings.startup.launchAtLogin.helper"
                : "settings.startup.launchAtLogin.unsupported",
            )}
          </Typography>
        </Box>
      }
    />
  );
}
