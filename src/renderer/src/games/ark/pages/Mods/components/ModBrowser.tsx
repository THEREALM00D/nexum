import { Alert, Button, Divider, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ArkModSearchResult } from "@shared/types";
import ScrollPanel from "../../../../../components/common/ScrollPanel";
import { skeletonRows } from "../../../../../components/common/LoadingSkeleton";
import BrowseLoadMore from "../../../../../components/mods/BrowseLoadMore";
import type { useArkModBrowser } from "../hooks/useArkModBrowser";
import BrowseHeader from "./BrowseHeader";
import BrowseModRow from "./BrowseModRow";

// Résultat factice des skeletons (vrai composant, données réalistes).
const PLACEHOLDER: ArkModSearchResult = {
  id: 929420,
  name: "Super Spyglass Plus",
  summary: "See detailed information on creatures, players and structures.",
  logoUrl: null,
  authors: ["kavan87"],
  websiteUrl: null,
  premium: false,
  installedFile: null,
  installedFileDate: null,
  downloadCount: 14390012,
  updatedAt: "2026-11-03T08:59:25Z",
  cosmetic: false,
  pcOnly: false,
};

interface Props {
  browser: ReturnType<typeof useArkModBrowser>;
  /** ID déjà dans la liste du serveur. */
  listedIds: Set<number>;
  disabled: boolean;
  onAdd: (id: number) => void;
}

// Onglet Parcourir : recherche CurseForge, résultats et « Charger plus ».
export default function ModBrowser({
  browser,
  listedIds,
  disabled,
  onAdd,
}: Props) {
  const { t } = useTranslation();

  return (
    <ScrollPanel
      resetKey={browser.listKey}
      header={
        <BrowseHeader
          filters={browser.filters}
          categories={browser.categories}
          onChange={browser.setFilters}
        />
      }
    >
      {browser.error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={browser.retry}>
              {t("arkMods.browse.retry")}
            </Button>
          }
        >
          {browser.error}
        </Alert>
      ) : (
        <>
          <Stack divider={<Divider />}>
            {browser.loading
              ? skeletonRows(
                  <BrowseModRow
                    mod={PLACEHOLDER}
                    added={false}
                    disabled
                    onAdd={() => {}}
                  />,
                  5,
                )
              : browser.mods.map((mod) => (
                  <BrowseModRow
                    key={mod.id}
                    mod={mod}
                    added={listedIds.has(mod.id)}
                    disabled={disabled}
                    onAdd={onAdd}
                  />
                ))}
          </Stack>
          {!browser.loading && (
            <BrowseLoadMore
              shown={browser.mods.length}
              total={browser.total}
              isSearch={browser.filters.query !== ""}
              loadingMore={browser.loadingMore}
              onLoadMore={() => void browser.loadMore()}
            />
          )}
        </>
      )}
    </ScrollPanel>
  );
}
