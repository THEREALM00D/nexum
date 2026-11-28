import { useEffect, useState } from "react";
import { Paper, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ConfigBackupSettings as Settings } from "@shared/types";
import { CONFIG_KEEP_RANGE } from "@shared/configBackup";
import BackupIntervalSelect from "../BackupIntervalSelect";
import SectionTitle from "../../common/SectionTitle";
import SwitchField from "../../common/SwitchField";
import { SkeletonChildren } from "../../common/LoadingSkeleton";
import {
  integerInputValue,
  isIntegerInRange,
  parseIntegerInput,
} from "../../schedule/integerInput";

interface Props {
  settings: Settings;
  loading: boolean;
  /** Réglages illisibles : rien n'est modifiable. */
  disabled: boolean;
  /** Fichiers sauvegardés pour ce jeu, cités dans l'aide. */
  files: string[];
  onChange: (patch: Partial<Settings>) => void;
}

/** Carte Réglages de l'onglet Configuration. */
export default function ConfigBackupSettings({
  settings,
  loading,
  disabled,
  files,
  onChange,
}: Props) {
  const { t } = useTranslation();
  // Saisie gardée telle quelle (champ vidé = NaN), enregistrée en quittant le
  // champ ou sur Entrée : à chaque frappe, une valeur intermédiaire
  // (« 2 » en tapant 25) supprimerait des copies à la prochaine rotation.
  const [keep, setKeep] = useState(settings.keep);
  useEffect(() => setKeep(settings.keep), [settings.keep]);
  const keepValid = isIntegerInRange(
    keep,
    CONFIG_KEEP_RANGE.min,
    CONFIG_KEEP_RANGE.max,
  );
  const saveKeep = () => {
    if (keepValid && keep !== settings.keep) onChange({ keep });
  };

  return (
    <Paper sx={{ p: 2.5 }}>
      <SectionTitle sx={{ mb: 2 }}>
        {t("configBackup.settings.title")}
      </SectionTitle>
      <Stack spacing={2.5}>
        <SkeletonChildren loading={loading}>
          <Stack spacing={0.5}>
            <BackupIntervalSelect
              label={t("configBackup.settings.interval")}
              value={settings.intervalMinutes}
              disabled={disabled}
              onChange={(intervalMinutes) => onChange({ intervalMinutes })}
            />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {files.length > 0
                ? t("configBackup.settings.intervalHelper", {
                    files: files.join(", "),
                  })
                : t("configBackup.settings.intervalHelperNoFiles")}
            </Typography>
          </Stack>
          <TextField
            label={t("configBackup.settings.keep")}
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
            helperText={t("configBackup.settings.keepHelper", {
              min: CONFIG_KEEP_RANGE.min,
              max: CONFIG_KEEP_RANGE.max,
            })}
            sx={{ maxWidth: 280 }}
            slotProps={{
              htmlInput: {
                min: CONFIG_KEEP_RANGE.min,
                max: CONFIG_KEEP_RANGE.max,
              },
            }}
          />
          <SwitchField
            checked={settings.beforeSave}
            disabled={disabled}
            onChange={(beforeSave) => onChange({ beforeSave })}
            label={t("configBackup.settings.beforeSave")}
            helper={t("configBackup.settings.beforeSaveHelper")}
          />
          <SwitchField
            checked={settings.beforeStart}
            disabled={disabled}
            onChange={(beforeStart) => onChange({ beforeStart })}
            label={t("configBackup.settings.beforeStart")}
            helper={t("configBackup.settings.beforeStartHelper")}
          />
        </SkeletonChildren>
      </Stack>
    </Paper>
  );
}
