import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DragonwildsWorld } from "@shared/types";
import { useServer } from "../../../../../context/ServerContext";
import { useNotification } from "../../../../../context/NotificationContext";

interface WorldsState {
  current: string;
  server: DragonwildsWorld[];
  solo: DragonwildsWorld[];
  soloDir: string;
}

/**
 * Mondes du serveur et mondes solo de ce PC. `onImported` recharge la liste
 * des sauvegardes : un import en crée une (ZIP des mondes du serveur avant
 * copie).
 */
export function useDragonwildsWorlds(onImported: () => Promise<void>) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { state } = useServer();
  const [worlds, setWorlds] = useState<WorldsState | null>(null);
  const [busy, setBusy] = useState(false);
  const stopped = state.status === "stopped" || state.status === "crashed";

  const refresh = useCallback(() => {
    window.api.dragonwilds
      .listWorlds()
      .then(setWorlds)
      .catch(() => notify(t("dragonwildsWorlds.loadFailed")));
  }, [notify, t]);

  useEffect(() => {
    refresh();
  }, [refresh, state.serverPath, state.status]);

  const loadWorld = async (name: string) => {
    try {
      await window.api.dragonwilds.useWorld(name);
      notify(t("dragonwildsWorlds.used", { name }), "success");
      refresh();
    } catch (e) {
      notify((e as Error).message);
    }
  };

  const importWorld = async (path: string) => {
    if (!window.confirm(t("dragonwildsWorlds.importConfirm"))) return;
    setBusy(true);
    try {
      const name = await window.api.dragonwilds.importWorld(path);
      notify(t("dragonwildsWorlds.imported", { name }), "success");
      await onImported();
      refresh();
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Monde venu d'un autre PC (ou dossier solo non trouvé automatiquement).
  const importFromFile = async () => {
    const path = await window.api.dialog.selectFile(
      [{ name: t("dragonwildsWorlds.fileFilter"), extensions: ["sav"] }],
      worlds?.soloDir,
    );
    if (path) await importWorld(path);
  };

  return { worlds, busy, stopped, loadWorld, importWorld, importFromFile };
}
