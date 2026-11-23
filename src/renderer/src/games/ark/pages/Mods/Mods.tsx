import { useState } from "react";
import { Stack, Tab, Tabs } from "@mui/material";
import { useTranslation } from "react-i18next";
import PageHeader from "../../../../components/common/PageHeader";
import LoadingSkeleton from "../../../../components/common/LoadingSkeleton";
import { useServer } from "../../../../context/ServerContext";
import { useArkMods } from "./hooks/useArkMods";
import { useArkModBrowser } from "./hooks/useArkModBrowser";
import ModsNotices from "./components/ModsNotices";
import ModListTab from "./components/ModListTab";
import ModBrowser from "./components/ModBrowser";

type ModsTab = "list" | "browse";

/**
 * Mods CurseForge du serveur : liste ordonnée écrite dans -mods=, téléchargée
 * et mise à jour par le serveur lui-même à chaque démarrage, et recherche
 * CurseForge (onglet Parcourir, seulement dans un build avec clé).
 */
export default function ArkMods() {
  const { t } = useTranslation();
  const { state } = useServer();
  const mods = useArkMods();
  const browser = useArkModBrowser(mods.data?.lookupAvailable === true);
  // Onglets affichés pendant la lecture (sinon ils apparaîtraient après coup
  // dans un build avec clé), puis seulement avec une clé qui a le droit de
  // recherche. Lecture échouée ou build sans clé : Liste seule.
  const browseAvailable =
    mods.loading || (mods.data?.lookupAvailable === true && !browser.forbidden);
  const [tab, setTab] = useState<ModsTab>("list");
  const running = state.status !== "stopped" && state.status !== "crashed";
  const shownTab = browseAvailable ? tab : "list";
  const listedIds = new Set((mods.data?.mods ?? []).map((mod) => mod.id));

  return (
    <Stack spacing={3} sx={{ height: "100%" }}>
      <PageHeader title={t("arkMods.title")} subtitle={t("arkMods.subtitle")} />

      <ModsNotices
        running={running}
        argsMods={mods.data?.argsMods ?? []}
        disabled={mods.busy}
        onTakeFromArgs={() => void mods.takeFromArgs()}
      />

      {browseAvailable && (
        <Tabs
          value={shownTab}
          onChange={(_, value) => setTab(value as ModsTab)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ minHeight: 40, mt: 1 }}
        >
          <Tab
            value="list"
            label={
              <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
                {t("arkMods.tabs.list")}
                <LoadingSkeleton loading={mods.loading}>
                  <span>({mods.data?.mods.length ?? 0})</span>
                </LoadingSkeleton>
              </Stack>
            }
          />
          <Tab value="browse" label={t("arkMods.tabs.browse")} />
        </Tabs>
      )}

      {shownTab === "list" ? (
        <ModListTab mods={mods} />
      ) : (
        <ModBrowser
          browser={browser}
          listedIds={listedIds}
          disabled={mods.busy}
          onAdd={(id) => void mods.add(id)}
        />
      )}
    </Stack>
  );
}
