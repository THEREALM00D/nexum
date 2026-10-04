import { useEffect, useState } from "react";
import {
  FormControlLabel,
  Paper,
  Switch,
  Typography,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { LaunchAtLoginState } from "@shared/types";
import { useNotification } from "../../../context/NotificationContext";

/**
 * « Lancer Nexum au démarrage de Windows ». Combiné à la case « Démarrer
 * automatiquement » de chaque serveur, un redémarrage du PC relance tout sans
 * intervention. Masqué quand non supporté (mode dev).
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

  if (!state?.supported) return null;

  const toggle = async (enabled: boolean) => {
    try {
      const next = await window.api.app.setLaunchAtLogin(enabled);
      setState(next);
      notify(
        t(
          next.enabled
            ? "servers.launchAtLogin.on"
            : "servers.launchAtLogin.off",
        ),
        "success",
      );
    } catch (e) {
      notify((e as Error).message, "error");
    }
  };

  return (
    <Paper sx={{ px: 2.5, py: 1.5 }}>
      <FormControlLabel
        control={
          <Switch
            checked={state.enabled}
            onChange={(e) => toggle(e.target.checked)}
          />
        }
        label={
          <Box>
            <Typography variant="body2">
              {t("servers.launchAtLogin.label")}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t("servers.launchAtLogin.helper")}
            </Typography>
          </Box>
        }
      />
    </Paper>
  );
}
