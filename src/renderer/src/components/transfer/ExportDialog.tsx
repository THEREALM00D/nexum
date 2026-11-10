import { useEffect, useState, type ReactNode } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import CheckboxField from "../common/CheckboxField";

interface Props {
  open: boolean;
  title: string;
  description: string;
  /** Avertissement propre à cet export (ex. fichiers du jeu copiés tels quels). */
  extra?: ReactNode;
  onClose: () => void;
  /** Ouvre « Enregistrer sous » et écrit le fichier ; false = annulé. */
  onExport: (includePasswords: boolean) => Promise<boolean>;
}

// Dialogue commun aux deux exports (réglages, serveur) : mots de passe exclus
// par défaut, avertissement quand on les inclut.
export default function ExportDialog({
  open,
  title,
  description,
  extra,
  onClose,
  onExport,
}: Props) {
  const { t } = useTranslation();
  const [includePasswords, setIncludePasswords] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setIncludePasswords(false);
  }, [open]);

  const submit = async () => {
    setBusy(true);
    try {
      if (await onExport(includePasswords)) onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {description}
          </Typography>
          {extra}
          <CheckboxField
            checked={includePasswords}
            onChange={setIncludePasswords}
            label={t("transfer.passwords.label")}
            helper={t("transfer.passwords.helper")}
          />
          {includePasswords && (
            <Alert severity="warning">{t("transfer.passwords.warning")}</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={busy}
          startIcon={busy ? <CircularProgress size={16} /> : undefined}
        >
          {t("transfer.export")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
