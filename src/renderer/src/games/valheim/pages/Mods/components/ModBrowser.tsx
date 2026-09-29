import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import { useTranslation } from "react-i18next";
import type {
  ThunderstoreModInfo,
  ThunderstoreModVersion,
  ModRegistry,
} from "@shared/types";
import { REGISTRY_LABEL, modPageUrl } from "../utils/modPageUrl";
import DeprecatedChip from "./DeprecatedChip";

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
  const [loadingFiles, setLoadingFiles] = useState(false);

  const openFiles = async (mod: ThunderstoreModInfo) => {
    setFilesDialog({ mod, files: null });
    setLoadingFiles(true);
    try {
      const files = await window.api.valheim.mods.getModFiles(
        mod.registry,
        mod.author,
        mod.name,
      );
      setFilesDialog({ mod, files });
    } catch {
      setFilesDialog({ mod, files: [] });
    } finally {
      setLoadingFiles(false);
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
    <Stack spacing={2}>
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
        <ToggleButton value="hexium">{REGISTRY_LABEL.hexium}</ToggleButton>
      </ToggleButtonGroup>

      {/* Champ de recherche — soumet via Entrée ou bouton */}
      <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
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

      <Tabs
        value={tab}
        onChange={(_, v) => {
          setSearch("");
          onTabChange(v as BrowseTab);
        }}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab value="trending" label={t("valheimMods.browse.tabs.trending")} />
        <Tab value="latest" label={t("valheimMods.browse.tabs.latest")} />
        <Tab value="updated" label={t("valheimMods.browse.tabs.updated")} />
      </Tabs>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
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
            <Paper key={mod.mod_id} sx={{ p: 1.5 }}>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                {mod.picture_url && (
                  <Box
                    component="img"
                    src={mod.picture_url}
                    alt={mod.name}
                    sx={{
                      width: 80,
                      height: 45,
                      objectFit: "cover",
                      borderRadius: 1,
                      flexShrink: 0,
                    }}
                  />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                      {mod.name}{" "}
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        v{mod.version}
                      </Typography>
                    </Typography>
                    {mod.deprecated && (
                      <DeprecatedChip registry={mod.registry} />
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                    noWrap
                  >
                    {mod.author}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.disabled",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {mod.summary}
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: "center", flexShrink: 0 }}
                >
                  <ThumbUpIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                  <Typography
                    variant="caption"
                    sx={{ color: "text.disabled", mr: 1 }}
                  >
                    {mod.endorsement_count.toLocaleString()}
                  </Typography>
                  <Tooltip title={t("valheimMods.browse.viewFiles")}>
                    <IconButton size="small" onClick={() => openFiles(mod)}>
                      <FolderOpenIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {/* Installation directe de la dernière version */}
                  <Tooltip title={t("valheimMods.browse.installLatest")}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() =>
                        onInstallVersion(
                          mod.registry,
                          `${mod.author}-${mod.name}-${mod.version}`,
                        )
                      }
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title={t("valheimMods.browse.openTooltip", {
                      registry: REGISTRY_LABEL[mod.registry],
                    })}
                  >
                    <IconButton
                      size="small"
                      onClick={() =>
                        window.api.shell.openExternal(
                          modPageUrl(mod.registry, mod.author, mod.name),
                        )
                      }
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Dialog versions */}
      {filesDialog && (
        <Dialog
          open
          onClose={() => setFilesDialog(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {t("valheimMods.browse.filesDialog.title", {
              name: filesDialog.mod.name,
            })}
          </DialogTitle>
          <DialogContent dividers>
            {loadingFiles ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={28} />
              </Box>
            ) : !filesDialog.files?.length ? (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {t("valheimMods.browse.filesDialog.noFiles")}
              </Typography>
            ) : (
              <Stack divider={<Divider />} spacing={0}>
                {filesDialog.files.map((f) => (
                  <Box key={f.file_id} sx={{ py: 1.5 }}>
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {f.file_name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {t("valheimMods.browse.filesDialog.size", {
                            size: f.size_kb.toLocaleString(),
                          })}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => {
                          onInstallVersion(
                            filesDialog.mod.registry,
                            `${filesDialog.mod.author}-${filesDialog.mod.name}-${f.version}`,
                          );
                          setFilesDialog(null);
                        }}
                      >
                        {t("valheimMods.thunderstore.install")}
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFilesDialog(null)}>
              {t("valheimMods.browse.filesDialog.close")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}
