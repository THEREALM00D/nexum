import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { GroupedVirtuoso, type GroupedVirtuosoHandle } from "react-virtuoso";
import type { SettingItem, SettingsGroupId } from "../hooks/useSettingsGroups";
import type { useArkSettings } from "../hooks/useArkSettings";
import SettingsGroupHeader from "./SettingsGroupHeader";
import SettingRow from "./SettingRow";

interface Props {
  groups: { group: SettingsGroupId; items: SettingItem[] }[];
  isExpanded: (group: SettingsGroupId) => boolean;
  onToggle: (group: SettingsGroupId) => void;
  settings: ReturnType<typeof useArkSettings>;
  /** Quand elle change (recherche), la liste revient en haut. */
  resetKey: string;
}

/**
 * Réglages de jeu en liste virtualisée (~380 lignes, plus les sections de
 * mods) : seules les lignes visibles sont rendues, en-têtes de groupe
 * collants. Remplit la hauteur de son parent (ScrollPanel).
 */
export default function SettingsList({
  groups,
  isExpanded,
  onToggle,
  settings,
  resetKey,
}: Props) {
  const listRef = useRef<GroupedVirtuosoHandle>(null);
  const visible = groups.map(({ group, items }) =>
    isExpanded(group) ? items : [],
  );
  const rows = visible.flat();
  const disabled = settings.locked || settings.saving;

  useEffect(() => {
    listRef.current?.scrollToIndex({ index: 0 });
  }, [resetKey]);

  return (
    <GroupedVirtuoso
      ref={listRef}
      style={{ height: "100%" }}
      groupCounts={visible.map((items) => items.length)}
      increaseViewportBy={400}
      groupContent={(index) => (
        <SettingsGroupHeader
          group={groups[index].group}
          count={groups[index].items.length}
          expanded={isExpanded(groups[index].group)}
          onToggle={onToggle}
        />
      )}
      itemContent={(index) => {
        const item = rows[index];
        const value = settings.valueOf(item.id);
        return (
          <Box sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}>
            <SettingRow
              id={item.id}
              label={item.label}
              description={item.description}
              type={item.def?.type ?? "string"}
              defaultValue={item.def?.default ?? ""}
              options={item.def?.options}
              min={item.def?.min}
              max={item.def?.max}
              value={value}
              overridden={value !== ""}
              written={settings.isWritten(item.id)}
              edited={settings.isEdited(item.id)}
              disabled={disabled}
              onChange={settings.setValue}
            />
          </Box>
        );
      }}
    />
  );
}
