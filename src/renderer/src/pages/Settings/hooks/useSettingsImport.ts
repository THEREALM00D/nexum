import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  SettingsImportChoice,
  SettingsImportPreview,
} from "@shared/types";
import { useServer } from "../../../context/ServerContext";
import { useNotification } from "../../../context/NotificationContext";
import { errorMessage } from "../../../utils/appErrorMessage";
import { firewallErrorMessage } from "../../../components/firewall/useNamedRulesFirewall";

/**
 * Import des réglages : choix du fichier → aperçu validé par le main (rien
 * n'est écrit) → dialogue → import. `onImported` : les interrupteurs de la
 * page relisent leur état (langue, bêta… viennent d'être changés).
 */
export function useSettingsImport(onImported: () => void) {
  const { t, i18n } = useTranslation();
  const { notify } = useNotification();
  const { refreshServers } = useServer();
  const [preview, setPreview] = useState<SettingsImportPreview | null>(null);

  const pickFile = async () => {
    const file = await window.api.dialog.selectFile([
      { name: "JSON", extensions: ["json"] },
    ]);
    if (!file) return;
    try {
      setPreview(await window.api.transfer.previewSettings(file));
    } catch (error) {
      notify(errorMessage(t, error), "error");
    }
  };

  const runImport = async (choice: SettingsImportChoice) => {
    try {
      const result = await window.api.transfer.importSettings(choice);
      if (result.app?.language) await i18n.changeLanguage(result.app.language);
      await refreshServers();
      setPreview(null);
      onImported();
      const done = t("settings.transfer.done", {
        count: result.serverIds.length,
      });
      if (result.firewallError) {
        const firewallMessage = firewallErrorMessage(t, result.firewallError);
        notify(
          `${done} ${t("settings.transfer.firewallFailed", { error: firewallMessage })}`,
          "warning",
        );
      } else {
        notify(done, "success");
      }
    } catch (error) {
      notify(errorMessage(t, error), "error");
      // Liste à jour pour l'avertissement « dossier déjà utilisé »
      await refreshServers().catch(() => {});
    }
  };

  return { preview, pickFile, runImport, close: () => setPreview(null) };
}
