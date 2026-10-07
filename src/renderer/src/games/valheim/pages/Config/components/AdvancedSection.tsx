import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ValheimLaunchConfig } from "@shared/types";
import Section from "./Section";

export default function AdvancedSection({
  config,
  onChange,
}: {
  config: ValheimLaunchConfig;
  onChange: (patch: Partial<ValheimLaunchConfig>) => void;
}) {
  const { t } = useTranslation();
  return (
    <Section label={t("valheimConfig.sections.advanced")}>
      <TextField
        label={t("valheimConfig.fields.logFile.label")}
        helperText={t("valheimConfig.fields.logFile.description")}
        value={config.logFile}
        onChange={(e) => onChange({ logFile: e.target.value })}
        // Rempli, Valheim n'envoie plus rien à Nexum : avertissement visible.
        slotProps={{
          formHelperText: {
            sx: config.logFile ? { color: "warning.main" } : undefined,
          },
        }}
        size="small"
        fullWidth
      />
      <TextField
        label={t("valheimConfig.fields.customArgs.label")}
        helperText={t("valheimConfig.fields.customArgs.description")}
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
