import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  enUS as pickersEnglish,
  frFR as pickersFrench,
} from "@mui/x-date-pickers/locales";
import { enUS as dateFnsEnglish, fr as dateFnsFrench } from "date-fns/locale";
import { format, isValid, parse } from "date-fns";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/** Format de l'heure stockée dans la config du redémarrage planifié. */
const TIME_FORMAT = "HH:mm";

interface Props {
  label: string;
  /** Heure au format `HH:mm`. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Sélecteur d'heure aux couleurs de Nexum (le `type="time"` natif ouvre une
 * popup Chromium blanche et bleue). Lit et rend une heure `HH:mm` sur 24 h.
 */
export default function ScheduleTimePicker({
  label,
  value,
  onChange,
  disabled,
}: Props) {
  const { i18n } = useTranslation();
  const isEnglish = i18n.resolvedLanguage === "en";
  const pickerValue = useMemo(() => {
    const date = parse(value, TIME_FORMAT, new Date());
    return isValid(date) ? date : null;
  }, [value]);

  return (
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={isEnglish ? dateFnsEnglish : dateFnsFrench}
      localeText={
        (isEnglish ? pickersEnglish : pickersFrench).components
          .MuiLocalizationProvider.defaultProps.localeText
      }
    >
      <DesktopTimePicker
        label={label}
        value={pickerValue}
        // Saisie en cours (heure incomplète) : on garde la dernière heure
        // valide, le champ affiche la saisie partielle.
        onChange={(date) => {
          if (date && isValid(date)) onChange(format(date, TIME_FORMAT));
        }}
        ampm={false}
        format={TIME_FORMAT}
        disabled={disabled}
        slotProps={{ textField: { size: "small", sx: { maxWidth: 200 } } }}
      />
    </LocalizationProvider>
  );
}
