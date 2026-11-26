import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import { useTranslation } from "react-i18next";
import type { BackupConfig } from "@shared/types";
import FolderField from "../common/FolderField";
import { SkeletonChildren } from "../common/LoadingSkeleton";
import SectionTitle from "../common/SectionTitle";
import SwitchField from "../common/SwitchField";

interface Props {
  config: BackupConfig;
  /** Config pas encore lue : chaque champ en skeleton. */
  loading: boolean;
  /** Dossier choisi avec le bouton Parcourir, enregistré tout de suite. */
  onSelectDir: (folder: string) => void;
  onConfigChange: (patch: Partial<BackupConfig>) => void;
  /** Ce que contient une sauvegarde faite serveur lancé, propre au jeu. */
  autoNoteKey: string;
}

export default function BackupConfigPanel({
  config,
  loading,
  onSelectDir,
  onConfigChange,
  autoNoteKey,
}: Props) {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 2.5 }}>
      <SectionTitle sx={{ mb: 1.5 }}>{t("backup.config.title")}</SectionTitle>
      <Stack spacing={2}>
        <SkeletonChildren loading={loading}>
          <FolderField
            label={t("backup.config.dir")}
            value={config.backupDir}
            onChange={onSelectDir}
            readOnly
            installDirWarning
            actions={
              <Tooltip title={t("backup.config.dirOpen")}>
                <span>
                  <IconButton
                    disabled={!config.backupDir}
                    onClick={() => window.api.shell.openPath(config.backupDir)}
                    aria-label={t("backup.config.dirOpen")}
                    sx={{ mt: 0.5 }}
                  >
                    <LaunchIcon />
                  </IconButton>
                </span>
              </Tooltip>
            }
          />

          <TextField
            label={t("backup.config.keep")}
            size="small"
            type="number"
            value={config.backupKeep}
            onChange={(e) =>
              onConfigChange({
                backupKeep: Math.max(0, parseInt(e.target.value, 10) || 0),
              })
            }
            sx={{ maxWidth: 280 }}
            slotProps={{ htmlInput: { min: 0 } }}
            helperText={t("backup.config.keepHelper")}
          />

          <Stack spacing={0.5}>
            <FormControl size="small" sx={{ maxWidth: 280 }}>
              <InputLabel>{t("backup.config.auto")}</InputLabel>
              <Select
                label={t("backup.config.auto")}
                value={config.backupIntervalMinutes}
                onChange={(e) =>
                  onConfigChange({
                    backupIntervalMinutes: Number(e.target.value),
                  })
                }
              >
                <MenuItem value={0}>{t("backup.config.autoOff")}</MenuItem>
                <MenuItem value={15}>{t("backup.config.auto15")}</MenuItem>
                <MenuItem value={30}>{t("backup.config.auto30")}</MenuItem>
                <MenuItem value={60}>{t("backup.config.auto60")}</MenuItem>
                <MenuItem value={180}>{t("backup.config.auto180")}</MenuItem>
                <MenuItem value={360}>{t("backup.config.auto360")}</MenuItem>
                <MenuItem value={720}>{t("backup.config.auto720")}</MenuItem>
                <MenuItem value={1440}>{t("backup.config.auto1440")}</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t(autoNoteKey)}
            </Typography>
          </Stack>

          <SwitchField
            checked={config.backupBeforeUpdate}
            onChange={(backupBeforeUpdate) =>
              onConfigChange({ backupBeforeUpdate })
            }
            label={t("backup.config.beforeUpdate")}
            helper={t("backup.config.beforeUpdateHelper")}
          />
        </SkeletonChildren>
      </Stack>
    </Paper>
  );
}
