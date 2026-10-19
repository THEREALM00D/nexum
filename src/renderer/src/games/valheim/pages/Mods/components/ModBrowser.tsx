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
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import type {
  ThunderstoreModInfo,
  ThunderstoreModVersion,
  ModRegistry,
} from "@shared/types";
import { REGISTRY_LABEL } from "../utils/modPageUrl";
import ScrollPanel from "../../../../../components/common/ScrollPanel";
import BrowseModCard, { PLACEHOLDER_MOD } from "./BrowseModCard";
import ModVersionsDialog from "./ModVersionsDialog";
import { skeletonRows } from "../../../../../components/common/LoadingSkeleton";

type BrowseTab = "trending" | "latest" | "updated";

interface Props {
  tab: BrowseTab;
  registry: ModRegistry;
  mods: ThunderstoreModInfo[];
  loading: boolean;
  error: boolean;
  onTabChange: (tab: BrowseTab) => void;
  onRegistryChange: (registry: ModRegistry) => void;
  onSearch: (query: string) => void;
  onInstallVersion: (registry: ModRegistry, code: string) => void;
}

export default function ModBrowser({
  tab,
  registry,
  mods,
  loading,
  error,
  onTabChange,
  onRegistryChange,
  onSearch,
  onInstallVersion,
}: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [filesDialog, setFilesDialog] = useState<{
    mod: ThunderstoreModInfo;
    files: ThunderstoreModVersion[] | null;
  } | null>(null);

  const openFiles = async (mod: ThunderstoreModInfo) => {
    setFilesDialog({ mod, files: null });
    try {
      const files = await window.api.valheim.mods.getModFiles(
        mod.registry,
        mod.author,
        mod.name,
      );
      setFilesDialog({ mod, files });
    } catch {
      setFilesDialog({ mod, files: [] });
    }
  };

  const handleSearchSubmit = () => {
    onSearch(search);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch(search);
    if (e.key === "Escape") {
      setSearch("");
      onSearch("");
    }
  };

  return (
    <ScrollPanel
      paper={false}
      minHeight={280}
      resetKey={mods}
      header={
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
              onChange={(_, v) => v && onRegistryChange(v as ModRegistry)}
            >
              <ToggleButton value="thunderstore">
                {REGISTRY_LABEL.thunderstore}
              </ToggleButton>
              <ToggleButton value="hexium">
                {REGISTRY_LABEL.hexium}
              </ToggleButton>
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
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          sx={{ fontSize: 18, color: "text.disabled" }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ flex: 1, maxWidth: 320 }}
              />
              <Button
                size="small"
                variant="outlined"
                onClick={handleSearchSubmit}
                sx={{ height: 40 }}
              >
                {t("valheimMods.browse.searchBtn")}
              </Button>
              {search && (
                <Button
                  size="small"
                  onClick={() => {
                    setSearch("");
                    onSearch("");
                  }}
                  sx={{ height: 40 }}
                >
                  {t("valheimMods.browse.clearSearch")}
                </Button>
              )}
            </Stack>
          </Stack>

          <Tabs
            value={tab}
            onChange={(_, v) => {
              setSearch("");
              onTabChange(v as BrowseTab);
            }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              value="trending"
              label={t("valheimMods.browse.tabs.trending")}
            />
            <Tab value="latest" label={t("valheimMods.browse.tabs.latest")} />
            <Tab value="updated" label={t("valheimMods.browse.tabs.updated")} />
          </Tabs>
        </Stack>
      }
    >
      {loading && (
        <Stack spacing={1}>
          {skeletonRows(
            <BrowseModCard
              mod={PLACEHOLDER_MOD}
              onOpenFiles={() => {}}
              onInstall={() => {}}
            />,
            6,
          )}
        </Stack>
      )}

      {error && !loading && (
        <Typography variant="body2" sx={{ color: "error.main", py: 2 }}>
          {t("valheimMods.browse.error", {
            registry: REGISTRY_LABEL[registry],
          })}
        </Typography>
      )}

      {!loading && !error && (
        <Stack spacing={1}>
          {mods.map((mod) => (
            <BrowseModCard
              key={mod.mod_id}
              mod={mod}
              onOpenFiles={openFiles}
              onInstall={(m) =>
                onInstallVersion(
                  m.registry,
                  `${m.author}-${m.name}-${m.version}`,
                )
              }
            />
          ))}
        </Stack>
      )}

      {/* Versions d'un mod */}
      {filesDialog && (
        <ModVersionsDialog
          mod={filesDialog.mod}
          versions={filesDialog.files}
          onInstall={(code) => {
            onInstallVersion(filesDialog.mod.registry, code);
            setFilesDialog(null);
          }}
          onClose={() => setFilesDialog(null)}
        />
      )}
    </ScrollPanel>
  );
}
