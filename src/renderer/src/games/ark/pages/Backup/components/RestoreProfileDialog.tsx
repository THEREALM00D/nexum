import { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { formatDate } from "../../../../../utils/format";
import type { RestoreRequest } from "../hooks/useArkProfiles";

interface Props {
  request: RestoreRequest | null;
  restoring: boolean;
  onCancel: () => void;
  onConfirm: (request: RestoreRequest) => void;
}

/** Confirmation avant de remettre le profil d'un joueur à une version. */
export default function RestoreProfileDialog({
  request,
  restoring,
  onCancel,
  onConfirm,
}: Props) {
  const { t, i18n } = useTranslation();
  // Dernière demande affichée : le texte ne change pas pendant le fondu de
  // fermeture (demande déjà remise à null).
  const [shown, setShown] = useState<RestoreRequest | null>(null);
  useEffect(() => {
    if (request) setShown(request);
  }, [request]);

  const name = shown ? (shown.player.playerName ?? shown.player.eosId) : "";
  const date = shown
    ? formatDate(shown.version.createdAt, i18n.resolvedLanguage ?? "fr")
    : "";

  return (
    <Dialog
      open={!!request}
      onClose={restoring ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        {t("arkBackup.profiles.restore.title", { name })}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 1.5 }}>
          {t("arkBackup.profiles.restore.body", { date })}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {t("arkBackup.profiles.restore.backupFirst")}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={restoring}>
          {t("arkBackup.profiles.restore.cancel")}
        </Button>
        <Button
          variant="contained"
          disabled={restoring || !request}
          startIcon={restoring ? <CircularProgress size={14} /> : undefined}
          onClick={() => request && onConfirm(request)}
        >
          {t("arkBackup.profiles.restore.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
