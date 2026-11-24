import { createContext, useContext } from "react";
import { Tab, Tabs } from "@mui/material";
import { useTranslation } from "react-i18next";

export type ConfigTab = "general" | "settings" | "lists" | "raw";
export const CONFIG_TABS: ConfigTab[] = ["general", "settings", "lists", "raw"];

interface TabState {
  tab: ConfigTab;
  select: (tab: ConfigTab) => void;
}

export const ConfigTabContext = createContext<TabState>({
  tab: "general",
  select: () => {},
});

/**
 * Onglets de la page Config ARK. Lus par contexte : l'élément passé à
 * ConfigPage (`tabs`) reste le même à chaque changement d'onglet, sinon
 * toute la page (et l'onglet Général) était re-rendue à chaque clic.
 */
export function ArkConfigTabs() {
  const { t } = useTranslation();
  const { tab, select } = useContext(ConfigTabContext);
  return (
    <Tabs
      value={tab}
      onChange={(_, value) => select(value as ConfigTab)}
      variant="scrollable"
      allowScrollButtonsMobile
    >
      {CONFIG_TABS.map((value) => (
        <Tab key={value} value={value} label={t(`arkConfigTabs.${value}`)} />
      ))}
    </Tabs>
  );
}

interface SavedState {
  /** Incrémenté à chaque enregistrement d'un onglet. */
  revision: number;
  saved: () => void;
}

/**
 * Les onglets restent montés : après l'enregistrement de l'un, les autres
 * relisent leurs fichiers (s'ils n'ont pas de saisie en cours). Sinon
 * Fichiers bruts réécrivait le texte lu à sa 1re visite et annulait en
 * silence ce qu'un autre onglet venait d'enregistrer.
 */
export const ConfigSavedContext = createContext<SavedState>({
  revision: 0,
  saved: () => {},
});

export const useConfigSaved = () => useContext(ConfigSavedContext);

/** Élément stable : ne change jamais d'identité. */
export const ARK_CONFIG_TABS = <ArkConfigTabs />;
