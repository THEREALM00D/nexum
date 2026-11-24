import { useCallback, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import FormPage from "../../../../components/common/FormPage";
import PageHeader from "../../../../components/common/PageHeader";
import { useServer } from "../../../../context/ServerContext";
import SettingsTab from "./settings/SettingsTab";
import ListsTab from "./lists/ListsTab";
import RawFilesTab from "./raw/RawFilesTab";
import LaunchImportDialog from "../../components/launchImport/LaunchImportDialog";
import GeneralTab, { PAGE_WIDTH, configFolder } from "./GeneralTab";
import {
  ARK_CONFIG_TABS,
  ConfigTabContext,
  type ConfigTab,
} from "./ConfigTabs";

const hidden = { display: "none" };

/**
 * Configuration ARK : Général (page partagée ConfigPage), Réglages de jeu
 * (catalogue complet), Listes (Game.ini) et Fichiers bruts. Le serveur
 * réécrit ses deux fichiers à l'arrêt : tout est bloqué tant qu'il tourne.
 * Un onglet est monté à sa 1re visite puis gardé (masqué) : une saisie non
 * enregistrée survit au changement d'onglet, sans monter les quatre à
 * l'ouverture. Réglages de jeu occupe toute la hauteur : sa liste défile
 * seule.
 */
export default function ArkConfig() {
  const { t } = useTranslation();
  const { state } = useServer();
  const [tab, setTab] = useState<ConfigTab>("general");
  const [visited, setVisited] = useState<Set<ConfigTab>>(
    () => new Set(["general"]),
  );
  // Ligne de lancement reprise : tous les onglets relisent leurs fichiers.
  const [importOpen, setImportOpen] = useState(false);
  const [revision, setRevision] = useState(0);

  const select = useCallback((next: ConfigTab) => {
    setTab(next);
    setVisited((current) =>
      current.has(next) ? current : new Set([...current, next]),
    );
  }, []);
  const tabState = useMemo(() => ({ tab, select }), [tab, select]);
  const openImport = useCallback(() => setImportOpen(true), []);
  const mounted = (value: ConfigTab) => visited.has(value);
  const shown = (value: ConfigTab) => (tab === value ? undefined : hidden);
  const fill = tab === "settings";

  // Une seule racine, colonne flex de hauteur contrainte : la marge basse
  // de la page (::after d'App.tsx) se place après son dernier enfant.
  return (
    <ConfigTabContext.Provider value={tabState}>
      <Box
        key={revision}
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <LaunchImportDialog
          open={importOpen}
          onClose={() => setImportOpen(false)}
          onApplied={() => setRevision((current) => current + 1)}
        />
        <Box sx={shown("general")}>
          <GeneralTab onOpenImport={openImport} />
        </Box>
        <Box
          sx={
            tab === "general"
              ? hidden
              : { flex: fill ? "1 1 0" : "0 0 auto", minHeight: 0 }
          }
        >
          <FormPage width={PAGE_WIDTH} fill={fill}>
            <PageHeader
              title={t("arkConfig.title")}
              subtitle={t("arkConfig.subtitle")}
              onOpenFolder={() =>
                window.api.shell.openPath(configFolder(state.serverPath))
              }
              folderTooltip={t("config.openFolder")}
            />
            {ARK_CONFIG_TABS}
            {mounted("settings") && (
              <Box
                sx={fill ? { flex: 1, minHeight: 0, display: "flex" } : hidden}
              >
                <SettingsTab />
              </Box>
            )}
            {mounted("lists") && (
              <Box sx={shown("lists")}>
                <ListsTab />
              </Box>
            )}
            {mounted("raw") && (
              <Box sx={shown("raw")}>
                <RawFilesTab />
              </Box>
            )}
          </FormPage>
        </Box>
      </Box>
    </ConfigTabContext.Provider>
  );
}
