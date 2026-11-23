import { useState } from "react";
import {
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ModRegistry } from "@shared/types";
import { REGISTRY_LABEL } from "../utils/modPageUrl";
import type { BrowseTab } from "../hooks/useModBrowser";
import BrowseSearchField from "../../../../../components/mods/BrowseSearchField";

interface Props {
  tab: BrowseTab;
  registry: ModRegistry;
  /** Recherche en cours : le champ la retrouve au retour sur l'onglet. */
  query: string;
  onTabChange: (tab: BrowseTab) => void;
  onRegistryChange: (registry: ModRegistry) => void;
  onSearch: (query: string) => void;
}

// En-tête de Parcourir : registre, recherche et onglets.
export default function BrowseHeader({
  tab,
  registry,
  query,
  onTabChange,
  onRegistryChange,
  onSearch,
}: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState(query);

  const clearSearch = () => {
    setSearch("");
    onSearch("");
  };

  return (
    <Stack spacing={1}>
      {/* Registre et recherche sur une ligne : l'en-tête reste compact
          pour laisser de la place à la liste. */}
      <Stack
        direction="row"
        sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.5 }}
      >
        {/* Sélecteur de registre — Thunderstore ou Hexium, listes indépendantes */}
        <ToggleButtonGroup
          value={registry}
          exclusive
          size="small"
          onChange={(_, value) =>
            value && onRegistryChange(value as ModRegistry)
          }
        >
          <ToggleButton value="thunderstore">
            {REGISTRY_LABEL.thunderstore}
          </ToggleButton>
          <ToggleButton value="hexium">{REGISTRY_LABEL.hexium}</ToggleButton>
        </ToggleButtonGroup>

        <BrowseSearchField
          value={search}
          placeholder={t("valheimMods.browse.search")}
          onChange={setSearch}
          onSubmit={() => onSearch(search)}
          onClear={clearSearch}
          fieldMaxWidth={320}
        />
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, value) => {
          setSearch("");
          onTabChange(value as BrowseTab);
        }}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab value="trending" label={t("valheimMods.browse.tabs.trending")} />
        <Tab value="latest" label={t("valheimMods.browse.tabs.latest")} />
        <Tab value="updated" label={t("valheimMods.browse.tabs.updated")} />
      </Tabs>
    </Stack>
  );
}
