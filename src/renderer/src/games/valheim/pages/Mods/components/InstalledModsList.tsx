import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ValheimMod, ModUpdate, ModRegistry } from "@shared/types";
import ModListPanel from "../../../../../components/mods/ModListPanel";
import { matchesModSearch } from "../../../../../components/mods/modSearch";
import InstalledModRow from "./InstalledModRow";
import InstalledSortSelect from "./InstalledSortSelect";
import {
  loadInstalledSort,
  saveInstalledSort,
  sortInstalledMods,
  type InstalledSort,
} from "../utils/sortInstalledMods";

// Mod d'exemple des lignes en skeleton (jamais affiché)
const PLACEHOLDER_MOD: ValheimMod = {
  modId: 0,
  fileId: 0,
  name: "ModName",
  version: "1.0.0",
  author: "Author",
  summary: "",
  installedAt: 0,
  enabled: true,
  installDir: "",
  source: "thunderstore",
  publishedAt: 0,
};

interface Props {
  mods: ValheimMod[];
  /** Liste pas encore lue : compteur et lignes en skeleton. */
  loading: boolean;
  locale: string;
  updates: ModUpdate[];
  deprecatedCodes: string[];
  onRemove: (modId: number, name: string) => void;
  onToggle: (modId: number, enabled: boolean) => void;
  onUpdate: (registry: ModRegistry, latestCode: string) => void;
}

export default function InstalledModsList({
  mods,
  loading,
  locale,
  updates,
  deprecatedCodes,
  onRemove,
  onToggle,
  onUpdate,
}: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<InstalledSort>(loadInstalledSort);

  const updateMap = useMemo(
    () => new Map(updates.map((update) => [update.installedCode, update])),
    [updates],
  );
  const deprecatedSet = useMemo(
    () => new Set(deprecatedCodes),
    [deprecatedCodes],
  );

  const visibleMods = useMemo(() => {
    const query = search.trim();
    const filtered = query
      ? mods.filter((mod) =>
          matchesModSearch([mod.name, mod.author ?? ""], query),
        )
      : mods;
    return sortInstalledMods(filtered, sort, {
      hasUpdate: (mod) =>
        !!mod.thunderstoreCode && updateMap.has(mod.thunderstoreCode),
      isDeprecated: (mod) =>
        !!mod.thunderstoreCode && deprecatedSet.has(mod.thunderstoreCode),
    });
  }, [mods, search, sort, updateMap, deprecatedSet]);

  const handleSortChange = (next: InstalledSort) => {
    setSort(next);
    saveInstalledSort(next);
  };

  return (
    <ModListPanel
      search={search}
      onSearch={setSearch}
      searchPlaceholder={t("valheimMods.installed.search")}
      count={
        search.trim()
          ? t("valheimMods.installed.countFiltered", {
              shown: visibleMods.length,
              total: mods.length,
            })
          : t("valheimMods.installed.count", { count: mods.length })
      }
      extra={<InstalledSortSelect value={sort} onChange={handleSortChange} />}
      loading={loading}
      skeletonRow={
        <InstalledModRow
          mod={PLACEHOLDER_MOD}
          locale={locale}
          update={undefined}
          deprecated={false}
          onRemove={() => {}}
          onToggle={() => {}}
          onUpdate={() => {}}
        />
      }
      emptyText={t("valheimMods.installed.empty")}
      noMatchText={t("valheimMods.installed.noMatch")}
      resetKey={sort}
    >
      {visibleMods.map((mod) => {
        const code = mod.thunderstoreCode;
        return (
          <InstalledModRow
            key={mod.modId}
            mod={mod}
            locale={locale}
            update={code ? updateMap.get(code) : undefined}
            deprecated={!!code && deprecatedSet.has(code)}
            onRemove={onRemove}
            onToggle={onToggle}
            onUpdate={onUpdate}
          />
        );
      })}
    </ModListPanel>
  );
}
