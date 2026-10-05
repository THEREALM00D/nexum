import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useInstall } from "./hooks/useInstall";
import SteamCmdCard from "./components/SteamCmdCard";
import InstallFolderCard from "./components/InstallFolderCard";
import LaunchArgsCard from "./components/LaunchArgsCard";
import UpdateStatusCard from "./components/UpdateStatusCard";
import InstallLogs from "./components/InstallLogs";

export default function Install() {
  const { t } = useTranslation();
  const {
    state,
    gameType,
    steamInstalled,
    installPath,
    setInstallPath,
    logs,
    running,
    checkingUpdate,
    updateStatus,
    launchArgs,
    setLaunchArgs,
    updateLaunchArgs,
    handleBrowse,
    handleInstallSteam,
    handleInstallGame,
    handleUpdate,
    handleCheckUpdate,
    defaultInstallPath,
  } = useInstall();

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <Box>
        <Typography variant="h6">{t("install.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t(
            gameType === "valheim"
              ? "install.subtitleValheim"
              : gameType === "astroneer"
                ? "install.subtitleAstroneer"
                : "install.subtitle",
          )}
        </Typography>
      </Box>

      <SteamCmdCard
        steamInstalled={steamInstalled}
        running={running}
        onInstall={handleInstallSteam}
      />

      <InstallFolderCard
        gameType={gameType}
        installPath={installPath}
        defaultInstallPath={defaultInstallPath}
        running={running}
        steamInstalled={steamInstalled}
        hasServerPath={!!state.serverPath}
        onInstallPathChange={setInstallPath}
        onBrowse={handleBrowse}
        onInstallGame={handleInstallGame}
        onUpdate={handleUpdate}
      />

      {gameType === "palworld" && (
        <LaunchArgsCard
          launchArgs={launchArgs}
          onCustomArgsChange={(v) =>
            setLaunchArgs({ ...launchArgs, customArgs: v })
          }
          onUpdate={updateLaunchArgs}
        />
      )}

      {state.serverPath && (
        <UpdateStatusCard
          updateStatus={updateStatus}
          checkingUpdate={checkingUpdate}
          running={running}
          steamInstalled={steamInstalled}
          onCheckUpdate={handleCheckUpdate}
          onUpdate={handleUpdate}
        />
      )}

      {logs.length > 0 && <InstallLogs logs={logs} />}
    </Stack>
  );
}
