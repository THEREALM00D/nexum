import type { GamePlugin } from "../types";
import Dashboard from "./pages/Dashboard/Dashboard";
import Config from "./pages/Config/Config";
import Logs from "./pages/Logs/Logs";
import Network from "./pages/Network/Network";
import Backup from "./pages/Backup/Backup";
import Schedule from "./pages/Schedule/Schedule";
import Mods from "./pages/Mods/Mods";
import Players from "../../components/players/Players";
import dashboardFr from "./pages/Dashboard/__i18n__/fr";
import dashboardEn from "./pages/Dashboard/__i18n__/en";
import configFr from "./pages/Config/__i18n__/fr";
import configEn from "./pages/Config/__i18n__/en";
import logsFr from "../../components/server/__i18n__/fr";
import logsEn from "../../components/server/__i18n__/en";
import networkFr from "./pages/Network/__i18n__/fr";
import networkEn from "./pages/Network/__i18n__/en";
import backupFr from "./pages/Backup/__i18n__/fr";
import backupEn from "./pages/Backup/__i18n__/en";
import scheduleFr from "./pages/Schedule/__i18n__/fr";
import scheduleEn from "./pages/Schedule/__i18n__/en";
import modsFr from "./pages/Mods/__i18n__/fr";
import modsEn from "./pages/Mods/__i18n__/en";
import playersFr from "../../components/players/__i18n__/fr";
import playersEn from "../../components/players/__i18n__/en";

export const valheimPlugin: GamePlugin = {
  id: "valheim",
  supportedPages: [
    "dashboard",
    "install",
    "config",
    "logs",
    "network",
    "backup",
    "schedule",
    "mods",
    "players",
  ],
  pages: {
    dashboard: Dashboard,
    config: Config,
    logs: Logs,
    network: Network,
    backup: Backup,
    schedule: Schedule,
    mods: Mods,
    players: Players,
  },
  i18n: {
    fr: {
      ...dashboardFr,
      ...configFr,
      ...logsFr,
      ...networkFr,
      ...backupFr,
      ...scheduleFr,
      ...modsFr,
      ...playersFr,
    },
    en: {
      ...dashboardEn,
      ...configEn,
      ...logsEn,
      ...networkEn,
      ...backupEn,
      ...scheduleEn,
      ...modsEn,
      ...playersEn,
    },
  },
};
