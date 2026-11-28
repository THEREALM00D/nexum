import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useTranslation } from "react-i18next";
import { BACKUP_INTERVALS } from "@shared/backupIntervals";

interface Props {
  label: string;
  value: number;
  onChange: (minutes: number) => void;
  disabled?: boolean;
}

/** Intervalle d'une sauvegarde automatique (monde, profils des joueurs ARK). */
export default function BackupIntervalSelect({
  label,
  value,
  onChange,
  disabled,
}: Props) {
  const { t } = useTranslation();
  return (
    <FormControl size="small" disabled={disabled} sx={{ maxWidth: 280 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {BACKUP_INTERVALS.map((minutes) => (
          <MenuItem key={minutes} value={minutes}>
            {t(
              minutes === 0
                ? "backup.config.autoOff"
                : `backup.config.auto${minutes}`,
            )}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
