import { useState } from "react";
import { MenuItem, Stack, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ArkModCategory, ArkModSort } from "@shared/types";
import type { BrowseFilters } from "../hooks/useArkModBrowser";
import BrowseSearchField from "../../../../../components/mods/BrowseSearchField";

const SORTS: ArkModSort[] = ["popular", "updated", "downloads", "name"];
// Valeur du Select pour « toutes les catégories » (un Select n'accepte pas
// null).
const ALL_CATEGORIES = "all";

interface Props {
  filters: BrowseFilters;
  categories: ArkModCategory[];
  onChange: (patch: Partial<BrowseFilters>) => void;
}

// En-tête de Parcourir : recherche (Entrée ou bouton), tri, catégorie.
export default function BrowseHeader({ filters, categories, onChange }: Props) {
  const { t } = useTranslation();
  // Texte en cours de frappe : la recherche part à Entrée ou au bouton.
  const [search, setSearch] = useState(filters.query);

  const submit = (query: string) => {
    if (query.trim() !== filters.query) onChange({ query: query.trim() });
  };
  const clear = () => {
    setSearch("");
    submit("");
  };
  // Nom traduit si connu, sinon le nom anglais de l'API.
  const categoryLabel = (category: ArkModCategory) =>
    t(`arkMods.categories.${category.id}`, { defaultValue: category.name });

  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{ alignItems: "flex-start", flexWrap: "wrap", gap: 1.5 }}
    >
      <BrowseSearchField
        value={search}
        placeholder={t("arkMods.browse.search")}
        onChange={setSearch}
        onSubmit={() => submit(search)}
        onClear={clear}
      />
      <TextField
        select
        size="small"
        label={t("arkMods.browse.sort")}
        value={filters.sort}
        onChange={(event) =>
          onChange({ sort: event.target.value as ArkModSort })
        }
        sx={{ minWidth: 190 }}
      >
        {SORTS.map((sort) => (
          <MenuItem key={sort} value={sort}>
            {t(`arkMods.browse.sorts.${sort}`)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label={t("arkMods.browse.category")}
        value={filters.categoryId ?? ALL_CATEGORIES}
        onChange={(event) =>
          onChange({
            categoryId:
              event.target.value === ALL_CATEGORIES
                ? null
                : Number(event.target.value),
          })
        }
        sx={{ minWidth: 190 }}
      >
        <MenuItem value={ALL_CATEGORIES}>
          {t("arkMods.browse.allCategories")}
        </MenuItem>
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {categoryLabel(category)}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
