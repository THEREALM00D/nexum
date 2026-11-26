import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  MAX_WARNING_MINUTES,
  UPDATE_CHECK_HOURS,
} from "@shared/restartSchedule";
import Section from "../common/Section";
import SwitchField from "../common/SwitchField";
import {
  integerInputValue,
  isIntegerInRange,
  parseIntegerInput,
} from "./integerInput";
import type { ScheduleForm } from "./useRestartSchedule";

/**
 * Carte « Mises à jour du jeu » : au redémarrage planifié (dépend de
 * l'interrupteur principal), ou toutes les N heures pendant que le serveur
 * tourne (indépendant).
 */
export default function GameUpdatesSection({
  config,
  update,
  loading,
}: ScheduleForm) {
  const { t } = useTranslation();
  const checkDisabled = !config.checkUpdates;

  return (
    <Section label={t("schedule.sections.updates")} loading={loading}>
      <SwitchField
        checked={config.updateGame}
        onChange={(updateGame) => update({ updateGame })}
        label={t("schedule.updateGame")}
        helper={t("schedule.updateGameHelper")}
        disabled={!config.enabled}
      />
      <SwitchField
        checked={config.checkUpdates}
        onChange={(checkUpdates) => update({ checkUpdates })}
        label={t("schedule.checkUpdates")}
        helper={t("schedule.checkUpdatesHelper")}
      />
      {/* En retrait sous l'interrupteur (largeur du Switch). */}
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ flexWrap: "wrap", pl: 6.5 }}
      >
        <FormControl
          size="small"
          sx={{ minWidth: 180 }}
          disabled={checkDisabled}
        >
          <InputLabel>{t("schedule.checkEvery")}</InputLabel>
          <Select
            label={t("schedule.checkEvery")}
            value={config.checkUpdatesHours}
            onChange={(event) =>
              update({ checkUpdatesHours: Number(event.target.value) })
            }
          >
            {UPDATE_CHECK_HOURS.map((hours) => (
              <MenuItem key={hours} value={hours}>
                {t("schedule.hours", { count: hours })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label={t("schedule.updateWarning")}
          type="number"
          size="small"
          value={integerInputValue(config.updateWarningMinutes)}
          onChange={(event) =>
            update({
              updateWarningMinutes: parseIntegerInput(event.target.value),
            })
          }
          error={
            !checkDisabled &&
            !isIntegerInRange(
              config.updateWarningMinutes,
              0,
              MAX_WARNING_MINUTES,
            )
          }
          disabled={checkDisabled}
          slotProps={{ htmlInput: { min: 0, max: MAX_WARNING_MINUTES } }}
          sx={{ width: 220 }}
        />
      </Stack>
    </Section>
  );
}
