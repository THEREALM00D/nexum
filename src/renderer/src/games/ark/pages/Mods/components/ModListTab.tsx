import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ArkModInfo } from "@shared/types";
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
// aux pages Mods, components/mods/ModListPanel), mods téléchargés hors
// liste. Fragment : les blocs prennent l'espacement de la page.
export default function ModListTab({ mods }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const list = mods.data?.mods ?? [];
  const query = search.trim();
  // L'ordre de chargement reste celui de la liste complète : monter ou
  // descendre pendant une recherche agit sur la vraie position.
  const visible = list
    .map((mod, index) => ({ mod, index }))
    .filter(
      ({ mod }) =>
        !query ||
        matchesModSearch(
          [mod.info?.name ?? "", ...(mod.info?.authors ?? []), `${mod.id}`],
          query,
        ),
    );

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
            : t("arkMods.list.count", { count: list.length })
        }
        loading={mods.loading}
        skeletonRow={
          <ArkModRow id={PLACEHOLDER.id} info={PLACEHOLDER} actions={null} />
        }
        emptyText={t("arkMods.list.empty")}
        noMatchText={t("arkMods.list.noMatch")}
        footer={t("arkMods.list.hint")}
      >
        {visible.map(({ mod, index }) => (
          <ArkModRow
            key={mod.id}
            id={mod.id}
            info={mod.info}
            dimmed={!mod.enabled}
            actions={
              <ListedModActions
                enabled={mod.enabled}
                websiteUrl={mod.info?.websiteUrl ?? null}
                isFirst={index === 0}
                isLast={index === list.length - 1}
                disabled={mods.busy}
                onToggle={(enabled) => void mods.toggle(mod.id, enabled)}
                onMove={(offset) => mods.move(mod.id, offset)}
                onRemove={() => void mods.remove(mod.id)}
              />
            }
          />
        ))}
      </ModListPanel>

      <DownloadedModsList
        mods={mods.data?.downloadedNotListed ?? []}
        disabled={mods.busy}
        onAdd={(id) => void mods.add(id)}
      />
    </>
  );
}
