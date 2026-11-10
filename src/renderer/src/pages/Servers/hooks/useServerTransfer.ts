import { useEffect, useRef, useState } from "react";
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

const cancelToken = (token: string | undefined) => {
  if (token) window.api.transfer.cancelServerImport(token).catch(() => {});
};

/**
 * « Déplacer un serveur » : export en ZIP depuis le menu d'une ligne, import
 * depuis l'en-tête. Le ZIP est extrait par le main dès l'aperçu (jeton) :
 * fermer le dialogue sans importer, ou quitter la page, le supprime.
 */
export function useServerTransfer() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { refreshServers, switchActive } = useServer();
  const exportFile = useExportFile();
  const [exporting, setExporting] = useState<Server | null>(null);
  const [preview, setPreview] = useState<ServerArchivePreview | null>(null);
  // Extraction en cours (gros monde : plusieurs secondes)
  const [previewing, setPreviewing] = useState(false);
  const token = useRef<string | undefined>(undefined);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelToken(token.current);
    };
  }, []);

  const showPreview = (next: ServerArchivePreview | null) => {
    token.current = next?.token;
    setPreview(next);
  };

  const runExport = (includePasswords: boolean) =>
    exportFile(() =>
      window.api.transfer.exportServer(exporting!.id, includePasswords),
    );

  const pickFile = async () => {
    const file = await window.api.dialog.selectFile([
      { name: "ZIP", extensions: ["zip"] },
    ]);
    if (!file) return;
    setPreviewing(true);
    try {
      const next = await window.api.transfer.previewServer(file);
      // Page quittée pendant l'extraction : personne n'importera ce jeton
      if (!mounted.current) return cancelToken(next.token);
      cancelToken(token.current);
      showPreview(next);
    } catch (error) {
      if (mounted.current) notify(errorMessage(t, error), "error");
    } finally {
      if (mounted.current) setPreviewing(false);
    }
  };

  const cancelImport = () => {
    cancelToken(token.current);
    showPreview(null);
  };

  const runImport = async (choice: ServerArchiveImportChoice) => {
    try {
      const result = await window.api.transfer.importServer(choice);
      token.current = undefined; // vidé par le main
      showPreview(null);
      await refreshServers();
      await switchActive(result.serverId);
      const parts = [t("servers.transfer.done", { name: choice.name })];
      if (result.world === "skipped")
        parts.push(t("servers.transfer.worldSkipped"));
      if (result.pendingMods > 0) parts.push(t("servers.transfer.modsPending"));
      notify(
        parts.join(" "),
        result.world === "skipped" ? "warning" : "success",
      );
    } catch (error) {
      notify(errorMessage(t, error), "error");
      // Liste à jour pour l'avertissement « dossier déjà utilisé »
      await refreshServers().catch(() => {});
    }
  };

  return {
    exporting,
    openExport: setExporting,
    closeExport: () => setExporting(null),
    runExport,
    preview,
    previewing,
    pickFile,
    cancelImport,
    runImport,
  };
}
