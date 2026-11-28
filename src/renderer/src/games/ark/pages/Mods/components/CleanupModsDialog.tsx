import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ArkModsCleanup } from "@shared/types";
import { FONT_MONO } from "../../../../../theme";
import { useFormatSize } from "../../../../../hooks/useFormatSize";

interface Props {
  open: boolean;
  /** null : tailles en cours de calcul. */
  preview: ArkModsCleanup | null;
  cleaning: boolean;
  canClean: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Une ligne : ce qui part, son explication et sa taille. */
function CleanupLine({
  title,
  detail,
  size,
}: {
  title: string;
  detail: string;
  size: string;
}) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2">{title}</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {detail}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ fontFamily: FONT_MONO }}>
        {size}
      </Typography>
    </Stack>
  );
}

/** « Nettoyer le dossier des mods » : mods hors liste et restes de `.temp`. */
export default function CleanupModsDialog({
  open,
  preview,
  cleaning,
  canClean,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const formatSize = useFormatSize();
  const modsSize = (preview?.mods ?? []).reduce(
    (sum, mod) => sum + mod.size,
    0,
  );
  const names = (preview?.mods ?? [])
    .map((mod) => mod.name || t("arkMods.list.unknownName", { id: mod.id }))
    .join(", ");

  return (
    <Dialog
      open={open}
      onClose={cleaning ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t("arkMods.cleanup.title")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {!preview ? (
            <Skeleton variant="rounded" height={48} />
          ) : (
            <>
              {preview.mods.length > 0 && (
                <CleanupLine
                  title={t("arkMods.cleanup.notListed", {
                    count: preview.mods.length,
                  })}
                  detail={t("arkMods.cleanup.notListedHint", { names })}
                  size={formatSize(modsSize)}
                />
              )}
              {preview.tempSize > 0 && (
                <CleanupLine
                  title={t("arkMods.cleanup.temp")}
                  detail={t("arkMods.cleanup.tempHint")}
                  size={formatSize(preview.tempSize)}
                />
              )}
              {preview.total === 0 && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("arkMods.cleanup.nothing")}
                </Typography>
              )}
            </>
          )}
          <Alert severity="info">{t("arkMods.cleanup.safe")}</Alert>
          {!canClean && (
            <Alert severity="warning">{t("arkMods.cleanup.stopFirst")}</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={cleaning} color="inherit">
          {t("arkMods.cleanup.cancel")}
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={!preview || preview.total === 0 || !canClean || cleaning}
          startIcon={cleaning ? <CircularProgress size={14} /> : undefined}
          onClick={onConfirm}
        >
          {t("arkMods.cleanup.confirm", {
            size: formatSize(preview?.total ?? 0),
          })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
