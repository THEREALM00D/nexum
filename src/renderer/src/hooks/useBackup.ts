import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { BackupEntry, BackupConfig } from "@shared/types";
import { useServer } from "../context/ServerContext";
import { useNotification } from "../context/NotificationContext";
import { appErrorMessage, errorMessage } from "../utils/appErrorMessage";

export function useBackup() {
  const { t } = useTranslation();
  const { state } = useServer();
  const { notify } = useNotification();

  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [config, setConfig] = useState<BackupConfig>({
    backupDir: "",
    backupKeep: 10,
    backupIntervalMinutes: 0,
    backupBeforeUpdate: true,
  });
  // Premier chargement seulement (les rafraîchissements gardent l'affichage)
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const [list, cfg] = await Promise.all([
        window.api.backup.list(),
        window.api.backup.getConfig(),
      ]);
      setBackups(list);
      setConfig(cfg);
    } catch {
      notify(t("backup.notify.cannotLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const entry = await window.api.backup.create();
      notify(t("backup.notify.created", { name: entry.name }), "success");
      await refresh();
    } catch (e) {
      notify(
        appErrorMessage(
          t,
          (e as Error).message,
          t("backup.notify.createFailed"),
        ),
      );
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (entry: BackupEntry) => {
    if (!window.confirm(t("backup.list.restoreConfirm", { name: entry.name })))
      return;
    setRestoring(entry.path);
    try {
      await window.api.backup.restore(entry.path);
      notify(t("backup.notify.restored", { name: entry.name }), "success");
    } catch (e) {
      notify(errorMessage(t, e, t("backup.notify.restoreFailed")));
    } finally {
      setRestoring(null);
    }
  };

  const handleDelete = async (entry: BackupEntry) => {
    if (!window.confirm(t("backup.list.deleteConfirm", { name: entry.name })))
      return;
    try {
      await window.api.backup.delete(entry.path);
      notify(t("backup.notify.deleted"), "success");
      await refresh();
    } catch {
      notify(t("backup.notify.deleteFailed"));
    }
  };

  const handleSelectDir = async () => {
    const dir = await window.api.dialog.selectFolder();
    if (dir) {
      const next = { ...config, backupDir: dir };
      setConfig(next);
      try {
        await window.api.backup.setConfig(next);
        await refresh();
      } catch {
        notify(t("backup.notify.configFailed"));
      }
    }
  };

  const handleConfigChange = async (patch: Partial<BackupConfig>) => {
    const next = { ...config, ...patch };
    setConfig(next);
    try {
      await window.api.backup.setConfig(next);
    } catch {
      notify(t("backup.notify.configFailed"));
    }
  };

  return {
    backups,
    config,
    loading,
    creating,
    restoring,
    serverPath: state.serverPath,
    status: state.status,
    refresh,
    handleCreate,
    handleRestore,
    handleDelete,
    handleSelectDir,
    handleConfigChange,
  };
}
