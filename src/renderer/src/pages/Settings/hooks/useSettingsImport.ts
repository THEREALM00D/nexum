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
    } catch (e) {
      notify(errorMessage(t, e), "error");
    }
  };

  const runImport = async (choice: SettingsImportChoice) => {
    try {
      const res = await window.api.transfer.importSettings(choice);
      if (res.app?.language) await i18n.changeLanguage(res.app.language);
      await refreshServers();
      setPreview(null);
      onImported();
      const done = t("settings.transfer.done", {
        count: res.serverIds.length,
      });
      if (res.firewallError) {
        const error = firewallErrorMessage(t, res.firewallError);
        notify(
          `${done} ${t("settings.transfer.firewallFailed", { error })}`,
          "warning",
        );
      } else {
        notify(done, "success");
      }
    } catch (e) {
      notify(errorMessage(t, e), "error");
    }
  };

  return { preview, pickFile, runImport, close: () => setPreview(null) };
}
