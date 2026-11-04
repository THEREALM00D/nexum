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

// Pas de page Joueurs (ni API ni RCON) ni de page Mods (pas de mods
// serveur). Serveur gourmand : ~4,4 Go de RAM au repos d'après la FAQ
// officielle, 30 Go de disque conseillés.
export const enshroudedPlugin: GamePlugin = {
  id: "enshrouded",
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
  requirements: { ramGb: 6, diskGb: 30 },
  i18n: {
    fr: {
      ...dashboardFr,
      ...configFr,
      ...logsFr,
      ...networkFr,
      ...backupFr,
      ...scheduleFr,
    },
    en: {
      ...dashboardEn,
      ...configEn,
      ...logsEn,
      ...networkEn,
      ...backupEn,
      ...scheduleEn,
    },
  },
};
