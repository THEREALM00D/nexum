import { IconButton, Stack, TextField, Tooltip } from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: ReactNode;
  error?: boolean;
  /** Fichier (sélecteur de fichier) plutôt que dossier. */
  file?: boolean;
}

// Champ de chemin + bouton Parcourir (dialogue natif de dossier ou de fichier).
export default function FolderField({
  label,
  value,
  onChange,
  helper,
  error,
  file,
}: Props) {
  const { t } = useTranslation();
  const browse = async () => {
    const picked = file
      ? await window.api.dialog.selectFile(undefined, value || undefined)
      : await window.api.dialog.selectFolder();
    if (picked) onChange(picked);
  };

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
      <TextField
        label={label}
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        helperText={helper}
        error={error}
        fullWidth
      />
      <Tooltip title={t("transfer.browse")}>
        <IconButton
          onClick={browse}
          sx={{ mt: 0.5 }}
          aria-label={t("transfer.browse")}
        >
          <FolderOpenIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
