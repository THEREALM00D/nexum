import { useState } from "react";
import { Alert, Box, Tab, Tabs } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import ConfigPage from "../../../../components/config/ConfigPage";
import FormPage from "../../../../components/common/FormPage";
import PageHeader from "../../../../components/common/PageHeader";
import { useServer } from "../../../../context/ServerContext";
import { arkConfigService } from "../../services/configService";
import { FIELD_GROUPS } from "./fields";
import SettingsTab from "./settings/SettingsTab";
import ListsTab from "./lists/ListsTab";
import RawFilesTab from "./raw/RawFilesTab";

type ConfigTab = "general" | "settings" | "lists" | "raw";
const TABS: ConfigTab[] = ["general", "settings", "lists", "raw"];
// Plus large que les autres pages Config : tableaux de l'onglet Listes.
const PAGE_WIDTH = 960;

const configFolder = (serverPath: string) =>
  `${serverPath}/ShooterGame/Saved/Config/WindowsServer`;

/**
 * Configuration ARK : Général (page partagée ConfigPage), Réglages de jeu
 * (catalogue complet), Listes (Game.ini) et Fichiers bruts. Le serveur
 * réécrit ses deux fichiers à l'arrêt : tout est bloqué tant qu'il tourne.
 * Les onglets restent montés (masqués) : une saisie non enregistrée survit
 * au changement d'onglet.
 */
export default function ArkConfig() {
  const { t } = useTranslation();
  const { state } = useServer();
  const [tab, setTab] = useState<ConfigTab>("general");

  const tabs = (
    <Tabs
      value={tab}
      onChange={(_, value) => setTab(value as ConfigTab)}
      variant="scrollable"
      allowScrollButtonsMobile
    >
      {TABS.map((value) => (
        <Tab key={value} value={value} label={t(`arkConfigTabs.${value}`)} />
      ))}
    </Tabs>
  );

  const shown = (value: ConfigTab | "advanced") =>
    (value === "advanced" ? tab !== "general" : tab === value)
      ? undefined
      : { display: "none" };

  // Une seule racine : la marge basse de la page (::after d'App.tsx) se
  // place après son dernier enfant.
  return (
    <Box>
      <Box sx={shown("general")}>
        <ConfigPage
          titleKey="arkConfig.title"
          subtitleKey="arkConfig.subtitle"
          folderPath={configFolder}
          fieldGroups={FIELD_GROUPS}
          i18nFieldsPrefix="arkConfig.fields"
          readConfig={arkConfigService.readConfig}
          writeConfig={arkConfigService.writeConfig}
          // Le serveur réécrit GameUserSettings.ini à l'arrêt (vérifié).
          lockWhileRunning
          tabs={tabs}
          width={PAGE_WIDTH}
          notice={
            <Alert
              severity="info"
              icon={<InfoOutlinedIcon fontSize="inherit" />}
            >
              {t("arkConfig.notice")}
            </Alert>
          }
        />
      </Box>
      <Box sx={shown("advanced")}>
        <FormPage width={PAGE_WIDTH}>
          <PageHeader
            title={t("arkConfig.title")}
            subtitle={t("arkConfig.subtitle")}
            onOpenFolder={() =>
              window.api.shell.openPath(configFolder(state.serverPath))
            }
            folderTooltip={t("config.openFolder")}
          />
          {tabs}
          <Box sx={shown("settings")}>
            <SettingsTab />
          </Box>
          <Box sx={shown("lists")}>
            <ListsTab />
          </Box>
          <Box sx={shown("raw")}>
            <RawFilesTab />
          </Box>
        </FormPage>
      </Box>
    </Box>
  );
}
