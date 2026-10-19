import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../context/NotificationContext";
import { appErrorMessage } from "../utils/appErrorMessage";

/**
 * Sauvegarde le monde du serveur actif avant une mise à jour faite depuis le
 * renderer (mods). Renvoie false si la sauvegarde a échoué : la mise à jour
 * ne doit pas être lancée. La mise à jour du jeu, elle, sauvegarde côté main
 * (SteamCMD, redémarrage planifié).
 */
export function useBackupBeforeUpdate(): () => Promise<boolean> {
  const { t } = useTranslation();
  const { notify } = useNotification();

  return useCallback(async () => {
    try {
      const entry = await window.api.backup.beforeUpdate();
      if (entry) {
        notify(t("backup.notify.beforeUpdate", { name: entry.name }), "info");
      }
      return true;
    } catch (e) {
      notify(appErrorMessage(t, (e as Error).message), "error");
      return false;
    }
  }, [notify, t]);
}
