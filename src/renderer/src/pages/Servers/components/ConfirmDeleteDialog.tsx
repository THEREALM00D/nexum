import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Server } from "@shared/types";

interface Props {
  server: Server | null;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation renforcée pour la suppression d'un serveur : il faut retaper
 * son nom exact pour activer le bouton — une simple boîte confirm() se
 * clique trop facilement sans lire (suppression accidentelle).
 */
export default function ConfirmDeleteDialog({
  server,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const [typed, setTyped] = useState("");

  useEffect(() => {
    setTyped("");
  }, [server]);

  const matches = !!server && typed === server.name;

  return (
    <Dialog open={!!server} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("servers.actions.delete")}</DialogTitle>
      <DialogContent>
        {server && (
          <>
            <DialogContentText sx={{ mb: 2 }}>
              {t("servers.actions.deleteConfirm", { name: server.name })}
            </DialogContentText>
            <TextField
              autoFocus
              fullWidth
              size="small"
              label={t("servers.actions.deleteTypeToConfirm", {
                name: server.name,
              })}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && matches && onConfirm()}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button
          color="error"
          variant="contained"
          disabled={!matches}
          onClick={onConfirm}
        >
          {t("servers.actions.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
