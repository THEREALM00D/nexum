import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MAX_WARNING_MINUTES, sortWarnings } from "@shared/restartSchedule";
import Section from "../common/Section";
import ChipListField from "./ChipListField";
import AddValueButton from "./AddValueButton";
import {
  integerInputValue,
  isIntegerInRange,
  parseIntegerInput,
} from "./integerInput";
import type { ScheduleForm } from "./useRestartSchedule";

/** Plus petit délai absent de la liste : proposé à l'ouverture de « Ajouter ». */
function firstFreeDelay(warnings: number[]): number {
  let minutes = 1;
  while (warnings.includes(minutes) && minutes < MAX_WARNING_MINUTES)
    minutes += 1;
  return minutes;
}

/**
 * Carte « Avertir les joueurs » : délais des annonces et message. Sert au
 * redémarrage planifié et à la mise à jour trouvée pendant que le serveur
 * tourne : active dès que l'un des deux l'est.
 */
export default function WarningsSection({
  config,
  update,
  loading,
}: ScheduleForm) {
  const { t } = useTranslation();
  const disabled = !config.enabled && !config.checkUpdates;

  return (
    <Section label={t("schedule.sections.warnings")} loading={loading}>
      <ChipListField
        label={t("schedule.warnings.label")}
        values={config.warnings}
        format={(minutes) => String(minutes)}
        onRemove={(minutes) =>
          update({
            warnings: config.warnings.filter((item) => item !== minutes),
          })
        }
        helper={
          config.warnings.length === 0
            ? t("schedule.warnings.none")
            : t("schedule.warnings.helper")
        }
        disabled={disabled}
        addButton={
          <AddValueButton
            label={t("schedule.add")}
            initial={firstFreeDelay(config.warnings)}
            disabled={disabled}
            errorOf={(minutes) =>
              !isIntegerInRange(minutes, 1, MAX_WARNING_MINUTES)
                ? t("schedule.warnings.range", { max: MAX_WARNING_MINUTES })
                : config.warnings.includes(minutes)
                  ? t("schedule.alreadyListed")
                  : null
            }
            renderField={(minutes, setMinutes) => (
              <TextField
                label={t("schedule.warnings.newDelay")}
                type="number"
                size="small"
                autoFocus
                value={integerInputValue(minutes)}
                onChange={(event) =>
                  setMinutes(parseIntegerInput(event.target.value))
                }
                slotProps={{ htmlInput: { min: 1, max: MAX_WARNING_MINUTES } }}
                sx={{ maxWidth: 200 }}
              />
            )}
            onAdd={(minutes) =>
              update({ warnings: sortWarnings([...config.warnings, minutes]) })
            }
          />
        }
      />
      <TextField
        label={t("schedule.message")}
        size="small"
        value={config.message}
        onChange={(event) => update({ message: event.target.value })}
        disabled={disabled}
        // Vide : le main envoie le message par défaut dans la langue de
        // Nexum, affiché ici en placeholder.
        placeholder={t("schedule.messageDefault")}
        slotProps={{ inputLabel: { shrink: true } }}
        helperText={t("schedule.messageHelper")}
        fullWidth
      />
    </Section>
  );
}
