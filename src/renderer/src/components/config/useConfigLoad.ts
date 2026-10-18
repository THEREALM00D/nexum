import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useServer } from "../../context/ServerContext";
import { useNotification } from "../../context/NotificationContext";
import type { ConfigSettings } from "./types";

const isStopped = (status: string) =>
  status === "stopped" || status === "crashed";

/**
 * Chargement du fichier de config dans le formulaire. Avec
 * `lockWhileRunning`, indique si l'édition est bloquée (serveur lancé) et
 * relit le fichier quand le serveur s'arrête — il a pu le réécrire — sauf si
 * l'utilisateur a une saisie en cours (`markDirty`).
 */
export function useConfigLoad(
  readConfig: () => Promise<ConfigSettings>,
  apply: (settings: ConfigSettings) => void,
  lockWhileRunning?: boolean,
) {
  const { t } = useTranslation();
  const { state } = useServer();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(true);
  const dirty = useRef(false);
  const previousStatus = useRef(state.status);

  const load = () =>
    readConfig()
      .then((settings) => {
        apply(settings);
        dirty.current = false;
      })
      .catch(() => notify(t("config.loadFailed"), "error"))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (!state.serverPath) {
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.serverPath]);

  useEffect(() => {
    const wasRunning = !isStopped(previousStatus.current);
    previousStatus.current = state.status;
    if (lockWhileRunning && wasRunning && isStopped(state.status)) {
      if (state.serverPath && !dirty.current) load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  return {
    loading,
    locked: !!lockWhileRunning && !isStopped(state.status),
    markDirty: () => (dirty.current = true),
    markClean: () => (dirty.current = false),
  };
}
