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
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import LaunchIcon from "@mui/icons-material/Launch";
import { useTranslation } from "react-i18next";
import type { BackupConfig } from "@shared/types";
import InstallDirWarning from "../common/InstallDirWarning";

interface Props {
  config: BackupConfig;
  onSelectDir: () => void;
  onConfigChange: (patch: Partial<BackupConfig>) => void;
}

export default function BackupConfigPanel({
  config,
  onSelectDir,
  onConfigChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        {t("backup.config.title")}
      </Typography>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <TextField
            label={t("backup.config.dir")}
            size="small"
            value={config.backupDir}
            fullWidth
            slotProps={{ input: { readOnly: true } }}
          />
          <Tooltip title={t("backup.config.dirTooltip")}>
            <IconButton onClick={onSelectDir}>
              <FolderOpenIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("backup.config.dirOpen")}>
            <span>
              <IconButton
                disabled={!config.backupDir}
                onClick={() => window.api.shell.openPath(config.backupDir)}
              >
                <LaunchIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
        <InstallDirWarning path={config.backupDir} />

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

        <FormControl size="small" sx={{ maxWidth: 280 }}>
          <InputLabel>{t("backup.config.auto")}</InputLabel>
          <Select
            label={t("backup.config.auto")}
            value={config.backupIntervalMinutes}
            onChange={(e) =>
              onConfigChange({ backupIntervalMinutes: Number(e.target.value) })
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
      </Stack>
    </Paper>
  );
}
