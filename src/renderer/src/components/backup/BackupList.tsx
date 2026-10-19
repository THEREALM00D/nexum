import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import BackupIcon from "@mui/icons-material/Backup";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import type { BackupEntry, ServerStatus } from "@shared/types";
import { formatSize, formatDate } from "../../utils/format";

interface Props {
  backups: BackupEntry[];
  creating: boolean;
  restoring: string | null;
  serverPath: string;
  status: ServerStatus;
  onCreate: () => void;
  onRestore: (entry: BackupEntry) => void;
  onDelete: (entry: BackupEntry) => void;
}

export default function BackupList({
  backups,
  creating,
  restoring,
  serverPath,
  status,
  onCreate,
  onRestore,
  onDelete,
}: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "fr";

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Typography variant="subtitle2">
          {t("backup.list.title", { count: backups.length })}
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={creating ? <CircularProgress size={14} /> : <BackupIcon />}
          disabled={!serverPath || creating}
          onClick={onCreate}
        >
          {creating ? t("backup.list.creating") : t("backup.list.create")}
        </Button>
      </Stack>
      <Divider sx={{ mb: 1 }} />
      {backups.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t("backup.list.none")}
        </Typography>
      ) : (
        <Stack spacing={1}>
          {backups.map((b) => (
            <Box
              key={b.path}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 0.75,
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {b.name}
                  </Typography>
                  {b.beforeUpdate && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={t("backup.list.beforeUpdate")}
                    />
                  )}
                </Stack>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {formatDate(b.createdAt, locale)} — {formatSize(b.size)}
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: "center" }}
              >
                <Tooltip title={t("backup.list.restoreTooltip")}>
                  <span>
                    <IconButton
                      size="small"
                      color="primary"
                      disabled={status === "running" || restoring !== null}
                      onClick={() => onRestore(b)}
                    >
                      {restoring === b.path ? (
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
                    onClick={() => onDelete(b)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
