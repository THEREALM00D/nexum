import { Button, Paper, Stack, TextField, Typography } from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DownloadIcon from "@mui/icons-material/Download";
import UpdateIcon from "@mui/icons-material/Update";
import { useTranslation } from "react-i18next";
import type { GameType } from "@shared/types";
import InstallDirWarning from "../../../components/common/InstallDirWarning";
import GameRequirementsHint from "../../../components/common/GameRequirementsHint";

export default function InstallFolderCard({
  gameType,
  installPath,
  defaultInstallPath,
  running,
  steamInstalled,
  hasServerPath,
  onInstallPathChange,
  onBrowse,
  onInstallGame,
  onUpdate,
}: {
  gameType: GameType;
  installPath: string;
  defaultInstallPath: string;
  running: boolean;
  steamInstalled: boolean | null;
  hasServerPath: boolean;
  onInstallPathChange: (path: string) => void;
  onBrowse: () => void;
  onInstallGame: () => void;
  onUpdate: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        {t("install.folder.title")}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          value={installPath}
          onChange={(e) => onInstallPathChange(e.target.value)}
          placeholder={defaultInstallPath}
        />
        <Button
          variant="outlined"
          onClick={onBrowse}
          startIcon={<FolderOpenIcon />}
          sx={{ whiteSpace: "nowrap" }}
        >
          {t("common.browse")}
        </Button>
      </Stack>
      <InstallDirWarning path={installPath} sx={{ mb: 2 }} />
      <GameRequirementsHint gameType={gameType} sx={{ mb: 2 }} />
      <Stack direction="row" spacing={1}>
        <Button
          fullWidth
          variant="contained"
          color="success"
          startIcon={<DownloadIcon />}
          disabled={running || !steamInstalled}
          onClick={onInstallGame}
        >
          {running
            ? t("install.folder.installing")
            : t("install.folder.installGame", {
                game: t(`servers.games.${gameType}`),
              })}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<UpdateIcon />}
          disabled={running || !steamInstalled || !hasServerPath}
          onClick={onUpdate}
        >
          {t("install.folder.update")}
        </Button>
      </Stack>
    </Paper>
  );
}
