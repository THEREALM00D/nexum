import { Button, ButtonGroup, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Section from "../../../../../components/common/Section";
import type { SectionProps } from "./GeneralSection";
import { CUSTOM_PRESET, PRESETS } from "../gameSettingsFields";

// Même présentation que les presets de modificateurs de Valheim.
export default function DifficultySection({
  config,
  onChange,
  loading,
}: SectionProps) {
  const { t } = useTranslation();
  const preset = config.gameSettingsPreset;
  return (
    <Section
      label={t("enshroudedConfig.sections.difficulty")}
      loading={loading}
    >
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("enshroudedConfig.difficulty.description")}
      </Typography>
      <Stack spacing={0.5}>
        <ButtonGroup size="small" variant="outlined" sx={{ flexWrap: "wrap" }}>
          {PRESETS.map((name) => (
            <Button
              key={name}
              variant={preset === name ? "contained" : "outlined"}
              onClick={() => onChange({ gameSettingsPreset: name })}
            >
              {t(`enshroudedConfig.difficulty.presets.${name}`)}
            </Button>
          ))}
        </ButtonGroup>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {t(
            preset === CUSTOM_PRESET
              ? "enshroudedConfig.difficulty.customHint"
              : "enshroudedConfig.difficulty.presetHint",
          )}
        </Typography>
      </Stack>
    </Section>
  );
}
