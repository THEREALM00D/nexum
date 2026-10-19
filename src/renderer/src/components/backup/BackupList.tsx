import {
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import BackupIcon from "@mui/icons-material/Backup";
import { useTranslation } from "react-i18next";
import type { BackupEntry, ServerStatus } from "@shared/types";
import ScrollPanel from "../common/ScrollPanel";
import LoadingSkeleton, { skeletonRows } from "../common/LoadingSkeleton";
import BackupRow from "./BackupRow";

// Ligne d'exemple des skeletons (forme d'une vraie sauvegarde, jamais affichée)
const PLACEHOLDER: BackupEntry = {
  name: "backup-2026-01-01_00-00-00.zip",
  path: "",
  size: 20_000_000,
  createdAt: 0,
  beforeUpdate: false,
};

interface Props {
  backups: BackupEntry[];
  /** Liste pas encore lue : titre et lignes en skeleton. */
  loading: boolean;
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
  loading,
  creating,
  restoring,
  serverPath,
  status,
  onCreate,
  onRestore,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const noop = () => {};

  return (
    <ScrollPanel
      padding={2.5}
      grow={false}
      minHeight={160}
      header={
        <>
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <LoadingSkeleton loading={loading}>
              <Typography variant="subtitle2">
                {t("backup.list.title", { count: backups.length })}
              </Typography>
            </LoadingSkeleton>
            <Button
              variant="contained"
              size="small"
              startIcon={
                creating ? <CircularProgress size={14} /> : <BackupIcon />
              }
              disabled={!serverPath || creating}
              onClick={onCreate}
            >
              {creating ? t("backup.list.creating") : t("backup.list.create")}
            </Button>
          </Stack>
          <Divider />
        </>
      }
    >
      {loading ? (
        <Stack spacing={1}>
          {skeletonRows(
            <BackupRow
              entry={PLACEHOLDER}
              restoring={false}
              restoreDisabled
              onRestore={noop}
              onDelete={noop}
            />,
          )}
        </Stack>
      ) : backups.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t("backup.list.none")}
        </Typography>
      ) : (
        <Stack spacing={1}>
          {backups.map((b) => (
            <BackupRow
              key={b.path}
              entry={b}
              restoring={restoring === b.path}
              restoreDisabled={status === "running" || restoring !== null}
              onRestore={onRestore}
              onDelete={onDelete}
            />
          ))}
        </Stack>
      )}
    </ScrollPanel>
  );
}
