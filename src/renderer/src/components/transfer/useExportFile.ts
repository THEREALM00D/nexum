import { useTranslation } from "react-i18next";
import { useNotification } from "../../context/NotificationContext";
import { errorMessage } from "../../utils/appErrorMessage";

/**
 * Lance un export (le main ouvre « Enregistrer sous ») et notifie le chemin
 * écrit, avec « Afficher » dans l'Explorateur. Renvoie false si annulé ou en
 * erreur (le dialogue reste ouvert).
 */
export function useExportFile() {
  const { t } = useTranslation();
  const { notify } = useNotification();

  return async (run: () => Promise<string | null>): Promise<boolean> => {
    try {
      const path = await run();
      if (!path) return false;
      // Nom seul : un chemin complet sans espace ne passe pas à la ligne
      const name = path.split(/[\\/]/).pop() ?? path;
      notify(t("transfer.saved", { name }), "success", {
        label: t("transfer.showInFolder"),
        onClick: () => window.api.shell.showItemInFolder(path),
      });
      return true;
    } catch (e) {
      notify(errorMessage(t, e), "error");
      return false;
    }
  };
}
