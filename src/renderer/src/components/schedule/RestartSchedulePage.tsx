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
import { useTranslation } from "react-i18next";
import { useRestartSchedule } from "./useRestartSchedule";

/**
 * Page « Planification » des jeux sans API d'administration (Valheim,
 * Astroneer, Dragonwilds) : seul le texte d'information change d'un jeu à
 * l'autre (comment se passe l'arrêt au moment du redémarrage).
 */
export default function RestartSchedulePage({ infoKey }: { infoKey: string }) {
  const { t } = useTranslation();
  const { cfg, dirty, update, save } = useRestartSchedule();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6">{t("schedule.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("schedule.subtitle")}
        </Typography>
      </Box>

      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="inherit" />}
        sx={{ fontSize: 13 }}
      >
        {t(infoKey)}
      </Alert>

      <Paper sx={{ p: 2.5 }}>
        <FormControlLabel
          control={
            <Switch
              checked={cfg.enabled}
              onChange={(e) => update({ enabled: e.target.checked })}
            />
          }
          label={t("schedule.enabled")}
        />
        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
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
          <TextField
            label={t("schedule.warning")}
            type="number"
            size="small"
            value={cfg.warningMinutes}
            onChange={(e) =>
              update({
                warningMinutes: Math.max(0, parseInt(e.target.value, 10) || 0),
              })
            }
            disabled={!cfg.enabled}
            sx={{ maxWidth: 280 }}
            slotProps={{ htmlInput: { min: 0 } }}
            helperText={t("schedule.warningHelper")}
          />
          <TextField
            label={t("schedule.message")}
            size="small"
            value={cfg.message}
            onChange={(e) => update({ message: e.target.value })}
            disabled={!cfg.enabled}
            helperText={t("schedule.messageHelper")}
            fullWidth
          />
        </Stack>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" disabled={!dirty} onClick={save}>
            {t("schedule.save")}
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
