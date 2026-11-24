import { createContext, useContext } from "react";
import { Tab, Tabs } from "@mui/material";
import { useTranslation } from "react-i18next";

export type ConfigTab = "general" | "settings" | "lists" | "raw";
export const CONFIG_TABS: ConfigTab[] = ["general", "settings", "lists", "raw"];

interface Props {
  tab: ConfigTab;
  onSelect: (tab: ConfigTab) => void;
}

/**
 * Onglets de la page Config ARK : une seule barre pour les quatre onglets
 * (une 2e barre, masquée, se mesurait à 0 px et décalait à l'affichage).
 */
export function ArkConfigTabs({ tab, onSelect }: Props) {
  const { t } = useTranslation();
  return (
    <Tabs
      value={tab}
      onChange={(_, value) => onSelect(value as ConfigTab)}
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
