import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import Section from "../../../../../components/common/Section";
import type { SectionProps } from "./GeneralSection";

export default function NetworkSection({
  config,
  onChange,
  loading,
}: SectionProps) {
  const { t } = useTranslation();
  return (
    <Section label={t("enshroudedConfig.sections.network")} loading={loading}>
      <TextField
        label={t("enshroudedConfig.fields.queryPort.label")}
        helperText={t("enshroudedConfig.fields.queryPort.description")}
        value={config.queryPort}
        onChange={(e) =>
          onChange({ queryPort: Number(e.target.value) || 15637 })
        }
        size="small"
        type="number"
        fullWidth
        slotProps={{ htmlInput: { min: 1024, max: 65535 } }}
      />
      <TextField
        label={t("enshroudedConfig.fields.ip.label")}
        helperText={t("enshroudedConfig.fields.ip.description")}
        value={config.ip}
        onChange={(e) => onChange({ ip: e.target.value })}
        size="small"
        fullWidth
      />
    </Section>
  );
}
