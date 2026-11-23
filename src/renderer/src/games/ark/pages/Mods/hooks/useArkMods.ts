import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ArkMod, ArkModsState } from "@shared/types";
import { useServer } from "../../../../../context/ServerContext";
import { useNotification } from "../../../../../context/NotificationContext";
import {
  appErrorMessage,
  errorMessage,
} from "../../../../../utils/appErrorMessage";

type Result = { success: boolean; error?: string };

/**
 * Liste des mods du serveur actif. Chaque changement est enregistré tout de
 * suite (le serveur la lit au démarrage) puis la liste est relue.
 */
export function useArkMods() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { state } = useServer();
  const serverId = state.activeServerId;
  const [data, setData] = useState<ArkModsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  // Deux lectures qui se chevauchent (changement de statut, relecture après
  // une action) : seule la dernière lancée est gardée. Un changement de
  // serveur remonte la page (key d'App.tsx).
  const requestRef = useRef(0);

  const reload = useCallback(async () => {
    if (!serverId) return;
    const request = ++requestRef.current;
    try {
      const modsState = await window.api.arkMods.get(serverId);
      if (request === requestRef.current) setData(modsState);
    } catch (error) {
      notify(errorMessage(t, error), "error");
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }, [serverId, notify, t]);

  // library.json est réécrit par le serveur au démarrage : relu à chaque
  // changement de statut.
  useEffect(() => {
    void reload();
  }, [reload, state.status]);

  const run = useCallback(
    async (action: (id: string) => Promise<Result>): Promise<boolean> => {
      if (!serverId) return false;
      setBusy(true);
      try {
        const result = await action(serverId);
        if (!result.success) {
          notify(appErrorMessage(t, result.error), "error");
          return false;
        }
        await reload();
        return true;
      } catch (error) {
        notify(errorMessage(t, error), "error");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [serverId, notify, reload, t],
  );

  const mods: ArkMod[] = (data?.mods ?? []).map(({ id, enabled }) => ({
    id,
    enabled,
  }));
  const save = (next: ArkMod[]) =>
    run((id) => window.api.arkMods.set(id, next));

  return {
    data,
    loading,
    busy,
    add: (modId: number) => run((id) => window.api.arkMods.add(id, modId)),
    remove: (modId: number) => save(mods.filter((mod) => mod.id !== modId)),
    toggle: (modId: number, enabled: boolean) =>
      save(mods.map((mod) => (mod.id === modId ? { ...mod, enabled } : mod))),
    move: (modId: number, offset: -1 | 1) => {
      const index = mods.findIndex((mod) => mod.id === modId);
      const target = index + offset;
      if (index < 0 || target < 0 || target >= mods.length) return;
      const next = [...mods];
      [next[index], next[target]] = [next[target], next[index]];
      void save(next);
    },
    takeFromArgs: () => run((id) => window.api.arkMods.takeFromArgs(id)),
  };
}
