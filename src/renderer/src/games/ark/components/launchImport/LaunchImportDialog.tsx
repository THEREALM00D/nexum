import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../../context/ServerContext";
import { useNotification } from "../../../../context/NotificationContext";
import {
  appErrorMessage,
  errorMessage,
} from "../../../../utils/appErrorMessage";
import { isStopped } from "../../../../components/config/useConfigLoad";
import LaunchImportPanel from "./LaunchImportPanel";
import type { LaunchImportState } from "./useLaunchImport";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Appelé après l'application : la page relit la config. */
  onApplied: () => void;
}

/**
 * Onglet Général : reprendre la ligne de lancement de l'ancien outil pour un
 * serveur ARK déjà ajouté (dossier ajouté avant que Nexum sache la lire).
 */
export default function LaunchImportDialog({
  open,
  onClose,
  onApplied,
}: Props) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { state } = useServer();
  const serverId = state.activeServerId ?? "";
  const [importState, setImportState] = useState<LaunchImportState | null>(
    null,
  );
  const [applying, setApplying] = useState(false);
  const [pending, setPending] = useState(false);
  const running = !isStopped(state.status);

  const apply = async () => {
    if (!importState) return;
    setApplying(true);
    try {
      const result = await window.api.arkLaunchImport.apply(
        serverId,
        importState.line,
        importState.saveDirectory,
      );
      if (!result.success) {
        notify(appErrorMessage(t, result.error), "error");
        return;
      }
      notify(t("arkLaunchImport.applied"), "success");
      onApplied();
      onClose();
    } catch (error) {
      notify(errorMessage(t, error), "error");
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog
      open={open}
      // Échap et clic à côté sans effet pendant l'application (comme Annuler).
      onClose={applying ? undefined : onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{t("arkLaunchImport.openDialog")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("arkLaunchImport.dialogIntro")}
          </Typography>
          {running && (
            <Alert severity="warning">
              {t("configPage.lockedWhileRunning")}
            </Alert>
          )}
          {open && (
            <LaunchImportPanel
              serverPath={state.serverPath}
              serverId={serverId}
              onChange={setImportState}
              onPendingChange={setPending}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={applying}>
          {t("arkLaunchImport.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={() => void apply()}
          disabled={!importState || pending || applying || running}
        >
          {t("arkLaunchImport.apply")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
