import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import DifferenceIcon from "@mui/icons-material/Difference";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import type { ConfigBackupEntry } from "@shared/types";
import { formatDate } from "../../../utils/format";
import { useFormatSize } from "../../../hooks/useFormatSize";

interface Props {
  backup: ConfigBackupEntry;
  /** Serveur lancé ou action en cours : pas de restauration. */
  restoreDisabled: boolean;
  disabled: boolean;
  onDiff: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

/** Une copie de la config : date, raison, fichiers modifiés, taille, actions. */
export default function ConfigBackupRow({
  backup,
  restoreDisabled,
  disabled,
  onDiff,
  onRestore,
  onDelete,
}: Props) {
  const { t, i18n } = useTranslation();
  const formatSize = useFormatSize();
  const reasonChip =
    backup.reason === "manual" || backup.reason === "interval"
      ? null
      : t(`backup.configFiles.reasons.${backup.reason}`);
  const changed = backup.changed.length > 0 ? backup.changed : backup.files;
  const diffLabel = t("backup.configFiles.list.diff");
  const restoreLabel = t("backup.configFiles.list.restore");
  const deleteLabel = t("backup.list.deleteTooltip");

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.75 }}>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatDate(backup.createdAt, i18n.resolvedLanguage ?? "fr")}
          </Typography>
          {reasonChip && (
            <Chip size="small" variant="outlined" label={reasonChip} />
          )}
        </Stack>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block" }}
          noWrap
        >
          {t("backup.configFiles.list.detail", {
            files: changed.join(", "),
            size: formatSize(backup.size),
          })}
        </Typography>
      </Box>
      <Tooltip title={diffLabel}>
        <IconButton size="small" aria-label={diffLabel} onClick={onDiff}>
          <DifferenceIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={restoreLabel}>
        <span>
          <IconButton
            size="small"
            color="primary"
            aria-label={restoreLabel}
            disabled={restoreDisabled || disabled}
            onClick={onRestore}
          >
            <RestoreIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={deleteLabel}>
        <span>
          <IconButton
            size="small"
            aria-label={deleteLabel}
            disabled={disabled}
            onClick={onDelete}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
