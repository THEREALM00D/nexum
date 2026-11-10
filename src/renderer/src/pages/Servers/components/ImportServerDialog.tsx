import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type {
  ServerArchiveImportChoice,
  ServerArchivePreview,
  TransferServerPaths,
} from "@shared/types";
import { useServer } from "../../../context/ServerContext";
import CheckboxField from "../../../components/common/CheckboxField";
import ServerPathsFields from "../../../components/transfer/ServerPathsFields";
import { isUsedPath } from "../../../components/transfer/samePath";

interface Props {
  preview: ServerArchivePreview | null;
  onCancel: () => void;
  onImport: (choice: ServerArchiveImportChoice) => Promise<void>;
}

export default function ImportServerDialog({
  preview,
  onCancel,
  onImport,
}: Props) {
  const { t } = useTranslation();
  const { state } = useServer();
  const [name, setName] = useState("");
  const [paths, setPaths] = useState<TransferServerPaths | null>(null);
  const [conflict, setConflict] = useState(false);
  const [replaceWorld, setReplaceWorld] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!preview) return;
    setName(preview.name);
    setPaths(preview.paths);
    setReplaceWorld(false);
  }, [preview]);

  // Monde du même nom déjà dans le dossier des mondes cible ?
  useEffect(() => {
    if (!preview?.hasWorld || !paths?.path.trim()) {
      setConflict(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      window.api.transfer
        .serverWorldConflict(preview.token, paths)
        .then((c) => !cancelled && setConflict(c))
        .catch(() => !cancelled && setConflict(false));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [preview, paths]);

  if (!preview || !paths) return null;

  const submit = async () => {
    setBusy(true);
    try {
      await onImport({
        token: preview.token,
        name: name.trim(),
        paths,
        replaceWorld: conflict && replaceWorld,
      });
    } finally {
      setBusy(false);
    }
  };

  const contents = [
    preview.hasWorld
      ? t("servers.transfer.world")
      : t("servers.transfer.noWorld"),
    t("servers.transfer.configFiles", { count: preview.configFiles }),
    ...(preview.mods > 0
      ? [t("servers.transfer.mods", { count: preview.mods })]
      : []),
  ].join(" · ");

  return (
    <Dialog open onClose={busy ? undefined : onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{t("servers.transfer.importTitle")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <div>
            <Typography variant="body2">
              {t("servers.transfer.contents", {
                game: t(`servers.games.${preview.gameType}`),
              })}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {contents}
              {" · "}
              {t("transfer.exportedAt", {
                date: new Date(preview.exportedAt).toLocaleString(),
              })}
            </Typography>
          </div>
          {!preview.includesPasswords && (
            <Alert severity="info">{t("transfer.passwords.missing")}</Alert>
          )}
          <TextField
            label={t("servers.transfer.name")}
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <ServerPathsFields
            gameType={preview.gameType}
            paths={paths}
            original={preview.paths}
            onChange={setPaths}
            duplicate={isUsedPath(state.servers, paths.path)}
          />
          {conflict && (
            <CheckboxField
              checked={replaceWorld}
              onChange={setReplaceWorld}
              label={t("servers.transfer.replaceWorld")}
              helper={t("servers.transfer.replaceWorldHelper")}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={busy}>
          {t("transfer.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={busy || !name.trim() || !paths.path.trim()}
          startIcon={busy ? <CircularProgress size={16} /> : undefined}
        >
          {t("transfer.import")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
