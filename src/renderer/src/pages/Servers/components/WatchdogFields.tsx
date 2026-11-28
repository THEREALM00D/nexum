import { Stack, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import CheckboxField from "../../../components/common/CheckboxField";
import {
  integerInputValue,
  isIntegerInRange,
  parseIntegerInput,
} from "../../../components/schedule/integerInput";
import {
  DEFAULT_STUCK_MINUTES,
  defaultRamLimitGb,
  RAM_LIMIT_RANGE,
  STUCK_MINUTES_RANGE,
} from "@shared/watchdog";

/** 0 = option désactivée. */
export interface WatchdogValues {
  stuckStartMinutes: number;
  ramLimitGb: number;
}

/**
 * Valeurs à corriger avant d'enregistrer (champ vidé ou hors bornes).
 * `hasStartupCheck` faux (jeu sans ligne « prêt ») : le champ du démarrage
 * est masqué, il ne doit pas bloquer Enregistrer sans rien en rouge.
 */
export function watchdogInvalid(
  values: WatchdogValues,
  hasStartupCheck: boolean,
): boolean {
  const invalid = (value: number, [min, max]: readonly [number, number]) =>
    value !== 0 && !isIntegerInRange(value, min, max);
  return (
    (hasStartupCheck &&
      invalid(values.stuckStartMinutes, STUCK_MINUTES_RANGE)) ||
    invalid(values.ramLimitGb, RAM_LIMIT_RANGE)
  );
}

interface Props {
  values: WatchdogValues;
  onChange: (patch: Partial<WatchdogValues>) => void;
  /** Texte d'aide du jeu ; absent : le jeu n'a pas de ligne « prêt ». */
  startupReadyHintKey?: string;
  /** RAM conseillée du jeu (`GamePlugin.requirements`) : limite proposée. */
  recommendedRamGb?: number;
}

/**
 * Surveillance du serveur dans son dialogue : relancer un démarrage bloqué
 * (jeux qui disent quand ils sont prêts), redémarrer au-delà d'une RAM.
 */
export default function WatchdogFields({
  values,
  onChange,
  startupReadyHintKey,
  recommendedRamGb,
}: Props) {
  const { t } = useTranslation();

  const row = (
    key: keyof WatchdogValues,
    label: string,
    helper: string,
    fieldLabel: string,
    defaultValue: number,
    [min, max]: readonly [number, number],
  ) => {
    // Champ vidé pendant la saisie : NaN (pas 0, qui décocherait la case).
    const enabled = values[key] !== 0;
    return (
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ alignItems: "center", flexWrap: "wrap" }}
      >
        {/* Marge du libellé à 0 comme les cases au-dessus (la Stack
            parente la remet à 0 pour ses enfants directs, pas ici). */}
        <Stack
          sx={{
            flex: "1 1 280px",
            minWidth: 0,
            "& .MuiFormControlLabel-root": { ml: 0 },
          }}
        >
          <CheckboxField
            checked={enabled}
            onChange={(checked) =>
              onChange({ [key]: checked ? defaultValue : 0 })
            }
            label={label}
            helper={helper}
          />
        </Stack>
        <TextField
          label={fieldLabel}
          type="number"
          size="small"
          value={enabled ? integerInputValue(values[key]) : ""}
          onChange={(event) =>
            onChange({ [key]: parseIntegerInput(event.target.value) })
          }
          error={enabled && !isIntegerInRange(values[key], min, max)}
          disabled={!enabled}
          slotProps={{ htmlInput: { min, max } }}
          sx={{ width: 140, flex: "none" }}
        />
      </Stack>
    );
  };

  return (
    <Stack spacing={1.5}>
      {startupReadyHintKey &&
        row(
          "stuckStartMinutes",
          t("servers.dialog.stuckStart"),
          t(startupReadyHintKey),
          t("servers.dialog.stuckStartAfter"),
          DEFAULT_STUCK_MINUTES,
          STUCK_MINUTES_RANGE,
        )}
      {row(
        "ramLimitGb",
        t("servers.dialog.ramLimit"),
        t("servers.dialog.ramLimitHelper"),
        t("servers.dialog.ramLimitValue"),
        defaultRamLimitGb(recommendedRamGb),
        RAM_LIMIT_RANGE,
      )}
    </Stack>
  );
}
