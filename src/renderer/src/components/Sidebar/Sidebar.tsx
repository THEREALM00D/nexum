import { useState } from "react";
import { Box, Chip, Divider, IconButton, List, Tooltip } from "@mui/material";
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
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTranslation } from "react-i18next";
import { GLOBAL_PAGES, type Page } from "../../App";
import { useServer } from "../../context/ServerContext";
import { DEFAULT_GAME, getGamePlugin } from "../../games/registry";
import { STATUS_COLOR } from "../../utils/status";
import ServerSwitcher from "./ServerSwitcher";
import UpdateIndicator from "./UpdateIndicator";
import DiscordButton from "./DiscordButton";
import TuneIcon from "@mui/icons-material/Tune";
import LanguageToggle from "../common/LanguageToggle";
import SidebarNavItem from "./SidebarNavItem";

const EXPANDED_WIDTH = 220;
const COLLAPSED_WIDTH = 56;

const navItems: { id: Page; labelKey: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    labelKey: "sidebar.dashboard",
    icon: <DashboardIcon fontSize="small" />,
  },
  {
    id: "install",
    labelKey: "sidebar.install",
    icon: <DownloadIcon fontSize="small" />,
  },
  {
    id: "config",
    labelKey: "sidebar.config",
    icon: <SettingsIcon fontSize="small" />,
  },
  {
    id: "logs",
    labelKey: "sidebar.logs",
    icon: <ArticleIcon fontSize="small" />,
  },
  {
    id: "network",
    labelKey: "sidebar.network",
    icon: <RouterIcon fontSize="small" />,
  },
  {
    id: "backup",
    labelKey: "sidebar.backup",
    icon: <BackupIcon fontSize="small" />,
  },
  {
    id: "schedule",
    labelKey: "sidebar.schedule",
    icon: <ScheduleIcon fontSize="small" />,
  },
  {
    id: "players",
    labelKey: "sidebar.players",
    icon: <PeopleIcon fontSize="small" />,
  },
  {
    id: "mods",
    labelKey: "sidebar.mods",
    icon: <ExtensionIcon fontSize="small" />,
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

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { state } = useServer();
  const { t } = useTranslation();
  const plugin = getGamePlugin(state.activeServer?.gameType ?? DEFAULT_GAME);
  const [collapsed, setCollapsed] = useState(false);

  const renderItem = ({ id, labelKey, icon }: (typeof navItems)[number]) => (
    <SidebarNavItem
      key={id}
      label={t(labelKey)}
      icon={icon}
      active={currentPage === id}
      collapsed={collapsed}
      onClick={() => onNavigate(id)}
    />
  );

  return (
    <Box
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        flexShrink: 0,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        transition: "width 0.2s ease",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-end",
          px: 0.5,
          pt: 0.5,
        }}
      >
        <Tooltip
          title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          placement="right"
        >
          <IconButton size="small" onClick={() => setCollapsed((v) => !v)}>
            {collapsed ? (
              <ChevronRightIcon fontSize="small" />
            ) : (
              <ChevronLeftIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <ServerSwitcher onManage={onNavigate} collapsed={collapsed} />

      <Divider sx={{ mx: collapsed ? 0.5 : 1.5, mb: 1 }} />

      {/* Pages du jeu / du serveur actif */}
      <List dense sx={{ py: 1, px: collapsed ? 0.5 : 1 }}>
        {navItems
          .filter(
            ({ id }) =>
              !GLOBAL_PAGES.includes(id) && plugin?.supportedPages.includes(id),
          )
          .map(renderItem)}
      </List>

      {/* Pages globales, indépendantes du serveur actif */}
      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ mx: collapsed ? 0.5 : 1.5 }} />
        <List dense sx={{ py: 1, px: collapsed ? 0.5 : 1 }}>
          {navItems
            .filter(({ id }) => GLOBAL_PAGES.includes(id))
            .map(renderItem)}
        </List>
      </Box>

      <Box sx={{ p: collapsed ? 0.5 : 2, pt: 0 }}>
        {!collapsed && (
          <>
            <LanguageToggle sx={{ mb: 1.5 }} />
            <Divider sx={{ mb: 1.5 }} />
            <Chip
              label={t(`status.${state.status}`, {
                defaultValue: state.status,
              })}
              color={STATUS_COLOR[state.status] ?? "default"}
              size="small"
              variant="outlined"
              sx={{ width: "100%", fontSize: 11, mb: 1 }}
            />
            <DiscordButton collapsed={false} />
            <UpdateIndicator />
          </>
        )}
        {collapsed && <DiscordButton collapsed />}
      </Box>
    </Box>
  );
}
