import { useState } from "react";
import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type {
  ThunderstoreModInfo,
  ThunderstoreModVersion,
  ModRegistry,
} from "@shared/types";
import { REGISTRY_LABEL } from "../utils/modPageUrl";
import ScrollPanel from "../../../../../components/common/ScrollPanel";
import BrowseModCard, { PLACEHOLDER_MOD } from "./BrowseModCard";
import BrowseHeader from "./BrowseHeader";
import BrowseLoadMore from "./BrowseLoadMore";
import ModVersionsDialog from "./ModVersionsDialog";
import { skeletonRows } from "../../../../../components/common/LoadingSkeleton";
import { browseModKey, type useModBrowser } from "../hooks/useModBrowser";

interface Props {
  browser: ReturnType<typeof useModBrowser>;
  onInstallVersion: (registry: ModRegistry, code: string) => void;
}

export default function ModBrowser({ browser, onInstallVersion }: Props) {
  const { t } = useTranslation();
  const { registry, mods, total, loading, loadingMore, error } = browser;
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

  return (
    <ScrollPanel
      paper={false}
      minHeight={280}
      // Pas `mods` : « Charger plus » ne doit pas ramener la liste en haut.
      resetKey={browser.listKey}
      header={
        <BrowseHeader
          tab={browser.tab}
          registry={registry}
          query={browser.query}
          onTabChange={browser.handleTabChange}
          onRegistryChange={browser.handleRegistryChange}
          onSearch={browser.handleSearch}
        />
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
        <Typography variant="body2" sx={{ color: "error.light", py: 2 }}>
          {t("valheimMods.browse.error", {
            registry: REGISTRY_LABEL[registry],
          })}
        </Typography>
      )}

      {!loading && !error && (
        <>
          <Stack spacing={1}>
            {mods.map((mod) => (
              <BrowseModCard
                key={browseModKey(mod)}
                mod={mod}
                onOpenFiles={openFiles}
                onInstall={(selected) =>
                  onInstallVersion(
                    selected.registry,
                    `${selected.author}-${selected.name}-${selected.version}`,
                  )
                }
              />
            ))}
          </Stack>
          <BrowseLoadMore
            shown={mods.length}
            total={total}
            isSearch={browser.query !== ""}
            loadingMore={loadingMore}
            onLoadMore={browser.loadMore}
          />
        </>
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
