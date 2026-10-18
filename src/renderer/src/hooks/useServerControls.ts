import { useTranslation } from "react-i18next";
import { useServer } from "../context/ServerContext";
import { useNotification } from "../context/NotificationContext";
import type { ServerStatus } from "@shared/types";
import { appErrorMessage } from "../utils/appErrorMessage";

export function useServerControls() {
  const { state, dispatch } = useServer();
  const { notify } = useNotification();
  const { t } = useTranslation();

  const canStart = state.status === "stopped" || state.status === "crashed";
  const canStop = state.status === "running" || state.status === "starting";

  const optimistic = (status: ServerStatus) => {
    if (!state.activeServerId) return;
    dispatch({
      type: "SET_SERVER_STATUS",
      payload: { serverId: state.activeServerId, status },
    });
  };

  const start = async () => {
    optimistic("starting");
    try {
      const res = await window.api.server.start();
      if (!res.success) {
        notify(
          appErrorMessage(t, res.error, t("serverControls.startFailed")),
          "error",
        );
        optimistic("stopped");
      }
    } catch (e) {
      notify(appErrorMessage(t, (e as Error).message), "error");
      optimistic("stopped");
    }
  };

  const stop = async () => {
    optimistic("stopping");
    try {
      const res = await window.api.server.stop();
      if (!res.success)
        notify(
          appErrorMessage(t, res.error, t("serverControls.stopFailed")),
          "error",
        );
    } catch (e) {
      notify(appErrorMessage(t, (e as Error).message), "error");
    }
  };

  const restart = async () => {
    optimistic("stopping");
    try {
      const res = await window.api.server.restart();
      if (!res.success)
        notify(
          appErrorMessage(t, res.error, t("serverControls.restartFailed")),
          "error",
        );
    } catch (e) {
      notify(appErrorMessage(t, (e as Error).message), "error");
    }
  };

  return { start, stop, restart, canStart, canStop };
}
