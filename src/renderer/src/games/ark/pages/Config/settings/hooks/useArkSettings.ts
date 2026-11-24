import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ArkSettingsState } from "@shared/types";
import { useServer } from "../../../../../../context/ServerContext";
import { useNotification } from "../../../../../../context/NotificationContext";
import { useConfigLoad } from "../../../../../../components/config/useConfigLoad";
import {
  appErrorMessage,
  errorMessage,
} from "../../../../../../utils/appErrorMessage";

const EMPTY: ArkSettingsState = { values: {}, unknown: [] };

/**
 * Onglet Réglages de jeu : valeurs écrites dans les fichiers, modifications
 * en cours (null = revenir à la valeur par défaut, la clé est retirée) et
 * enregistrement des seules modifications. Relu à l'arrêt du serveur, qui
 * réécrit ses fichiers (useConfigLoad), sauf modification en cours.
 */
export function useArkSettings() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { state } = useServer();
  const serverId = state.activeServerId ?? "";
  const [saved, setSaved] = useState<ArkSettingsState>(EMPTY);
  const [edits, setEdits] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);

  const read = useCallback(
    () => window.api.arkSettings.read(serverId),
    [serverId],
  );
  const { loading, failed, locked, markDirty, markClean } = useConfigLoad(
    read,
    (data) => {
      setSaved(data);
      setEdits({});
    },
    true,
  );

  const changeCount = Object.keys(edits).length;
  // Déduit du contenu : une modification annulée à la main n'empêche plus
  // la relecture à l'arrêt du serveur.
  useEffect(() => {
    if (changeCount > 0) markDirty();
    else markClean();
  }, [changeCount, markDirty, markClean]);

  const savedValues = useMemo(() => {
    const values: Record<string, string> = { ...saved.values };
    for (const setting of saved.unknown) values[setting.id] = setting.value;
    return values;
  }, [saved]);

  /** Valeur affichée : modification en cours, sinon valeur écrite, sinon "". */
  const valueOf = useCallback(
    (id: string): string => {
      if (id in edits) return edits[id] ?? "";
      return savedValues[id] ?? "";
    },
    [edits, savedValues],
  );

  /** "" ou null = revenir au défaut. Une valeur égale à l'écrite annule la modification. */
  const setValue = useCallback(
    (id: string, value: string | null) => {
      const next = value === "" ? null : value;
      setEdits((current) => {
        const copy = { ...current };
        const unchanged = (savedValues[id] ?? null) === next;
        if (unchanged) delete copy[id];
        else copy[id] = next;
        return copy;
      });
    },
    [savedValues],
  );

  const save = async () => {
    const changes = Object.entries(edits).map(([id, value]) => ({ id, value }));
    if (changes.length === 0 || !serverId || failed) return;
    setSaving(true);
    try {
      const result = await window.api.arkSettings.write(serverId, changes);
      if (!result.success) {
        notify(appErrorMessage(t, result.error), "error");
        return;
      }
      setSaved(await read());
      setEdits({});
      notify(t("arkSettingsUi.saved"), "success");
    } catch (error) {
      notify(errorMessage(t, error), "error");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    // Lecture échouée : rien à modifier, un enregistrement partirait d'un
    // état vide.
    locked: locked || failed,
    running: locked,
    saving,
    unknown: saved.unknown,
    isWritten: (id: string) => id in savedValues,
    isEdited: (id: string) => id in edits,
    valueOf,
    setValue,
    changeCount,
    save,
    discard: () => setEdits({}),
  };
}
