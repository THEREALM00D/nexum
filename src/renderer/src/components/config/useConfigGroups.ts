import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { FieldGroup } from "./types";

function filterGroups(
  groups: FieldGroup[],
  query: string,
  t: TFunction,
  i18nPrefix: string,
): FieldGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((group) => {
      const groupLabel = t(group.labelKey).toLowerCase();
      const groupMatches = groupLabel.includes(q);
      const fields = group.fields.filter((f) => {
        if (groupMatches) return true;
        const label = t(`${i18nPrefix}.${f.key}.label`, {
          defaultValue: f.key,
        }).toLowerCase();
        const description = t(`${i18nPrefix}.${f.key}.description`, {
          defaultValue: "",
        }).toLowerCase();
        return (
          label.includes(q) ||
          f.key.toLowerCase().includes(q) ||
          description.includes(q)
        );
      });
      return { ...group, fields };
    })
    .filter((g) => g.fields.length > 0);
}

/**
 * Recherche + expand/collapse pour une page de config data-driven (groupes de
 * champs). Partagé entre les jeux qui utilisent ConfigPage — `i18nPrefix`
 * distingue les namespaces de traduction (ex: "config.fields" vs "astroneerConfig.fields").
 */
export function useConfigGroups(fieldGroups: FieldGroup[], i18nPrefix: string) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const visibleGroups = useMemo(
    () => filterGroups(fieldGroups, search, t, i18nPrefix),
    [fieldGroups, search, t, i18nPrefix],
  );

  useEffect(() => {
    if (search) {
      setExpandedGroups(new Set(visibleGroups.map((g) => g.labelKey)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, visibleGroups]);

  const allExpanded =
    visibleGroups.length > 0 &&
    visibleGroups.every((g) => expandedGroups.has(g.labelKey));

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedGroups(new Set());
    } else {
      setExpandedGroups(new Set(visibleGroups.map((g) => g.labelKey)));
    }
  };

  const toggleGroup = (labelKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(labelKey)) next.delete(labelKey);
      else next.add(labelKey);
      return next;
    });
  };

  return {
    search,
    setSearch,
    visibleGroups,
    expandedGroups,
    allExpanded,
    toggleAll,
    toggleGroup,
  };
}
