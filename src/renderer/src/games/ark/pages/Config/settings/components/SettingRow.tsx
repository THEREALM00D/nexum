import { memo } from "react";
import {
  Box,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useTranslation } from "react-i18next";
import type { ArkSettingType } from "@shared/arkSettings";
import ConfigFieldLabel from "../../../../../../components/config/ConfigFieldLabel";

export interface SettingRowProps {
  id: string;
  label: string;
  description: string;
  type: ArkSettingType;
  /** Valeur du jeu quand le réglage n'est pas écrit ("" = inconnue). */
  defaultValue: string;
  options?: string[];
  min?: number;
  max?: number;
  /** Valeur affichée ("" = valeur par défaut, pas écrite). */
  value: string;
  /** Écrit dans le fichier (ou modifié) : bouton de retour au défaut. */
  overridden: boolean;
  edited: boolean;
  disabled: boolean;
  onChange: (id: string, value: string | null) => void;
}

const isTrue = (value: string) => value.toLowerCase() === "true";

// Une ligne de l'onglet Réglages de jeu : libellé (description en
// infobulle), champ selon le type, retour à la valeur par défaut.
function SettingRow(props: SettingRowProps) {
  const { t } = useTranslation();
  const { id, type, value, defaultValue, disabled, onChange } = props;
  const defaultLabel = defaultValue
    ? t("arkSettingsUi.defaultValue", { value: defaultValue })
    : t("arkSettingsUi.defaultUnknown");
  const reset = t("arkSettingsUi.reset");

  const field = (() => {
    if (type === "bool" || type === "flag") {
      const checked = value === "" ? isTrue(defaultValue) : isTrue(value);
      return (
        <Switch
          size="small"
          checked={checked}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              id,
              event.target.checked ? "True" : type === "flag" ? null : "False",
            )
          }
          slotProps={{ input: { "aria-label": props.label } }}
        />
      );
    }
    if (type === "enum") {
      return (
        <TextField
          select
          size="small"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(id, event.target.value || null)}
          slotProps={{ select: { displayEmpty: true } }}
          sx={{ flex: 1, minWidth: 160 }}
        >
          <MenuItem value="">
            {t("arkSettingsUi.defaultOption", { value: defaultValue })}
          </MenuItem>
          {props.options?.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      );
    }
    const isNumber = type === "int" || type === "float";
    return (
      <TextField
        size="small"
        value={value}
        placeholder={defaultValue || t("arkSettingsUi.defaultUnknown")}
        disabled={disabled}
        onChange={(event) => onChange(id, event.target.value)}
        slotProps={{
          htmlInput: isNumber
            ? { inputMode: "decimal", min: props.min, max: props.max }
            : {},
        }}
        sx={{ flex: 1, minWidth: 160 }}
      />
    );
  })();

  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{ alignItems: "center", gap: 1.5, flexWrap: "wrap", py: 0.5 }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: "center", gap: 0.75, flex: "1 1 240px", minWidth: 0 }}
      >
        <Box
          aria-hidden
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            flexShrink: 0,
            bgcolor: props.edited
              ? "warning.main"
              : props.overridden
                ? "primary.main"
                : "transparent",
          }}
        />
        <ConfigFieldLabel
          label={props.label}
          description={[props.description, defaultLabel]
            .filter(Boolean)
            .join(" — ")}
        />
      </Stack>
      <Stack
        direction="row"
        sx={{ alignItems: "center", gap: 0.5, flex: "1 1 220px" }}
      >
        {field}
        <Tooltip title={reset}>
          <span>
            <IconButton
              size="small"
              aria-label={reset}
              disabled={disabled || !props.overridden}
              onClick={() => onChange(id, null)}
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

export default memo(SettingRow);
