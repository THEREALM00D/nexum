import { useDeferredValue, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ArkUnknownSetting } from "@shared/types";
import {
  ARK_SETTINGS,
  ARK_SETTING_GROUPS,
  arkSettingId,
  type ArkSettingDef,
} from "@shared/arkSettings";

export type SettingsGroupId = (typeof ARK_SETTING_GROUPS)[number] | "other";

export interface SettingItem {
  id: string;
  /** Réglage du catalogue ; null pour un réglage inconnu (« Autres réglages »). */
  def: ArkSettingDef | null;
  key: string;
  label: string;
  description: string;
}

const normalize = (text: string) => text.toLowerCase().replace(/[\s_-]+/g, "");

/**
 * Réglages par groupe, filtrés par la recherche (libellé, description ou
 * clé, tous les mots). Une recherche déplie les groupes qui ont des résultats.
 */
export function useSettingsGroups(unknown: ArkUnknownSetting[]) {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [expanded, setExpanded] = useState<Set<SettingsGroupId>>(new Set());

  const items = useMemo(() => {
    const byGroup = new Map<SettingsGroupId, SettingItem[]>();
    const add = (group: SettingsGroupId, item: SettingItem) =>
      byGroup.set(group, [...(byGroup.get(group) ?? []), item]);
    for (const def of ARK_SETTINGS) {
      add(def.group, {
        id: arkSettingId(def),
        def,
        key: def.key,
        label: t(`arkSettings.${def.key}.label`, { defaultValue: def.key }),
        description: t(`arkSettings.${def.key}.description`, {
          defaultValue: "",
        }),
      });
    }
    for (const setting of unknown) {
      add("other", {
        id: setting.id,
        def: null,
        key: setting.key,
        label: setting.key,
        description: t(`arkSettingsUi.sources.${setting.file}`),
      });
    }
    return byGroup;
    // La langue change les libellés.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unknown, t, i18n.language]);

  const words = normalize(deferredSearch).length
    ? deferredSearch.toLowerCase().split(/\s+/).filter(Boolean).map(normalize)
    : [];
  const groups = [...ARK_SETTING_GROUPS, "other" as const]
    .map((group) => ({
      group,
      items: (items.get(group) ?? []).filter((item) => {
        if (words.length === 0) return true;
        const haystack = normalize(
          `${item.label} ${item.description} ${item.key}`,
        );
        return words.every((word) => haystack.includes(word));
      }),
    }))
    .filter((entry) => entry.items.length > 0);

  return {
    search,
    setSearch,
    searching: words.length > 0,
    groups,
    isExpanded: (group: SettingsGroupId) =>
      words.length > 0 || expanded.has(group),
    // Pendant une recherche, les groupes sont dépliés d'office : un clic
    // ne doit pas changer en douce l'état retrouvé après la recherche.
    toggle: (group: SettingsGroupId) => {
      if (words.length > 0) return;
      setExpanded((current) => {
        const next = new Set(current);
        if (next.has(group)) next.delete(group);
        else next.add(group);
        return next;
      });
    },
  };
}
