import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ValheimLaunchConfig } from "@shared/types";
import Section from "./Section";

export default function GeneralSection({
  config,
  onChange,
  loading,
}: {
  config: ValheimLaunchConfig;
  loading: boolean;
  onChange: (patch: Partial<ValheimLaunchConfig>) => void;
}) {
  const { t } = useTranslation();
  // Valheim refuse de démarrer (silencieusement, sans erreur claire dans les
  // logs) si un mot de passe est défini mais fait moins de 5 caractères.
  const passwordTooShort =
    config.password.length > 0 && config.password.length < 5;
  return (
    <Section label={t("valheimConfig.sections.general")} loading={loading}>
      <TextField
        label={t("valheimConfig.fields.name.label")}
        helperText={t("valheimConfig.fields.name.description")}
        value={config.name}
        onChange={(e) => onChange({ name: e.target.value })}
        size="small"
        fullWidth
      />
      <TextField
        label={t("valheimConfig.fields.password.label")}
        helperText={
          passwordTooShort
            ? t("valheimConfig.fields.password.tooShort")
            : t("valheimConfig.fields.password.description")
        }
        error={passwordTooShort}
        value={config.password}
        onChange={(e) => onChange({ password: e.target.value })}
        size="small"
        fullWidth
        type="password"
      />
    </Section>
  );
}
