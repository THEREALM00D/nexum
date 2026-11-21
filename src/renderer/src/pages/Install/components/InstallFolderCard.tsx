import { Button, Paper, Stack } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import UpdateIcon from "@mui/icons-material/Update";
import { useTranslation } from "react-i18next";
import type { GameType } from "@shared/types";
import FolderField from "../../../components/common/FolderField";
import GameRequirementsHint from "../../../components/common/GameRequirementsHint";
import SectionTitle from "../../../components/common/SectionTitle";

export default function InstallFolderCard({
  gameType,
  installPath,
  defaultInstallPath,
  running,
  steamInstalled,
  hasServerPath,
  onInstallPathChange,
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
  onInstallGame: () => void;
  onUpdate: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 2.5 }}>
      <SectionTitle sx={{ mb: 2 }}>{t("install.folder.title")}</SectionTitle>
      <Stack spacing={2}>
        <FolderField
          value={installPath}
          onChange={onInstallPathChange}
          placeholder={defaultInstallPath}
          installDirWarning
        />
        <GameRequirementsHint gameType={gameType} />
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
      </Stack>
    </Paper>
  );
}
