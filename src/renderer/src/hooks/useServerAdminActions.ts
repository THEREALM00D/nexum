import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AdminCapabilities } from "@shared/types";
import { useNotification } from "../context/NotificationContext";
import { appErrorMessage, errorMessage } from "../utils/appErrorMessage";

/**
 * Commandes du menu « ⋯ » du Dashboard pour un serveur donné (serverId
 * toujours explicite). Les capacités (API REST, RCON) sont relues à chaque
 * ouverture du menu : elles changent avec la config du jeu.
 */
export function useServerAdminActions(serverId: string, serverName: string) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [capabilities, setCapabilities] = useState<AdminCapabilities | null>(
    null,
  );

  const loadCapabilities = async () => {
    try {
      setCapabilities(await window.api.server.getCapabilities(serverId));
    } catch (error) {
      setCapabilities(null);
      notify(errorMessage(t, error), "error");
    }
  };

  const saveNow = async () => {
    try {
      await window.api.server.saveNow(serverId);
      notify(t("serverMenu.notify.saved", { name: serverName }), "success");
    } catch (error) {
      notify(
        errorMessage(t, error, t("serverMenu.notify.saveFailed")),
        "error",
      );
    }
  };

  /** Vrai si le message est parti (la fenêtre se ferme). */
  const sendMessage = async (message: string): Promise<boolean> => {
    try {
      await window.api.server.sendMessage(serverId, message);
      notify(t("serverMenu.notify.messageSent"), "success");
      return true;
    } catch (error) {
      notify(
        errorMessage(t, error, t("serverMenu.notify.messageFailed")),
        "error",
      );
      return false;
    }
  };

  const kill = async () => {
    try {
      const result = await window.api.server.kill(serverId);
      if (result.success)
        notify(t("serverMenu.notify.killed", { name: serverName }), "success");
      else notify(appErrorMessage(t, result.error), "error");
    } catch (error) {
      notify(errorMessage(t, error), "error");
    }
  };

  return { capabilities, loadCapabilities, saveNow, sendMessage, kill };
}
