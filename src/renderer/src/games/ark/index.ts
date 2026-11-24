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
import settingsFr from "./pages/Config/settings/__i18n__/fr";
import settingsEn from "./pages/Config/settings/__i18n__/en";
import networkFr from "./pages/Network/__i18n__/fr";
import networkEn from "./pages/Network/__i18n__/en";
import backupFr from "./pages/Backup/__i18n__/fr";
import backupEn from "./pages/Backup/__i18n__/en";
import scheduleFr from "./pages/Schedule/__i18n__/fr";
import scheduleEn from "./pages/Schedule/__i18n__/en";
import modsFr from "./pages/Mods/__i18n__/fr";
import modsEn from "./pages/Mods/__i18n__/en";
import logsFr from "../../components/server/__i18n__/fr";
import logsEn from "../../components/server/__i18n__/en";
import configPageFr from "../../components/config/__i18n__/fr";
import configPageEn from "../../components/config/__i18n__/en";
import playersFr from "../../components/players/__i18n__/fr";
import playersEn from "../../components/players/__i18n__/en";
import modBrowseFr from "../../components/mods/__i18n__/fr";
import modBrowseEn from "../../components/mods/__i18n__/en";

// Joueurs : ListPlayers en RCON (src/main/games/ark/ArkRconClient.ts). Mods :
// liste d'ID CurseForge, téléchargés par le serveur lui-même (page Mods).
export const arkPlugin: GamePlugin = {
  id: "ark",
  supportedPages: [
    "dashboard",
    "install",
    "config",
    "mods",
    "logs",
    "players",
    "network",
    "backup",
    "schedule",
  ],
  pages: {
    dashboard: Dashboard,
    config: Config,
    mods: Mods,
    logs: Logs,
    players: Players,
    network: Network,
    backup: Backup,
    schedule: Schedule,
  },
  // Mesuré : ~10 Go de RAM au repos sans joueur, 12,3 Go d'installation.
  requirements: { ramGb: 12, diskGb: 20 },
  i18n: {
    fr: {
      ...dashboardFr,
      ...configFr,
      ...settingsFr,
      ...configPageFr,
      ...logsFr,
      ...playersFr,
      ...networkFr,
      ...backupFr,
      ...scheduleFr,
      ...modsFr,
      ...modBrowseFr,
    },
    en: {
      ...dashboardEn,
      ...configEn,
      ...settingsEn,
      ...configPageEn,
      ...logsEn,
      ...playersEn,
      ...networkEn,
      ...backupEn,
      ...scheduleEn,
      ...modsEn,
      ...modBrowseEn,
    },
  },
};
