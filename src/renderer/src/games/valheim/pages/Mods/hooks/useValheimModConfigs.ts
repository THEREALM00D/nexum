import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../../../context/NotificationContext";
import type { ValheimModConfigFile } from "@shared/types";
import { parseCfg, serializeCfg, type CfgEntry } from "../utils/cfgParser";

export function useValheimModConfigs() {
  const { t } = useTranslation();
  const { notify } = useNotification();

  const [files, setFiles] = useState<ValheimModConfigFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [entries, setEntries] = useState<CfgEntry[]>([]);
  // Valeurs telles que lues sur disque, pour détecter les modifs non sauvegardées
  const [initialEntries, setInitialEntries] = useState<CfgEntry[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFiles(await window.api.valheim.mods.listConfigFiles());
    } catch {
      notify(t("valheimMods.configs.loadFailed"), "error");
    } finally {
      setLoading(false);
    }
  }, [notify, t]);

  useEffect(() => {
    load();
  }, [load]);

  const openFile = useCallback(
    async (fileName: string) => {
      try {
        const text = await window.api.valheim.mods.readConfigFile(fileName);
        const parsed = parseCfg(text);
        setLines(parsed.lines);
        setEntries(parsed.entries);
        setInitialEntries(parsed.entries);
        setEditing(fileName);
      } catch {
        notify(t("valheimMods.configs.readFailed"), "error");
      }
    },
    [notify, t],
  );

  const closeEditor = useCallback(() => {
    setEditing(null);
    setLines([]);
    setEntries([]);
    setInitialEntries([]);
  }, []);

  // `updateEntry` ne remplace que l'entrée modifiée et garde l'ordre : une
  // comparaison index par index suffit (revenir à la valeur d'origine = propre).
  const dirty = useMemo(
    () => entries.some((e, i) => e.value !== initialEntries[i]?.value),
    [entries, initialEntries],
  );

  const updateEntry = useCallback((lineIndex: number, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.lineIndex === lineIndex ? { ...e, value } : e)),
    );
  }, []);

  const save = useCallback(async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await window.api.valheim.mods.writeConfigFile(
        editing,
        serializeCfg(lines, entries),
      );
      notify(t("valheimMods.configs.saved", { name: editing }), "success");
      closeEditor();
      load();
    } catch {
      notify(t("valheimMods.configs.saveFailed"), "error");
    } finally {
      setSaving(false);
    }
  }, [editing, lines, entries, notify, t, closeEditor, load]);

  return {
    files,
    loading,
    editing,
    entries,
    saving,
    dirty,
    openFile,
    closeEditor,
    updateEntry,
    save,
    reload: load,
  };
}
