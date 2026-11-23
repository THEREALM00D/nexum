import { Button, InputAdornment, Stack, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";

interface Props {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  /** Entrée ou bouton Rechercher. */
  onSubmit: () => void;
  /** Échap ou bouton Effacer. */
  onClear: () => void;
  /** Largeur max du champ (Valheim : 320 px, à côté du choix du registre). */
  fieldMaxWidth?: number;
}

// Recherche de l'onglet Parcourir (mods Valheim et ARK) : soumise à Entrée
// ou au bouton, pas à la frappe (un appel réseau par recherche).
export default function BrowseSearchField({
  value,
  placeholder,
  onChange,
  onSubmit,
  onClear,
  fieldMaxWidth,
}: Props) {
  const { t } = useTranslation();

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: "flex-start", flex: "1 1 320px" }}
    >
      <TextField
        size="small"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSubmit();
          if (event.key === "Escape") onClear();
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ flex: 1, maxWidth: fieldMaxWidth }}
      />
      <Button
        size="small"
        variant="outlined"
        onClick={onSubmit}
        sx={{ height: 40 }}
      >
        {t("modBrowse.searchButton")}
      </Button>
      {value && (
        <Button size="small" onClick={onClear} sx={{ height: 40 }}>
          {t("modBrowse.clear")}
        </Button>
      )}
    </Stack>
  );
}
