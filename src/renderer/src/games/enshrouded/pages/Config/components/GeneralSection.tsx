import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { EnshroudedSettings } from "@shared/types";
import Section from "../../../../../components/common/Section";
import CheckboxField from "../../../../../components/common/CheckboxField";

export interface SectionProps {
  config: EnshroudedSettings;
  loading: boolean;
  onChange: (patch: Partial<EnshroudedSettings>) => void;
}

const VOICE_MODES = ["Proximity", "Global"];

export default function GeneralSection({
  config,
  onChange,
  loading,
}: SectionProps) {
  const { t } = useTranslation();
  return (
    <Section label={t("enshroudedConfig.sections.general")} loading={loading}>
      <TextField
        label={t("enshroudedConfig.fields.name.label")}
        helperText={t("enshroudedConfig.fields.name.description")}
        value={config.name}
        onChange={(e) => onChange({ name: e.target.value })}
        size="small"
        fullWidth
      />
      <TextField
        label={t("enshroudedConfig.fields.slotCount.label")}
        helperText={t("enshroudedConfig.fields.slotCount.description")}
        type="number"
        slotProps={{ htmlInput: { min: 1, max: 16, step: 1 } }}
        value={config.slotCount}
        onChange={(e) => onChange({ slotCount: Number(e.target.value) })}
        size="small"
        fullWidth
      />
      <CheckboxField
        label={t("enshroudedConfig.fields.enableTextChat.label")}
        helper={t("enshroudedConfig.fields.enableTextChat.description")}
        checked={config.enableTextChat}
        onChange={(enableTextChat) => onChange({ enableTextChat })}
      />
      <CheckboxField
        label={t("enshroudedConfig.fields.enableVoiceChat.label")}
        helper={t("enshroudedConfig.fields.enableVoiceChat.description")}
        checked={config.enableVoiceChat}
        onChange={(enableVoiceChat) => onChange({ enableVoiceChat })}
      />
      <FormControl size="small" sx={{ maxWidth: 320 }}>
        <InputLabel>
          {t("enshroudedConfig.fields.voiceChatMode.label")}
        </InputLabel>
        <Select
          label={t("enshroudedConfig.fields.voiceChatMode.label")}
          value={config.voiceChatMode}
          disabled={!config.enableVoiceChat}
          onChange={(e) => onChange({ voiceChatMode: e.target.value })}
        >
          {VOICE_MODES.map((mode) => (
            <MenuItem key={mode} value={mode}>
              {t(`enshroudedConfig.options.${mode}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Section>
  );
}
