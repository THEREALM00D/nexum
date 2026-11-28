import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ConfigBackupEntry, ConfigBackupSettings } from "@shared/types";
import { DEFAULT_CONFIG_BACKUP } from "@shared/configBackup";
import { useServer } from "../../../context/ServerContext";
import { useNotification } from "../../../context/NotificationContext";
import { isStopped } from "../../config/useConfigLoad";
import { appErrorMessage, errorMessage } from "../../../utils/appErrorMessage";

type Result = { success: boolean; error?: string };

/** Onglet Configuration : réglages, liste, copie, restauration, suppression. */
export function useConfigBackups() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { state } = useServer();
  const serverId = state.activeServerId;
  const [settings, setSettings] = useState<ConfigBackupSettings>(
    DEFAULT_CONFIG_BACKUP,
  );
  const [backups, setBackups] = useState<ConfigBackupEntry[]>([]);
  // Premier chargement seulement (les rafraîchissements gardent l'affichage).
  const [loading, setLoading] = useState(true);
  // Réglages illisibles : édition bloquée (les valeurs par défaut affichées
  // écraseraient les vraies au premier changement).
  const [settingsFailed, setSettingsFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  // « Créer » à part : le bouton ne tourne pas pendant une suppression.
  const [creating, setCreating] = useState(false);
  // Fichiers sauvegardés pour ce jeu (aide de la carte Réglages).
  const [files, setFiles] = useState<string[]>([]);

  const refresh = async () => {
    if (!serverId) return;
    // Lus à part : une liste illisible ne bloque pas les réglages.
    const [saved, list, names] = await Promise.allSettled([
      window.api.configBackup.getConfig(serverId),
      window.api.configBackup.list(serverId),
      window.api.configBackup.files(serverId),
    ]);
    if (saved.status === "fulfilled") setSettings(saved.value);
    setSettingsFailed(saved.status === "rejected");
    if (list.status === "fulfilled") setBackups(list.value);
    if (names.status === "fulfilled") setFiles(names.value);
    const failure = [saved, list, names].find(
      (result) => result.status === "rejected",
    );
    if (failure?.status === "rejected")
      notify(
        errorMessage(t, failure.reason, t("configBackup.notify.cannotLoad")),
      );
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, [serverId, state.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeSettings = async (patch: Partial<ConfigBackupSettings>) => {
    if (!serverId) return;
    const previous = settings;
    const next = { ...settings, ...patch };
    setSettings(next);
    try {
      setSettings(await window.api.configBackup.setConfig(serverId, next));
    } catch (error) {
      setSettings(previous);
      notify(errorMessage(t, error, t("backup.notify.configFailed")));
    }
  };

  /** Lance une action, notifie, relit la liste ; vrai si elle a réussi. */
  const run = async (
    action: (id: string) => Promise<Result>,
    successText: string,
  ): Promise<boolean> => {
    if (!serverId) return false;
    setBusy(true);
    try {
      const result = await action(serverId);
      if (!result.success) {
        notify(appErrorMessage(t, result.error));
        return false;
      }
      notify(successText, "success");
      await refresh();
      return true;
    } catch (error) {
      notify(errorMessage(t, error));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const create = async () => {
    if (!serverId) return;
    setBusy(true);
    setCreating(true);
    try {
      const result = await window.api.configBackup.create(serverId);
      if (!result.success) notify(appErrorMessage(t, result.error));
      else
        notify(
          t(
            result.id
              ? "configBackup.notify.created"
              : "configBackup.notify.unchanged",
          ),
          "success",
        );
      await refresh();
    } catch (error) {
      notify(errorMessage(t, error));
    } finally {
      setBusy(false);
      setCreating(false);
    }
  };

  return {
    serverId,
    settings,
    backups,
    loading,
    settingsFailed,
    busy,
    creating,
    files,
    // Le jeu réécrit sa config à l'arrêt : restauration serveur arrêté.
    canRestore: isStopped(state.status),
    changeSettings,
    create,
    restore: (backup: ConfigBackupEntry) =>
      run(
        (id) => window.api.configBackup.restore(id, backup.id),
        t("configBackup.notify.restored"),
      ),
    remove: (backup: ConfigBackupEntry) =>
      run(
        (id) => window.api.configBackup.delete(id, backup.id),
        t("backup.notify.deleted"),
      ),
  };
}
