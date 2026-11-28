import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ArkModsCleanup } from "@shared/types";
import { useServer } from "../../../../../context/ServerContext";
import { useNotification } from "../../../../../context/NotificationContext";
import { useFormatSize } from "../../../../../hooks/useFormatSize";
import { isStopped } from "../../../../../components/config/useConfigLoad";
import {
  appErrorMessage,
  errorMessage,
} from "../../../../../utils/appErrorMessage";

/**
 * « Nettoyer le dossier des mods » : aperçu lu à l'ouverture du dialogue
 * (tailles calculées par le main), suppression serveur arrêté, puis
 * `onCleaned` (relecture de la liste).
 */
export function useModsCleanup(onCleaned: () => Promise<void>) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { state } = useServer();
  const formatSize = useFormatSize();
  const serverId = state.activeServerId;
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<ArkModsCleanup | null>(null);
  const [cleaning, setCleaning] = useState(false);

  const show = async () => {
    if (!serverId) return;
    setPreview(null);
    setOpen(true);
    try {
      setPreview(await window.api.arkMods.cleanupPreview(serverId));
    } catch (error) {
      setOpen(false);
      notify(errorMessage(t, error), "error");
    }
  };

  const confirm = async () => {
    if (!serverId) return;
    setCleaning(true);
    try {
      const result = await window.api.arkMods.cleanup(serverId);
      if (!result.success) {
        notify(appErrorMessage(t, result.error), "error");
        return;
      }
      notify(
        t("arkMods.cleanup.done", { size: formatSize(result.freed ?? 0) }),
        "success",
      );
      setOpen(false);
      await onCleaned();
    } catch (error) {
      notify(errorMessage(t, error), "error");
    } finally {
      setCleaning(false);
    }
  };

  return {
    open,
    preview,
    cleaning,
    // Le serveur tient ses fichiers de mods et télécharge au démarrage. Le
    // main vérifie aussi les autres serveurs du même dossier.
    canClean: isStopped(state.status),
    show,
    close: () => setOpen(false),
    confirm,
  };
}
