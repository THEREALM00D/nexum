import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { FieldDef } from "./types";
import ConfigFieldLabel from "./ConfigFieldLabel";
import ConfigComboField from "./ConfigComboField";

interface Props {
  field: FieldDef;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  /** Préfixe des clés i18n (ex: "config.fields" pour Palworld). */
  i18nPrefix: string;
}

export default function ConfigField({
  field,
  value,
  onChange,
  i18nPrefix,
}: Props) {
  const { t } = useTranslation();
  const { key, type, options, required, min, max, step, allowCustom } = field;
  const baseLabel = t(`${i18nPrefix}.${key}.label`, { defaultValue: key });
  const label = required ? `${baseLabel} *` : baseLabel;
  const missing = !!required && String(value ?? "").trim() === "";
  const description = t(`${i18nPrefix}.${key}.description`, {
    defaultValue: "",
  });

  if (type === "boolean") {
    return (
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
        }
        label={<ConfigFieldLabel label={label} description={description} />}
        sx={{
          justifyContent: "space-between",
          ml: 0,
          flexDirection: "row-reverse",
        }}
      />
    );
  }

  if (type === "select" && allowCustom) {
    return (
      <ConfigComboField
        label={label}
        description={description}
        options={options ?? []}
        value={String(value ?? "")}
        error={missing}
        helperText={missing ? t("configPage.required") : undefined}
        onChange={onChange}
      />
    );
  }

  if (type === "select") {
    return (
      <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
        <ConfigFieldLabel
          label={label}
          description={description}
          minWidth={200}
        />
        <FormControl size="small" sx={{ flex: 1 }}>
          <InputLabel>{label}</InputLabel>
          <Select
            label={label}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          >
            {options?.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    );
  }

  return (
    <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
      <ConfigFieldLabel
        label={label}
        description={description}
        minWidth={200}
      />
      <TextField
        size="small"
        type={type === "number" ? "number" : "text"}
        slotProps={{
          htmlInput: type === "number" ? { step: step ?? "any", min, max } : {},
        }}
        value={String(value ?? "")}
        onChange={(e) =>
          onChange(type === "number" ? Number(e.target.value) : e.target.value)
        }
        error={missing}
        helperText={missing ? t("configPage.required") : undefined}
        sx={{ flex: 1 }}
      />
    </Stack>
  );
}
