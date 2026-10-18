import type { GamePlugin } from "../types";
import Dashboard from "./pages/Dashboard/Dashboard";
import Config from "./pages/Config/Config";
import Logs from "./pages/Logs/Logs";
import Network from "./pages/Network/Network";
import Backup from "./pages/Backup/Backup";
import Schedule from "./pages/Schedule/Schedule";
import dashboardFr from "./pages/Dashboard/__i18n__/fr";
import dashboardEn from "./pages/Dashboard/__i18n__/en";
import configFr from "./pages/Config/__i18n__/fr";
import configEn from "./pages/Config/__i18n__/en";
import networkFr from "./pages/Network/__i18n__/fr";
import networkEn from "./pages/Network/__i18n__/en";
import backupFr from "./pages/Backup/__i18n__/fr";
import backupEn from "./pages/Backup/__i18n__/en";
import scheduleFr from "./pages/Schedule/__i18n__/fr";
import scheduleEn from "./pages/Schedule/__i18n__/en";
import logsFr from "../../components/server/__i18n__/fr";
import logsEn from "../../components/server/__i18n__/en";
import configPageFr from "../../components/config/__i18n__/fr";
import configPageEn from "../../components/config/__i18n__/en";

// Pas de page Joueurs (ni API ni RCON, voir CLAUDE.md « Config INI
// Dragonwilds ») ni de page Mods (pas de mods serveur documentés).
export const dragonwildsPlugin: GamePlugin = {
  id: "dragonwilds",
  supportedPages: [
    "dashboard",
    "install",
    "config",
    "logs",
    "network",
    "backup",
    "schedule",
  ],
  pages: {
    dashboard: Dashboard,
    config: Config,
    logs: Logs,
    network: Network,
    backup: Backup,
    schedule: Schedule,
  },
  i18n: {
    fr: {
      ...dashboardFr,
      ...configFr,
      ...configPageFr,
      ...logsFr,
      ...networkFr,
      ...backupFr,
      ...scheduleFr,
    },
    en: {
      ...dashboardEn,
      ...configEn,
      ...configPageEn,
      ...logsEn,
      ...networkEn,
      ...backupEn,
      ...scheduleEn,
    },
  },
};
