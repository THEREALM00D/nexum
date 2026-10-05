import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../context/ServerContext";
import { useNotification } from "../../../context/NotificationContext";
import { steamService } from "../../../games/palworld/services/steamService";
import { dialogService } from "../../../services/dialogService";
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

const DEFAULT_INSTALL_PATHS: Record<GameType, string> = {
  palworld: "C:\\PalworldServer",
  valheim: "C:\\ValheimServer",
  astroneer: "C:\\AstroneerServer",
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

  useEffect(() => {
    steamService.isInstalled().then(setSteamInstalled);
    if (state.serverPath) setInstallPath(state.serverPath);
  }, [state.serverPath]);

  useEffect(() => {
    window.api.server.getLaunchArgs().then(setLaunchArgs);
  }, []);

  useEffect(() => {
    const unsub = steamService.onProgress((msg) => setLogs((p) => [...p, msg]));
    return unsub;
  }, []);

  const updateLaunchArgs = async (patch: Partial<LaunchArgsConfig>) => {
    const next = { ...launchArgs, ...patch };
    setLaunchArgs(next);
    try {
      await window.api.server.setLaunchArgs(next);
      notify(t("install.launchArgs.saved"), "info");
    } catch (e) {
      notify((e as Error).message, "error");
    }
  };

  const addLog = (msg: string) => setLogs((p) => [...p, msg]);

  const handleBrowse = async () => {
    const folder = await dialogService.selectFolder();
    if (folder) setInstallPath(folder);
  };

  const handleInstallSteam = async () => {
    setRunning(true);
    setLogs([]);
    try {
      const res = await steamService.install();
      setSteamInstalled(res.success);
      if (!res.success) {
        addLog(t("install.errorPrefix", { msg: res.error }));
        notify(t("install.errorPrefix", { msg: res.error }), "error");
      }
    } catch (e) {
      notify((e as Error).message, "error");
    } finally {
      setRunning(false);
    }
  };

  const handleInstallGame = async () => {
    if (!installPath) return;
    setRunning(true);
    setLogs([]);
    try {
      const res =
        gameType === "valheim"
          ? await window.api.steamcmd.installValheim(installPath)
          : gameType === "astroneer"
            ? await window.api.steamcmd.installAstroneer(installPath)
            : await steamService.installPalworld(installPath);
      if (res.success) {
        await refreshServers();
        setUpdateStatus(null);
      } else {
        addLog(t("install.errorPrefix", { msg: res.error }));
        notify(t("install.errorPrefix", { msg: res.error }), "error");
      }
    } catch (e) {
      notify((e as Error).message, "error");
    } finally {
      setRunning(false);
    }
  };

  const handleUpdate = async () => {
    setRunning(true);
    setLogs([]);
    try {
      const res =
        gameType === "valheim"
          ? await window.api.steamcmd.updateValheim()
          : gameType === "astroneer"
            ? await window.api.steamcmd.updateAstroneer()
            : await steamService.updatePalworld();
      if (res.success) setUpdateStatus(null);
      else {
        addLog(t("install.errorPrefix", { msg: res.error }));
        notify(t("install.errorPrefix", { msg: res.error }), "error");
      }
    } catch (e) {
      notify((e as Error).message, "error");
    } finally {
      setRunning(false);
    }
  };

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const result = await steamService.checkForUpdate();
      setUpdateStatus({ checked: true, ...result });
    } catch (e) {
      notify((e as Error).message, "error");
    } finally {
      setCheckingUpdate(false);
    }
  };

  return {
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
    defaultInstallPath: DEFAULT_INSTALL_PATHS[gameType],
  };
}
