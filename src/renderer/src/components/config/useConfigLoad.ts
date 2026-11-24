import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useServer } from "../../context/ServerContext";
import { useNotification } from "../../context/NotificationContext";
import type { ConfigSettings } from "./types";

export const isStopped = (status: string) =>
  status === "stopped" || status === "crashed";

/**
 * Chargement du fichier de config dans le formulaire. Avec
 * `lockWhileRunning`, indique si l'édition est bloquée (serveur lancé) et
 * relit le fichier quand le serveur s'arrête — il a pu le réécrire — sauf si
 * l'utilisateur a une saisie en cours (`markDirty`). Aussi utilisé hors de
 * ConfigPage (page Config d'Enshrouded, réglages typés). `failed` : la
 * dernière lecture a échoué (formulaire vide, à ne pas enregistrer).
 * `markDirty` / `markClean` sont stables (utilisables dans un effet).
 * `reloadKey` : relecture (sans saisie en cours) quand cette valeur change,
 * par exemple après l'enregistrement d'un autre onglet du même fichier.
 */
export function useConfigLoad<T = ConfigSettings>(
  readConfig: () => Promise<T>,
  apply: (settings: T) => void,
  lockWhileRunning?: boolean,
  reloadKey?: unknown,
) {
  const { t } = useTranslation();
  const { state } = useServer();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const dirty = useRef(false);
  const previousStatus = useRef(state.status);

  const load = () =>
    readConfig()
      .then((settings) => {
        apply(settings);
        dirty.current = false;
        setFailed(false);
      })
      .catch(() => {
        setFailed(true);
        notify(t("config.loadFailed"), "error");
      })
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

  const previousReloadKey = useRef(reloadKey);
  useEffect(() => {
    if (Object.is(previousReloadKey.current, reloadKey)) return;
    previousReloadKey.current = reloadKey;
    if (state.serverPath && !dirty.current) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const markDirty = useCallback(() => {
    dirty.current = true;
  }, []);
  const markClean = useCallback(() => {
    dirty.current = false;
  }, []);

  return {
    loading,
    failed,
    locked: !!lockWhileRunning && !isStopped(state.status),
    markDirty,
    markClean,
  };
}
