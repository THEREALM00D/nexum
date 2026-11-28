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
import LoadingSkeleton from "../../common/LoadingSkeleton";
import DiffView from "./DiffView";

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

/**
 * Différences entre une copie et les fichiers d'aujourd'hui. Seuls les
 * fichiers modifiés (ou trop gros pour être comparés) ont un bouton :
 * Valheim peut avoir des dizaines de `.cfg` de mods inchangés.
 */
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
    // Réponse d'une copie qui n'est plus affichée : ignorée.
    let stale = false;
    setShown(backup);
    setFiles(null);
    setFile("");
    window.api.configBackup
      .diff(serverId, backup.id)
      .then((result) => {
        if (!stale) setFiles(result);
      })
      .catch((error) => {
        if (stale) return;
        notify(errorMessage(t, error));
        onClose();
      });
    return () => {
      stale = true;
    };
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
  const changed = diffs.filter((entry) => entry.tooLarge || entry.changes > 0);
  const hidden = diffs.length - changed.length;
  // Premier fichier modifié d'après le diff (pas le texte brut : une fin de
  // ligne changée n'est pas une différence).
  const selected =
    changed.find((entry) => entry.file === file) ?? changed[0] ?? null;

  return (
    <Dialog open={!!backup} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("configBackup.diff.title")}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {shown &&
              t("configBackup.diff.subtitle", {
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
              {changed.length > 0 && (
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={selected?.file ?? ""}
                  onChange={(_, next: string | null) => next && setFile(next)}
                  aria-label={t("configBackup.diff.file")}
                  sx={{ flexWrap: "wrap" }}
                >
                  {changed.map((entry) => (
                    <ToggleButton
                      key={entry.file}
                      value={entry.file}
                      sx={{ textTransform: "none" }}
                    >
                      {entry.tooLarge
                        ? t("configBackup.diff.fileTooLarge", {
                            file: entry.file,
                          })
                        : t("configBackup.diff.fileChanges", {
                            file: entry.file,
                            count: entry.changes,
                          })}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}
              {!selected ? (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("configBackup.diff.identical")}
                </Typography>
              ) : selected.tooLarge ? (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("configBackup.diff.tooLarge")}
                </Typography>
              ) : (
                <DiffView lines={selected.lines} />
              )}
              {hidden > 0 && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {t("configBackup.diff.hidden", { count: hidden })}
                </Typography>
              )}
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {t("configBackup.diff.legend")}
              </Typography>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t("configBackup.diff.close")}
        </Button>
        <Button
          variant="contained"
          disabled={!canRestore || busy || !shown}
          onClick={() => shown && onRestore(shown)}
        >
          {t("configBackup.diff.restore")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
