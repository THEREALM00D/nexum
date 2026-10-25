import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import Section from "../../../../../components/common/Section";
import InstallDirWarning from "../../../../../components/common/InstallDirWarning";
import type { SectionProps } from "./GeneralSection";

export default function AdvancedSection({
  config,
  onChange,
  loading,
}: SectionProps) {
  const { t } = useTranslation();
  return (
    <Section label={t("enshroudedConfig.sections.advanced")} loading={loading}>
      <TextField
        label={t("enshroudedConfig.fields.saveDirectory.label")}
        helperText={t("enshroudedConfig.fields.saveDirectory.description")}
        value={config.saveDirectory}
        onChange={(e) => onChange({ saveDirectory: e.target.value })}
        size="small"
        fullWidth
      />
      <InstallDirWarning path={config.saveDirectory} />
      <TextField
        label={t("enshroudedConfig.fields.logDirectory.label")}
        helperText={t("enshroudedConfig.fields.logDirectory.description")}
        value={config.logDirectory}
        onChange={(e) => onChange({ logDirectory: e.target.value })}
        size="small"
        fullWidth
      />
      <TextField
        label={t("enshroudedConfig.fields.customArgs.label")}
        helperText={t("enshroudedConfig.fields.customArgs.description")}
        value={config.customArgs}
        onChange={(e) => onChange({ customArgs: e.target.value })}
        size="small"
        fullWidth
        multiline
        rows={2}
      />
    </Section>
  );
}
