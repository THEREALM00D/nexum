import { useState } from "react";
import { Autocomplete, Stack, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { SelectOption } from "./types";
import ConfigFieldLabel from "./ConfigFieldLabel";

interface Props {
  label: string;
  description: string;
  options: SelectOption[];
  value: string;
  /** Champ requis vide. */
  error: boolean;
  helperText?: string;
  onChange: (value: string) => void;
}

// Liste qui accepte aussi une valeur tapée (`allowCustom`) : carte moddée
// d'ARK. La valeur reste brute (nom de la ligne de commande) ; un libellé
// traduit tapé en entier redonne la valeur de son option.
export default function ConfigComboField({
  label,
  description,
  options,
  value,
  error,
  helperText,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const labelOf = (raw: string) => {
    const option = options.find((candidate) => candidate.value === raw);
    return option ? t(option.labelKey) : raw;
  };
  const valueOf = (text: string) =>
    options.find((option) => t(option.labelKey) === text)?.value ?? text;

  // ⚠️ Texte tapé gardé tel quel. Avec une valeur contrôlée, MUI remplaçait
  // le texte par le libellé à chaque changement : taper « Ragnarok_WP_X »
  // affichait « Ragnarok » après « _WP » et la valeur devenait Ragnarok_X.
  // D'où value={null} sur l'Autocomplete et ce texte local, qui ne suit la
  // valeur que si elle change de l'extérieur (relecture du fichier).
  const [text, setText] = useState(() => labelOf(value));
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    if (valueOf(text) !== value) setText(labelOf(value));
  }

  return (
    <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
      <ConfigFieldLabel
        label={label}
        description={description}
        minWidth={200}
      />
      <Autocomplete
        freeSolo
        size="small"
        options={options.map((option) => option.value)}
        // Toute la liste : le champ affiche le libellé choisi, un filtre sur
        // ce texte ne laisserait qu'une option.
        filterOptions={(all) => all}
        getOptionLabel={labelOf}
        value={null}
        inputValue={text}
        // Pas de trim ici : il empêcherait de taper un espace dans un
        // libellé (« The Island »). Le main retire les espaces au bord.
        onInputChange={(_, next) => {
          setText(next);
          onChange(valueOf(next));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            error={error}
            helperText={helperText}
          />
        )}
        sx={{ flex: 1 }}
      />
    </Stack>
  );
}
