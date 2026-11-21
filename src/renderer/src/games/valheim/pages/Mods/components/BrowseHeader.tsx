import { useState } from "react";
import {
  Button,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import type { ModRegistry } from "@shared/types";
import { REGISTRY_LABEL } from "../utils/modPageUrl";
import type { BrowseTab } from "../hooks/useModBrowser";

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

  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") onSearch(search);
    if (event.key === "Escape") clearSearch();
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

        {/* Champ de recherche — soumet via Entrée ou bouton */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "flex-start", flex: 1, minWidth: 280 }}
        >
          <TextField
            size="small"
            placeholder={t("valheimMods.browse.search")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flex: 1, maxWidth: 320 }}
          />
          <Button
            size="small"
            variant="outlined"
            onClick={() => onSearch(search)}
            sx={{ height: 40 }}
          >
            {t("valheimMods.browse.searchBtn")}
          </Button>
          {search && (
            <Button size="small" onClick={clearSearch} sx={{ height: 40 }}>
              {t("valheimMods.browse.clearSearch")}
            </Button>
          )}
        </Stack>
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
