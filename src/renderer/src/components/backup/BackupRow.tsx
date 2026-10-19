import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import type { BackupEntry } from "@shared/types";
import { formatSize, formatDate } from "../../utils/format";

interface Props {
  entry: BackupEntry;
  /** Restauration de CETTE sauvegarde en cours. */
  restoring: boolean;
  /** Restauration impossible : serveur lancé ou autre restauration en cours. */
  restoreDisabled: boolean;
  onRestore: (entry: BackupEntry) => void;
  onDelete: (entry: BackupEntry) => void;
}

/** Une sauvegarde de la liste : nom, date, taille, restaurer / supprimer. */
export default function BackupRow({
  entry,
  restoring,
  restoreDisabled,
  onRestore,
  onDelete,
}: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "fr";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.75,
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {entry.name}
          </Typography>
          {entry.beforeUpdate && (
            <Chip
              size="small"
              variant="outlined"
              label={t("backup.list.beforeUpdate")}
            />
          )}
        </Stack>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {formatDate(entry.createdAt, locale)} — {formatSize(entry.size)}
        </Typography>
      </Box>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
        <Tooltip title={t("backup.list.restoreTooltip")}>
          <span>
            <IconButton
              size="small"
              color="primary"
              disabled={restoreDisabled}
              onClick={() => onRestore(entry)}
            >
              {restoring ? (
                <CircularProgress size={18} />
              ) : (
                <RestoreIcon fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t("backup.list.deleteTooltip")}>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(entry)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}
