import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ArkGameLists, ArkListName } from "@shared/types";
import { useServer } from "../../../../../../context/ServerContext";
import { useNotification } from "../../../../../../context/NotificationContext";
import { useConfigLoad } from "../../../../../../components/config/useConfigLoad";
import {
  appErrorMessage,
  errorMessage,
} from "../../../../../../utils/appErrorMessage";

const LIST_NAMES: ArkListName[] = ["stats", "stackSizes", "engrams", "spawns"];
const EMPTY_STATS = {
  Player: [],
  DinoWild: [],
  DinoTamed: [],
  DinoTamed_Add: [],
  DinoTamed_Affinity: [],
};
const EMPTY: ArkGameLists = {
  stats: EMPTY_STATS,
  stackSizes: [],
  engrams: {
    overrides: [],
    autoUnlocks: [],
    levelPoints: [],
    onlyAllowSpecified: false,
  },
  spawns: { containers: [], weights: [], replacements: [] },
  unreadable: [],
};

/**
 * Onglet Listes : les quatre listes de Game.ini lues ensemble, modifiées
 * et enregistrées une par une (le main réécrit les entrées illisibles telles
 * quelles). Relu à l'arrêt du serveur, qui réécrit Game.ini, sauf
 * modification en cours.
 */
export function useGameLists() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { state } = useServer();
  const serverId = state.activeServerId ?? "";
  const [saved, setSaved] = useState<ArkGameLists>(EMPTY);
  const [draft, setDraft] = useState<ArkGameLists>(EMPTY);
  const [saving, setSaving] = useState(false);

  const read = useCallback(
    () => window.api.arkSettings.readLists(serverId),
    [serverId],
  );
  const { loading, failed, locked, markDirty, markClean } = useConfigLoad(
    read,
    (lists) => {
      setSaved(lists);
      setDraft(lists);
    },
    true,
  );

  const isDirty = (name: ArkListName) =>
    JSON.stringify(draft[name]) !== JSON.stringify(saved[name]);
  const anyDirty = LIST_NAMES.some(isDirty);
  // Déduit du contenu : une liste remise à l'identique ou annulée
  // n'empêche plus la relecture à l'arrêt du serveur.
  useEffect(() => {
    if (anyDirty) markDirty();
    else markClean();
  }, [anyDirty, markDirty, markClean]);

  const change = <Name extends ArkListName>(
    name: Name,
    value: ArkGameLists[Name],
  ) => setDraft((current) => ({ ...current, [name]: value }));

  const save = async (name: ArkListName) => {
    if (failed) return;
    setSaving(true);
    try {
      const result = await window.api.arkSettings.writeList(
        serverId,
        name,
        draft[name],
      );
      if (!result.success) {
        notify(appErrorMessage(t, result.error), "error");
        return;
      }
      // Relu : le main a retiré les lignes vides. Les autres listes gardent
      // leurs modifications en cours.
      const fresh = await read();
      setSaved(fresh);
      setDraft((current) => ({ ...current, [name]: fresh[name] }));
      notify(t("arkListsUi.saved"), "success");
    } catch (error) {
      notify(errorMessage(t, error), "error");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    // Lecture échouée : un enregistrement remplacerait la liste par du vide.
    locked: locked || failed,
    running: locked,
    saving,
    draft,
    unreadable: saved.unreadable,
    change,
    isDirty,
    save,
    discard: (name: ArkListName) =>
      setDraft((current) => ({ ...current, [name]: saved[name] })),
  };
}
