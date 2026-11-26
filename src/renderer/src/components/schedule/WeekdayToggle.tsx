import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

// Semaine affichée du lundi au dimanche ; valeurs de `Date.getDay`
// (0 = dimanche), comme `RestartConfig.weekdays`.
const WEEK: { day: number; key: string }[] = [
  { day: 1, key: "mon" },
  { day: 2, key: "tue" },
  { day: 3, key: "wed" },
  { day: 4, key: "thu" },
  { day: 5, key: "fri" },
  { day: 6, key: "sat" },
  { day: 0, key: "sun" },
];

interface Props {
  value: number[];
  onChange: (weekdays: number[]) => void;
  disabled?: boolean;
}

/** Jours de la semaine à choix multiple (au moins un pour enregistrer). */
export default function WeekdayToggle({ value, onChange, disabled }: Props) {
  const { t } = useTranslation();
  const empty = value.length === 0;
  return (
    <Stack spacing={1}>
      <Typography
        variant="caption"
        sx={{ color: disabled ? "text.disabled" : "text.secondary" }}
      >
        {t("schedule.days.label")}
      </Typography>
      <ToggleButtonGroup
        size="small"
        value={value}
        onChange={(_, weekdays: number[]) => onChange(weekdays)}
        disabled={disabled}
        aria-label={t("schedule.days.label")}
        sx={{ flexWrap: "wrap" }}
      >
        {WEEK.map(({ day, key }) => (
          <ToggleButton key={key} value={day} sx={{ px: 1.75 }}>
            {t(`schedule.days.${key}`)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {empty && !disabled && (
        <Typography variant="caption" sx={{ color: "error.light" }}>
          {t("schedule.days.none")}
        </Typography>
      )}
    </Stack>
  );
}
