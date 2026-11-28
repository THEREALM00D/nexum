import { useState } from "react";
import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ArkModInfo } from "@shared/types";
import { arkModState } from "@shared/arkMods";
import ModListPanel from "../../../../../components/mods/ModListPanel";
import { matchesModSearch } from "../../../../../components/mods/modSearch";
import type { useArkMods } from "../hooks/useArkMods";
import AddModField from "./AddModField";
import ArkModRow from "./ArkModRow";
import ListedModActions from "./ListedModActions";
import DownloadedModsList from "./DownloadedModsList";

// Ligne factice des skeletons (vrai composant, données réalistes).
const PLACEHOLDER: ArkModInfo = {
  id: 928621,
  name: "Utilities Plus",
  summary: "",
  logoUrl: null,
  authors: ["blitzfire911"],
  websiteUrl: null,
  premium: false,
  installedFile: "utilities-plus-windowsserver-10.zip",
  installedFileDate: "2026-11-03T08:59:25Z",
};

interface Props {
  mods: ReturnType<typeof useArkMods>;
}

// Onglet Liste : ajout par ID, liste ordonnée du serveur (liste commune
// aux pages Mods, components/mods/ModListPanel) puis, dans la même zone
// qui défile, les mods téléchargés hors liste. Fragment : les blocs
// prennent l'espacement de la page.
export default function ModListTab({ mods }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const list = mods.data?.mods ?? [];
  const query = search.trim();
  // L'ordre de chargement reste celui de la liste complète : monter ou
  // descendre pendant une recherche agit sur la vraie position.
  const matches = (id: number, info: ArkModInfo | null | undefined) =>
    !query ||
    matchesModSearch(
      [info?.name ?? "", ...(info?.authors ?? []), `${id}`],
      query,
    );
  const visible = list
    .map((mod, index) => ({ mod, index }))
    .filter(({ mod }) => matches(mod.id, mod.info));
  // Même recherche pour les mods téléchargés hors liste (section du bas).
  const downloaded = (mods.data?.downloadedNotListed ?? []).filter((info) =>
    matches(info.id, info),
  );
  // « 13 mods · 1 passif · 1 désactivé » : seulement les états présents.
  const passiveCount = list.filter(
    (mod) => arkModState(mod) === "passive",
  ).length;
  const disabledCount = list.filter((mod) => !mod.enabled).length;
  const count = [
    t("arkMods.list.count", { count: list.length }),
    passiveCount ? t("arkMods.list.countPassive", { count: passiveCount }) : "",
    disabledCount
      ? t("arkMods.list.countDisabled", { count: disabledCount })
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <AddModField
        disabled={mods.busy || mods.loading}
        lookupAvailable={mods.data?.lookupAvailable ?? true}
        onAdd={mods.add}
      />

      <ModListPanel
        search={search}
        onSearch={setSearch}
        searchPlaceholder={t("arkMods.list.search")}
        count={
          query
            ? t("arkMods.list.countFiltered", {
                shown: visible.length,
                total: list.length,
              })
            : count
        }
        loading={mods.loading}
        skeletonRow={
          <ArkModRow id={PLACEHOLDER.id} info={PLACEHOLDER} actions={null} />
        }
        emptyText={t("arkMods.list.empty")}
        noMatchText={t("arkMods.list.noMatch")}
        after={
          <DownloadedModsList
            mods={downloaded}
            disabled={mods.busy}
            onAdd={(id) => void mods.add(id)}
            onCleaned={mods.reload}
          />
        }
      >
        {visible.map(({ mod, index }) => (
          <ArkModRow
            key={mod.id}
            id={mod.id}
            info={mod.info}
            dimmed={!mod.enabled}
            chips={
              arkModState(mod) === "passive" && (
                <Chip
                  label={t("arkMods.list.states.passive")}
                  size="small"
                  variant="outlined"
                  sx={{ typography: "micro", height: 18, px: 0.5 }}
                />
              )
            }
            actions={
              <ListedModActions
                modState={arkModState(mod)}
                websiteUrl={mod.info?.websiteUrl ?? null}
                isFirst={index === 0}
                isLast={index === list.length - 1}
                disabled={mods.busy}
                onStateChange={(modState) =>
                  void mods.setState(mod.id, modState)
                }
                onMove={(offset) => mods.move(mod.id, offset)}
                onRemove={() => void mods.remove(mod.id)}
              />
            }
          />
        ))}
      </ModListPanel>
    </>
  );
}
