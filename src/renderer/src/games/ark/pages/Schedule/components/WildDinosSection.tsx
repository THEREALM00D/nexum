import { Box, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { WildDinosConfig } from "@shared/types";
import Section from "../../../../../components/common/Section";
import SwitchField from "../../../../../components/common/SwitchField";
import type { ScheduleForm } from "../../../../../components/schedule/useRestartSchedule";
import {
  integerInputValue,
  isIntegerInRange,
  parseIntegerInput,
} from "../../../../../components/schedule/integerInput";

/**
 * Carte « Créatures sauvages » de la Planification ARK : `DestroyWildDinos`
 * par RCON après chaque démarrage et/ou toutes les N heures.
 */
export default function WildDinosSection({
  config,
  update,
  loading,
}: ScheduleForm) {
  const { t } = useTranslation();
  const { wildDinos } = config;
  const change = (patch: Partial<WildDinosConfig>) =>
    update({ wildDinos: { ...wildDinos, ...patch } });

  return (
    <Section label={t("arkSchedule.wildDinos.title")} loading={loading}>
      <SwitchField
        checked={wildDinos.afterStart}
        onChange={(afterStart) => change({ afterStart })}
        label={t("arkSchedule.wildDinos.afterStart")}
        helper={t("arkSchedule.wildDinos.helper")}
      />
      <SwitchField
        checked={wildDinos.repeat}
        onChange={(repeat) => change({ repeat })}
        label={t("arkSchedule.wildDinos.repeat")}
      />
      {/* En retrait sous l'interrupteur (largeur du Switch) ; un `ml` serait
          remis à 0 par la Stack de la carte. */}
      <Box sx={{ pl: 6.5 }}>
        <TextField
          label={t("arkSchedule.wildDinos.everyHours")}
          type="number"
          size="small"
          value={integerInputValue(wildDinos.everyHours)}
          onChange={(event) =>
            change({ everyHours: parseIntegerInput(event.target.value) })
          }
          error={
            wildDinos.repeat && !isIntegerInRange(wildDinos.everyHours, 1, 168)
          }
          disabled={!wildDinos.repeat}
          slotProps={{ htmlInput: { min: 1, max: 168 } }}
          sx={{ width: 200 }}
        />
      </Box>
    </Section>
  );
}
