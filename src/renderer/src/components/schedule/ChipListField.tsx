import { Chip, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { FONT_MONO } from "../../theme";

interface Props<T> {
  label: string;
  values: T[];
  /** Texte de la puce (« 04:00 », « 30 min »). */
  format: (value: T) => string;
  onRemove: (value: T) => void;
  /** Bouton d'ajout, en fin de rangée. */
  addButton: ReactNode;
  /** Ligne sous les puces (aide, ou erreur quand `error`). */
  helper?: string;
  error?: boolean;
  disabled?: boolean;
}

/** Liste de valeurs en puces supprimables, avec un bouton d'ajout. */
export default function ChipListField<T extends string | number>({
  label,
  values,
  format,
  onRemove,
  addButton,
  helper,
  error,
  disabled,
}: Props<T>) {
  const { t } = useTranslation();
  return (
    <Stack spacing={1}>
      <Typography
        variant="caption"
        sx={{ color: disabled ? "text.disabled" : "text.secondary" }}
      >
        {label}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ flexWrap: "wrap", alignItems: "center" }}
      >
        {values.map((value) => (
          <Chip
            key={value}
            label={format(value)}
            onDelete={() => onRemove(value)}
            disabled={disabled}
            // Seule action de la puce (Suppr. ou Retour arrière au clavier) :
            // son nom le dit.
            aria-label={t("schedule.remove", { value: format(value) })}
            sx={{ fontFamily: FONT_MONO }}
          />
        ))}
        {addButton}
      </Stack>
      {helper && (
        <Typography
          variant="caption"
          sx={{ color: error ? "error.light" : "text.secondary" }}
        >
          {helper}
        </Typography>
      )}
    </Stack>
  );
}
