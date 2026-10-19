import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ValheimLaunchConfig } from "@shared/types";
import Section from "./Section";

export default function NetworkSection({
  config,
  onChange,
  loading,
}: {
  config: ValheimLaunchConfig;
  loading: boolean;
  onChange: (patch: Partial<ValheimLaunchConfig>) => void;
}) {
  const { t } = useTranslation();
  return (
    <Section label={t("valheimConfig.sections.network")} loading={loading}>
      <TextField
        label={t("valheimConfig.fields.port.label")}
        helperText={t("valheimConfig.fields.port.description")}
        value={config.port}
        onChange={(e) => onChange({ port: Number(e.target.value) || 2456 })}
        size="small"
        type="number"
        sx={{ width: 160 }}
        slotProps={{ htmlInput: { min: 1024, max: 65534 } }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={config.public}
            onChange={(e) => onChange({ public: e.target.checked })}
            size="small"
          />
        }
        label={
          <Box>
            <Typography variant="body2">
              {t("valheimConfig.fields.public.label")}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t("valheimConfig.fields.public.description")}
            </Typography>
          </Box>
        }
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={config.crossplay}
            onChange={(e) => onChange({ crossplay: e.target.checked })}
            size="small"
          />
        }
        label={
          <Box>
            <Typography variant="body2">
              {t("valheimConfig.fields.crossplay.label")}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t("valheimConfig.fields.crossplay.description")}
            </Typography>
          </Box>
        }
      />
      <TextField
        label={t("valheimConfig.fields.odinEyeUrl.label")}
        helperText={t("valheimConfig.fields.odinEyeUrl.description")}
        value={config.odinEyeUrl}
        onChange={(e) => onChange({ odinEyeUrl: e.target.value })}
        size="small"
        placeholder="http://127.0.0.1:21618"
        fullWidth
      />
    </Section>
  );
}
