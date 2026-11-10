import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  Server,
  ServerArchiveImportChoice,
  ServerArchivePreview,
} from "@shared/types";
import { useServer } from "../../../context/ServerContext";
import { useNotification } from "../../../context/NotificationContext";
import { errorMessage } from "../../../utils/appErrorMessage";
import { useExportFile } from "../../../components/transfer/useExportFile";

/**
 * « Déplacer un serveur » : export en ZIP depuis le menu d'une ligne, import
 * depuis l'en-tête. Le ZIP est extrait par le main dès l'aperçu (jeton) :
 * fermer le dialogue sans importer le supprime.
 */
export function useServerTransfer() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { refreshServers, switchActive } = useServer();
  const exportFile = useExportFile();
  const [exporting, setExporting] = useState<Server | null>(null);
  const [preview, setPreview] = useState<ServerArchivePreview | null>(null);

  const runExport = (includePasswords: boolean) =>
    exportFile(() =>
      window.api.transfer.exportServer(exporting!.id, includePasswords),
    );

  const pickFile = async () => {
    const file = await window.api.dialog.selectFile([
      { name: "ZIP", extensions: ["zip"] },
    ]);
    if (!file) return;
    try {
      setPreview(await window.api.transfer.previewServer(file));
    } catch (e) {
      notify(errorMessage(t, e), "error");
    }
  };

  const cancelImport = () => {
    if (preview) window.api.transfer.cancelServerImport(preview.token);
    setPreview(null);
  };

  const runImport = async (choice: ServerArchiveImportChoice) => {
    try {
      const res = await window.api.transfer.importServer(choice);
      setPreview(null);
      await refreshServers();
      await switchActive(res.serverId);
      const parts = [t("servers.transfer.done", { name: choice.name })];
      if (res.world === "skipped")
        parts.push(t("servers.transfer.worldSkipped"));
      if (res.pendingMods > 0) parts.push(t("servers.transfer.modsPending"));
      notify(parts.join(" "), res.world === "skipped" ? "warning" : "success");
    } catch (e) {
      notify(errorMessage(t, e), "error");
    }
  };

  return {
    exporting,
    openExport: setExporting,
    closeExport: () => setExporting(null),
    runExport,
    preview,
    pickFile,
    cancelImport,
    runImport,
  };
}
