import { useCallback, useMemo, useState } from "react";
import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { CfgEntry } from "../utils/cfgParser";
import CfgSection from "./CfgSection";
import { cfgEntryMatches } from "../utils/cfgSearch";

interface Props {
  entries: CfgEntry[];
  /** Filtre insensible à la casse sur section, clé et description ("" = tout afficher). */
  search: string;
  onChange: (lineIndex: number, value: string) => void;
}

// Sous ce nombre de résultats, une recherche ouvre automatiquement les
// sections concernées ; au-delà on laisse l'utilisateur les ouvrir (perf).
const AUTO_EXPAND_MAX_RESULTS = 40;

export default function CfgStructuredEditor({
  entries,
  search,
  onChange,
}: Props) {
  const { t } = useTranslation();
  // Choix manuels de l'utilisateur ; à défaut, `autoExpand` décide.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const { sections, resultCount } = useMemo(() => {
    const query = search.trim().toLowerCase();
    const map = new Map<string, CfgEntry[]>();
    let count = 0;
    for (const entry of entries) {
      if (query && !cfgEntryMatches(entry, query)) continue;
      const list = map.get(entry.section) ?? [];
      list.push(entry);
      map.set(entry.section, list);
      count++;
    }
    return { sections: Array.from(map.entries()), resultCount: count };
  }, [entries, search]);

  const autoExpand =
    sections.length === 1 ||
    (search.trim() !== "" && resultCount <= AUTO_EXPAND_MAX_RESULTS);

  const toggle = useCallback(
    (section: string) => {
      setOverrides((prev) => ({
        ...prev,
        [section]: !(prev[section] ?? autoExpand),
      }));
    },
    [autoExpand],
  );

  if (entries.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
        {t("valheimMods.configs.noEntries")}
      </Typography>
    );
  }

  if (sections.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
        {t("valheimMods.configs.noMatch")}
      </Typography>
    );
  }

  return (
    <Stack spacing={1} sx={{ maxHeight: "60vh", overflowY: "auto", pr: 1 }}>
      {sections.map(([section, sectionEntries]) => (
        <CfgSection
          key={section || "_"}
          section={section}
          entries={sectionEntries}
          expanded={overrides[section] ?? autoExpand}
          onToggle={toggle}
          onChange={onChange}
        />
      ))}
    </Stack>
  );
}
