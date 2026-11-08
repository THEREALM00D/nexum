import DashboardIcon from "@mui/icons-material/Dashboard";
import DownloadIcon from "@mui/icons-material/Download";
import SettingsIcon from "@mui/icons-material/Settings";
import ArticleIcon from "@mui/icons-material/Article";
import RouterIcon from "@mui/icons-material/Router";
import BackupIcon from "@mui/icons-material/Backup";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PeopleIcon from "@mui/icons-material/People";
import ExtensionIcon from "@mui/icons-material/Extension";
import StorageIcon from "@mui/icons-material/Storage";
import TuneIcon from "@mui/icons-material/Tune";
import type { ReactNode } from "react";
import type { Page } from "../../App";

export interface NavItem {
  id: Page;
  labelKey: string;
  icon: ReactNode;
  /** Page peu visitée, regroupée sous « Maintenance ». */
  maintenance?: boolean;
}

// Entrées de la Sidebar, dans l'ordre d'affichage : par fréquence d'usage.
export const navItems: NavItem[] = [
  {
    id: "dashboard",
    labelKey: "sidebar.dashboard",
    icon: <DashboardIcon fontSize="small" />,
  },
  {
    id: "logs",
    labelKey: "sidebar.logs",
    icon: <ArticleIcon fontSize="small" />,
  },
  {
    id: "players",
    labelKey: "sidebar.players",
    icon: <PeopleIcon fontSize="small" />,
  },
  {
    id: "config",
    labelKey: "sidebar.config",
    icon: <SettingsIcon fontSize="small" />,
  },
  {
    id: "mods",
    labelKey: "sidebar.mods",
    icon: <ExtensionIcon fontSize="small" />,
  },
  {
    id: "backup",
    labelKey: "sidebar.backup",
    icon: <BackupIcon fontSize="small" />,
    maintenance: true,
  },
  {
    id: "schedule",
    labelKey: "sidebar.schedule",
    icon: <ScheduleIcon fontSize="small" />,
    maintenance: true,
  },
  {
    id: "network",
    labelKey: "sidebar.network",
    icon: <RouterIcon fontSize="small" />,
    maintenance: true,
  },
  {
    id: "install",
    labelKey: "sidebar.install",
    icon: <DownloadIcon fontSize="small" />,
    maintenance: true,
  },
  {
    id: "servers",
    labelKey: "sidebar.servers",
    icon: <StorageIcon fontSize="small" />,
  },
  {
    id: "settings",
    labelKey: "sidebar.settings",
    icon: <TuneIcon fontSize="small" />,
  },
];
