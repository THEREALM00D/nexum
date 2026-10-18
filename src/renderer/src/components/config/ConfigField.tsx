import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import type { FieldDef } from "./types";

interface Props {
  field: FieldDef;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  /** Préfixe des clés i18n (ex: "config.fields" pour Palworld). */
  i18nPrefix: string;
}

function FieldLabel({
  label,
  description,
  minWidth,
}: {
  label: string;
  description?: string;
  minWidth?: number;
}) {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: "center", gap: 0.5, minWidth }}
      component="span"
    >
      <Typography variant="body2" component="span">
        {label}
      </Typography>
      {description && (
        <Tooltip title={description} arrow placement="top">
          <InfoOutlinedIcon
            sx={{ fontSize: 16, color: "text.secondary", cursor: "help" }}
          />
        </Tooltip>
      )}
    </Stack>
  );
}

export default function ConfigField({
  field,
  value,
  onChange,
  i18nPrefix,
}: Props) {
  const { t } = useTranslation();
  const { key, type, options, required } = field;
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
        label={<FieldLabel label={label} description={description} />}
        sx={{
          justifyContent: "space-between",
          ml: 0,
          flexDirection: "row-reverse",
        }}
      />
    );
  }

  if (type === "select") {
    return (
      <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
        <FieldLabel label={label} description={description} minWidth={200} />
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
      <FieldLabel label={label} description={description} minWidth={200} />
      <TextField
        size="small"
        type={type === "number" ? "number" : "text"}
        slotProps={{
          htmlInput: { step: type === "number" ? "any" : undefined },
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
