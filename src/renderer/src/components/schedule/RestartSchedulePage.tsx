import {
  Alert,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useRestartSchedule } from "./useRestartSchedule";
import LoadingSkeleton from "../common/LoadingSkeleton";

interface Props {
  /** Texte d'information du jeu (comment se passe l'arrêt). */
  infoKey?: string;
  /** Bloc propre au jeu affiché au-dessus du formulaire (Palworld : API REST). */
  notice?: ReactNode;
}

/**
 * Page « Planification » de tous les jeux : seuls le texte d'information et
 * un éventuel bloc propre au jeu changent d'un jeu à l'autre.
 */
export default function RestartSchedulePage({ infoKey, notice }: Props) {
  const { t } = useTranslation();
  const { cfg, loading, dirty, update, save } = useRestartSchedule();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6">{t("schedule.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("schedule.subtitle")}
        </Typography>
      </Box>

      {infoKey && (
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon fontSize="inherit" />}
          sx={{ fontSize: 13 }}
        >
          {t(infoKey)}
        </Alert>
      )}
      {notice}

      <Paper sx={{ p: 2.5 }}>
        <LoadingSkeleton loading={loading}>
          <FormControlLabel
            control={
              <Switch
                checked={cfg.enabled}
                onChange={(e) => update({ enabled: e.target.checked })}
              />
            }
            label={t("schedule.enabled")}
          />
        </LoadingSkeleton>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <LoadingSkeleton loading={loading} fullWidth sx={{ maxWidth: 200 }}>
            <TextField
              label={t("schedule.time")}
              type="time"
              size="small"
              value={cfg.time}
              onChange={(e) => update({ time: e.target.value })}
              disabled={!cfg.enabled}
              sx={{ maxWidth: 200 }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </LoadingSkeleton>
          <LoadingSkeleton loading={loading} fullWidth sx={{ maxWidth: 280 }}>
            <TextField
              label={t("schedule.warning")}
              type="number"
              size="small"
              value={cfg.warningMinutes}
              onChange={(e) =>
                update({
                  warningMinutes: Math.max(
                    0,
                    parseInt(e.target.value, 10) || 0,
                  ),
                })
              }
              disabled={!cfg.enabled}
              sx={{ maxWidth: 280 }}
              slotProps={{ htmlInput: { min: 0 } }}
              helperText={t("schedule.warningHelper")}
            />
          </LoadingSkeleton>
          <LoadingSkeleton loading={loading} fullWidth>
            <TextField
              label={t("schedule.message")}
              size="small"
              value={cfg.message}
              onChange={(e) => update({ message: e.target.value })}
              disabled={!cfg.enabled}
              helperText={t("schedule.messageHelper")}
              fullWidth
            />
          </LoadingSkeleton>
          <LoadingSkeleton loading={loading}>
            <FormControlLabel
              control={
                <Switch
                  checked={cfg.updateGame}
                  onChange={(e) => update({ updateGame: e.target.checked })}
                  disabled={!cfg.enabled}
                />
              }
              label={
                <Stack>
                  <Typography variant="body2">
                    {t("schedule.updateGame")}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {t("schedule.updateGameHelper")}
                  </Typography>
                </Stack>
              }
            />
          </LoadingSkeleton>
        </Stack>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            disabled={loading || !dirty}
            onClick={save}
          >
            {t("schedule.save")}
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
