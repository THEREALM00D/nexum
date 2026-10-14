import { useMemo, useState } from "react";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ValheimMod, ModUpdate, ModRegistry } from "@shared/types";
import SearchField from "../../../../../components/common/SearchField";
import InstalledModRow from "./InstalledModRow";

// Comparaison sans casse ni espaces/tirets/soulignés, comme la recherche de
// l'onglet Parcourir : « azu auto » trouve « Azumatt-AzuAutoStore ».
const normalize = (s: string) => s.toLowerCase().replace(/[\s\-_]+/g, "");

// Chaque mot de la recherche doit apparaître dans le nom ou l'auteur.
function matches(mod: ValheimMod, query: string): boolean {
  const haystack = normalize(`${mod.name} ${mod.author ?? ""}`);
  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(normalize(word)));
}

interface Props {
  mods: ValheimMod[];
  locale: string;
  updates: ModUpdate[];
  deprecatedCodes: string[];
  onRemove: (modId: number, name: string) => void;
  onToggle: (modId: number, enabled: boolean) => void;
  onUpdate: (registry: ModRegistry, latestCode: string) => void;
}

export default function InstalledModsList({
  mods,
  locale,
  updates,
  deprecatedCodes,
  onRemove,
  onToggle,
  onUpdate,
}: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const updateMap = new Map(updates.map((u) => [u.installedCode, u]));
  const deprecatedSet = new Set(deprecatedCodes);

  const visibleMods = useMemo(() => {
    const query = search.trim();
    return query ? mods.filter((m) => matches(m, query)) : mods;
  }, [mods, search]);

  if (mods.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
        {t("valheimMods.installed.empty")}
      </Typography>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={t("valheimMods.installed.search")}
          sx={{ flex: 1 }}
        />
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
        >
          {search.trim()
            ? t("valheimMods.installed.countFiltered", {
                shown: visibleMods.length,
                total: mods.length,
              })
            : t("valheimMods.installed.count", { count: mods.length })}
        </Typography>
      </Box>
      {visibleMods.length === 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary", py: 1 }}>
          {t("valheimMods.installed.noMatch")}
        </Typography>
      )}
      <Stack divider={<Divider />} spacing={0}>
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
      </Stack>
    </Paper>
  );
}
