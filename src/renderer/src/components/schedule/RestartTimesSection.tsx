import {
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { useTranslation } from "react-i18next";
import type { RestartMode } from "@shared/types";
import { restartTimesOfDay, sortTimes } from "@shared/restartSchedule";
import Section from "../common/Section";
import SwitchField from "../common/SwitchField";
import ChipListField from "./ChipListField";
import AddValueButton from "./AddValueButton";
import ScheduleTimePicker from "./ScheduleTimePicker";
import WeekdayToggle from "./WeekdayToggle";
import { formatNextRestart } from "./nextRestart";
import {
  integerInputValue,
  isIntegerInRange,
  parseIntegerInput,
} from "./integerInput";
import type { ScheduleForm } from "./useRestartSchedule";

/** Carte « Redémarrages » : heures fixes et jours, ou toutes les X heures. */
export default function RestartTimesSection({
  config,
  update,
  loading,
}: ScheduleForm) {
  const { t, i18n } = useTranslation();
  const disabled = !config.enabled;
  const next = formatNextRestart(config, t, i18n.resolvedLanguage);
  // Mode intervalle : les heures obtenues, pour vérifier d'un coup d'œil.
  const nextLabel = !next
    ? t("schedule.next.none")
    : config.mode === "interval"
      ? t("schedule.next.intervalLabel", {
          when: next,
          times: restartTimesOfDay(config).join(", "),
        })
      : t("schedule.next.label", { when: next });

  return (
    <Section label={t("schedule.sections.restarts")} loading={loading}>
      <SwitchField
        checked={config.enabled}
        onChange={(enabled) => update({ enabled })}
        label={t("schedule.enabled")}
      />
      <ToggleButtonGroup
        exclusive
        size="small"
        value={config.mode}
        onChange={(_, mode: RestartMode | null) => {
          if (mode) update({ mode });
        }}
        disabled={disabled}
        aria-label={t("schedule.mode.label")}
        sx={{ flexWrap: "wrap", alignSelf: "flex-start" }}
      >
        <ToggleButton value="times" sx={{ px: 2 }}>
          {t("schedule.mode.times")}
        </ToggleButton>
        <ToggleButton value="interval" sx={{ px: 2 }}>
          {t("schedule.mode.interval")}
        </ToggleButton>
      </ToggleButtonGroup>

      {config.mode === "times" ? (
        <Stack spacing={2}>
          <ChipListField
            label={t("schedule.times")}
            values={config.times}
            format={(time) => time}
            onRemove={(time) =>
              update({ times: config.times.filter((item) => item !== time) })
            }
            helper={
              config.times.length === 0 && !disabled
                ? t("schedule.noTimes")
                : undefined
            }
            error
            disabled={disabled}
            addButton={
              <AddValueButton
                label={t("schedule.addTime")}
                initial="12:00"
                disabled={disabled}
                errorOf={(time) =>
                  config.times.includes(time)
                    ? t("schedule.alreadyListed")
                    : null
                }
                renderField={(time, setTime) => (
                  <ScheduleTimePicker
                    label={t("schedule.newTime")}
                    value={time}
                    onChange={setTime}
                  />
                )}
                onAdd={(time) =>
                  update({ times: sortTimes([...config.times, time]) })
                }
              />
            }
          />
          <WeekdayToggle
            value={config.weekdays}
            onChange={(weekdays) => update({ weekdays: [...weekdays].sort() })}
            disabled={disabled}
          />
        </Stack>
      ) : (
        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
          <TextField
            label={t("schedule.intervalHours")}
            type="number"
            size="small"
            value={integerInputValue(config.intervalHours)}
            onChange={(event) =>
              update({ intervalHours: parseIntegerInput(event.target.value) })
            }
            error={!disabled && !isIntegerInRange(config.intervalHours, 1, 24)}
            disabled={disabled}
            slotProps={{ htmlInput: { min: 1, max: 24 } }}
            sx={{ width: 180 }}
          />
          <ScheduleTimePicker
            label={t("schedule.intervalStart")}
            value={config.intervalStart}
            onChange={(intervalStart) => update({ intervalStart })}
            disabled={disabled}
          />
        </Stack>
      )}

      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", color: "text.secondary" }}
      >
        <ScheduleOutlinedIcon
          fontSize="small"
          color={next ? "primary" : "inherit"}
        />
        <Typography variant="body2">{nextLabel}</Typography>
      </Stack>
    </Section>
  );
}
