import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../context/ServerContext";
import { useNotification } from "../../../context/NotificationContext";
import { steamService } from "../../../services/steamService";
import { appErrorMessage, errorMessage } from "../../../utils/appErrorMessage";
import { DEFAULT_GAME } from "../../../games/registry";
import type { GameType, LaunchArgsConfig } from "@shared/types";

export interface UpdateStatus {
  checked: boolean;
  upToDate: boolean;
  installedBuild: string | null;
  requiredBuild: string | null;
}

const DEFAULT_LAUNCH_ARGS: LaunchArgsConfig = {
  publicLobby: false,
  performanceFlags: false,
  customArgs: "",
};

// Exporté : aussi proposé par l'assistant de démarrage (pages/Setup).
export const DEFAULT_INSTALL_PATHS: Record<GameType, string> = {
  palworld: "C:\\PalworldServer",
  valheim: "C:\\ValheimServer",
  astroneer: "C:\\AstroneerServer",
  dragonwilds: "C:\\DragonwildsServer",
  enshrouded: "C:\\EnshroudedServer",
  ark: "C:\\ArkServer",
};

export function useInstall() {
  const { t } = useTranslation();
  const { state, refreshServers } = useServer();
  const { notify } = useNotification();
  const [steamInstalled, setSteamInstalled] = useState<boolean | null>(null);
  const gameType = state.activeServer?.gameType ?? DEFAULT_GAME;

  const [installPath, setInstallPath] = useState(
    state.serverPath || DEFAULT_INSTALL_PATHS[gameType],
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [launchArgs, setLaunchArgs] =
    useState<LaunchArgsConfig>(DEFAULT_LAUNCH_ARGS);
  const [launchArgsLoading, setLaunchArgsLoading] = useState(true);

  useEffect(() => {
    steamService.isInstalled().then(setSteamInstalled);
    if (state.serverPath) setInstallPath(state.serverPath);
  }, [state.serverPath]);

  useEffect(() => {
    window.api.server
      .getLaunchArgs()
      .then(setLaunchArgs)
      .catch(() => {})
      .finally(() => setLaunchArgsLoading(false));
  }, []);

  useEffect(() => {
    const unsubscribe = steamService.onProgress((line) =>
      setLogs((previous) => [...previous, line]),
    );
    return unsubscribe;
  }, []);

  const updateLaunchArgs = async (patch: Partial<LaunchArgsConfig>) => {
    const next = { ...launchArgs, ...patch };
    setLaunchArgs(next);
    try {
      await window.api.server.setLaunchArgs(next);
      notify(t("install.launchArgs.saved"), "info");
    } catch (error) {
      notify(errorMessage(t, error), "error");
    }
  };

  // Échec renvoyé par le main : dernière ligne du journal + notification.
  const reportFailure = (error: string | undefined) => {
    const message = t("common.errorPrefix", {
      msg: appErrorMessage(t, error),
    });
    setLogs((previous) => [...previous, message]);
    notify(message, "error");
  };

  const handleInstallSteam = async () => {
    setRunning(true);
    setLogs([]);
    try {
      const result = await steamService.install();
      setSteamInstalled(result.success);
      if (!result.success) reportFailure(result.error);
    } catch (error) {
      notify(errorMessage(t, error), "error");
    } finally {
      setRunning(false);
    }
  };

  const handleInstallGame = async () => {
    if (!installPath) return;
    setRunning(true);
    setLogs([]);
    try {
      const result = await steamService.installGame(gameType, installPath);
      if (result.success) {
        await refreshServers();
        setUpdateStatus(null);
      } else reportFailure(result.error);
    } catch (error) {
      notify(errorMessage(t, error), "error");
    } finally {
      setRunning(false);
    }
  };

  const handleUpdate = async () => {
    setRunning(true);
    setLogs([]);
    try {
      const result = await steamService.updateGame();
      if (result.success) setUpdateStatus(null);
      else reportFailure(result.error);
    } catch (error) {
      notify(errorMessage(t, error), "error");
    } finally {
      setRunning(false);
    }
  };

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const result = await steamService.checkForUpdate();
      setUpdateStatus({ checked: true, ...result });
    } catch (error) {
      notify(errorMessage(t, error), "error");
    } finally {
      setCheckingUpdate(false);
    }
  };

  return {
    launchArgsLoading,
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
    handleInstallSteam,
    handleInstallGame,
    handleUpdate,
    handleCheckUpdate,
    defaultInstallPath: DEFAULT_INSTALL_PATHS[gameType],
  };
}
