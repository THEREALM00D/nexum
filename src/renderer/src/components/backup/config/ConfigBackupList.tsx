import {
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import BackupIcon from "@mui/icons-material/Backup";
import { useTranslation } from "react-i18next";
import type { ConfigBackupEntry } from "@shared/types";
import ScrollPanel from "../../common/ScrollPanel";
import SectionTitle from "../../common/SectionTitle";
import LoadingSkeleton, { skeletonRows } from "../../common/LoadingSkeleton";
import ConfigBackupRow from "./ConfigBackupRow";

// Ligne d'exemple des skeletons (forme d'une vraie copie, jamais affichée).
const PLACEHOLDER: ConfigBackupEntry = {
  id: "",
  createdAt: 0,
  reason: "beforeSave",
  files: ["GameUserSettings.ini", "Game.ini"],
  changed: ["GameUserSettings.ini"],
  size: 30_000,
};

interface Props {
  backups: ConfigBackupEntry[];
  loading: boolean;
  busy: boolean;
  creating: boolean;
  canRestore: boolean;
  onCreate: () => void;
  onDiff: (backup: ConfigBackupEntry) => void;
  onRestore: (backup: ConfigBackupEntry) => void;
  onDelete: (backup: ConfigBackupEntry) => void;
}

/** Carte « Sauvegardes de la configuration » : bouton de copie et liste. */
export default function ConfigBackupList({
  backups,
  loading,
  busy,
  creating,
  canRestore,
  onCreate,
  onDiff,
  onRestore,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const noop = () => {};

  return (
    <ScrollPanel
      padding={2.5}
      minHeight={200}
      header={
        <>
          <Stack
            direction="row"
            useFlexGap
            spacing={1.5}
            sx={{ alignItems: "center", flexWrap: "wrap", mb: 1.5 }}
          >
            <LoadingSkeleton loading={loading} sx={{ flex: 1 }}>
              <SectionTitle sx={{ flex: 1 }}>
                {t("configBackup.list.title", { count: backups.length })}
              </SectionTitle>
            </LoadingSkeleton>
            <Button
              variant="contained"
              size="small"
              startIcon={
                creating ? <CircularProgress size={14} /> : <BackupIcon />
              }
              disabled={busy || loading}
              onClick={onCreate}
            >
              {t("backup.list.create")}
            </Button>
          </Stack>
          <Divider />
        </>
      }
    >
      {loading ? (
        <Stack>
          {skeletonRows(
            <ConfigBackupRow
              backup={PLACEHOLDER}
              restoreDisabled
              disabled
              onDiff={noop}
              onRestore={noop}
              onDelete={noop}
            />,
          )}
        </Stack>
      ) : backups.length === 0 ? (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", textAlign: "center", py: 4, px: 1 }}
        >
          {t("configBackup.list.empty")}
        </Typography>
      ) : (
        <Stack divider={<Divider />}>
          {backups.map((backup) => (
            <ConfigBackupRow
              key={backup.id}
              backup={backup}
              restoreDisabled={!canRestore}
              disabled={busy}
              onDiff={() => onDiff(backup)}
              onRestore={() => onRestore(backup)}
              onDelete={() => onDelete(backup)}
            />
          ))}
        </Stack>
      )}
    </ScrollPanel>
  );
}
