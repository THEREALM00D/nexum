import { useEffect, useState } from "react";
import { Paper, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ArkProfileBackupConfig } from "@shared/types";
import { PROFILE_KEEP_RANGE } from "@shared/arkProfiles";
import BackupIntervalSelect from "../../../../../components/backup/BackupIntervalSelect";
import SectionTitle from "../../../../../components/common/SectionTitle";
import SwitchField from "../../../../../components/common/SwitchField";
import { SkeletonChildren } from "../../../../../components/common/LoadingSkeleton";
import {
  integerInputValue,
  isIntegerInRange,
  parseIntegerInput,
} from "../../../../../components/schedule/integerInput";

interface Props {
  config: ArkProfileBackupConfig;
  loading: boolean;
  /** Réglages illisibles : rien n'est modifiable. */
  disabled: boolean;
  onChange: (patch: Partial<ArkProfileBackupConfig>) => void;
}

/** Carte Réglages de l'onglet Profils des joueurs. */
export default function ProfileBackupSettings({
  config,
  loading,
  disabled,
  onChange,
}: Props) {
  const { t } = useTranslation();
  // Saisie gardée telle quelle (champ vidé = NaN), enregistrée en quittant
  // le champ ou sur Entrée : à chaque frappe, « 2 » était enregistré en
  // tapant 25, et une sauvegarde à ce moment supprimait des versions.
  const [keep, setKeep] = useState(config.keep);
  useEffect(() => setKeep(config.keep), [config.keep]);
  const keepValid = isIntegerInRange(
    keep,
    PROFILE_KEEP_RANGE.min,
    PROFILE_KEEP_RANGE.max,
  );
  const saveKeep = () => {
    if (keepValid && keep !== config.keep) onChange({ keep });
  };

  return (
    <Paper sx={{ p: 2.5 }}>
      <SectionTitle sx={{ mb: 2 }}>
        {t("arkBackup.profiles.settings.title")}
      </SectionTitle>
      <Stack spacing={2.5}>
        <SkeletonChildren loading={loading}>
          <Stack spacing={0.5}>
            <BackupIntervalSelect
              label={t("arkBackup.profiles.settings.interval")}
              value={config.intervalMinutes}
              disabled={disabled}
              onChange={(intervalMinutes) => onChange({ intervalMinutes })}
            />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t("arkBackup.profiles.settings.intervalHelper")}
            </Typography>
          </Stack>

          <TextField
            label={t("arkBackup.profiles.settings.keep")}
            size="small"
            type="number"
            value={integerInputValue(keep)}
            disabled={disabled}
            onChange={(event) => setKeep(parseIntegerInput(event.target.value))}
            onBlur={saveKeep}
            onKeyDown={(event) => {
              if (event.key === "Enter") saveKeep();
            }}
            error={!keepValid}
            helperText={t("arkBackup.profiles.settings.keepHelper", {
              min: PROFILE_KEEP_RANGE.min,
              max: PROFILE_KEEP_RANGE.max,
            })}
            sx={{ maxWidth: 280 }}
            slotProps={{
              htmlInput: {
                min: PROFILE_KEEP_RANGE.min,
                max: PROFILE_KEEP_RANGE.max,
              },
            }}
          />

          <SwitchField
            checked={config.announce}
            disabled={disabled}
            onChange={(announce) => onChange({ announce })}
            label={t("arkBackup.profiles.settings.announce")}
            helper={t("arkBackup.profiles.settings.announceHelper")}
          />
        </SkeletonChildren>
      </Stack>
    </Paper>
  );
}
