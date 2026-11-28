import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ConfigBackupEntry, ConfigFileDiff } from "@shared/types";
import { countChanges, diffLines } from "@shared/lineDiff";
import { formatDate } from "../../../utils/format";
import { errorMessage } from "../../../utils/appErrorMessage";
import { useNotification } from "../../../context/NotificationContext";
import DiffView from "./DiffView";
import LoadingSkeleton from "../../common/LoadingSkeleton";

// Lignes d'exemple du skeleton (même hauteur qu'un vrai bloc de différences).
const PLACEHOLDER = diffLines(
  "[ServerSettings]\nXPMultiplier=2.0\nTamingSpeedMultiplier=5.0",
  "[ServerSettings]\nXPMultiplier=3.0\nTamingSpeedMultiplier=5.0",
);

interface Props {
  serverId: string | null;
  backup: ConfigBackupEntry | null;
  canRestore: boolean;
  busy: boolean;
  onClose: () => void;
  onRestore: (backup: ConfigBackupEntry) => void;
}

/** Différences entre une copie et les fichiers d'aujourd'hui, fichier par fichier. */
export default function ConfigDiffDialog({
  serverId,
  backup,
  canRestore,
  busy,
  onClose,
  onRestore,
}: Props) {
  const { t, i18n } = useTranslation();
  const { notify } = useNotification();
  const [files, setFiles] = useState<ConfigFileDiff[] | null>(null);
  const [file, setFile] = useState("");
  // Dernière copie affichée : le contenu reste pendant le fondu de fermeture.
  const [shown, setShown] = useState<ConfigBackupEntry | null>(null);

  useEffect(() => {
    if (!backup || !serverId) return;
    setShown(backup);
    setFiles(null);
    window.api.configBackup
      .diff(serverId, backup.id)
      .then((result) => {
        setFiles(result);
        // Premier fichier qui a changé, sinon le premier.
        const changed = result.find((entry) => entry.backup !== entry.current);
        setFile((changed ?? result[0])?.file ?? "");
      })
      .catch((error) => {
        notify(errorMessage(t, error));
        onClose();
      });
  }, [backup, serverId]); // eslint-disable-line react-hooks/exhaustive-deps

  const diffs = useMemo(
    () =>
      (files ?? []).map((entry) => {
        const lines = entry.tooLarge
          ? []
          : diffLines(entry.backup, entry.current);
        return { ...entry, lines, changes: countChanges(lines) };
      }),
    [files],
  );
  const selected = diffs.find((entry) => entry.file === file);

  return (
    <Dialog open={!!backup} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("backup.configFiles.diff.title")}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {shown &&
              t("backup.configFiles.diff.subtitle", {
                date: formatDate(
                  shown.createdAt,
                  i18n.resolvedLanguage ?? "fr",
                ),
              })}
          </Typography>
          {!files ? (
            <LoadingSkeleton loading fullWidth>
              <DiffView lines={PLACEHOLDER} />
            </LoadingSkeleton>
          ) : (
            <>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={file}
                onChange={(_, next: string | null) => next && setFile(next)}
                aria-label={t("backup.configFiles.diff.file")}
                sx={{ flexWrap: "wrap" }}
              >
                {diffs.map((entry) => (
                  <ToggleButton
                    key={entry.file}
                    value={entry.file}
                    sx={{ textTransform: "none" }}
                  >
                    {t("backup.configFiles.diff.fileChanges", {
                      file: entry.file,
                      count: entry.changes,
                    })}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              {selected?.tooLarge ? (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("backup.configFiles.diff.tooLarge")}
                </Typography>
              ) : selected && selected.changes === 0 ? (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("backup.configFiles.diff.identical")}
                </Typography>
              ) : (
                selected && <DiffView lines={selected.lines} />
              )}
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {t("backup.configFiles.diff.legend")}
              </Typography>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t("backup.configFiles.diff.close")}
        </Button>
        <Button
          variant="contained"
          disabled={!canRestore || busy || !backup}
          onClick={() => backup && onRestore(backup)}
        >
          {t("backup.configFiles.diff.restore")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
