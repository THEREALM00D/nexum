import { useState } from "react";
import { Button, Stack, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";

interface Props {
  disabled: boolean;
  /** Faux : build sans clé CurseForge, l'ID n'est pas vérifié à l'ajout. */
  lookupAvailable: boolean;
  /** Vrai si le mod a été ajouté : le champ est alors vidé. */
  onAdd: (id: number) => Promise<boolean>;
}

// Ajout par « Project ID » CurseForge : l'URL d'un mod contient son nom, pas
// son ID, d'où un champ numérique seulement.
export default function AddModField({
  disabled,
  lookupAvailable,
  onAdd,
}: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const id = Number(value);
  const valid = /^\d+$/.test(value) && id > 0;

  const submit = async () => {
    if (!valid || disabled) return;
    if (await onAdd(id)) setValue("");
  };

  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{ gap: 1.5, alignItems: "flex-start", flexWrap: "wrap" }}
    >
      <TextField
        size="small"
        label={t("arkMods.add.label")}
        value={value}
        onChange={(event) => setValue(event.target.value.trim())}
        onKeyDown={(event) => {
          if (event.key === "Enter") void submit();
        }}
        error={value !== "" && !valid}
        helperText={t(
          lookupAvailable ? "arkMods.add.help" : "arkMods.add.helpUnchecked",
        )}
        slotProps={{ htmlInput: { inputMode: "numeric" } }}
        sx={{ flex: "1 1 260px" }}
      />
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        disabled={!valid || disabled}
        onClick={() => void submit()}
        sx={{ mt: 0.25 }}
      >
        {t("arkMods.add.button")}
      </Button>
    </Stack>
  );
}
