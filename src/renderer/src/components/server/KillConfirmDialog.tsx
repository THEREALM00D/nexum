import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  serverName: string;
  onClose: () => void;
  onConfirm: () => void;
}

/** Confirmation avant de tuer le processus : rien n'est sauvegardé. */
export default function KillConfirmDialog({
  open,
  serverName,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("serverMenu.killTitle", { name: serverName })}
      </DialogTitle>
      <DialogContent>
        <Alert severity="error">{t("serverMenu.killWarning")}</Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("serverMenu.cancel")}</Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          {t("serverMenu.kill")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
