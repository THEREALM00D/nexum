import { Box, Divider, IconButton, List, Tooltip } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTranslation } from "react-i18next";
import { GLOBAL_PAGES, type Page } from "../../App";
import { useServer } from "../../context/ServerContext";
import { DEFAULT_GAME, getGamePlugin } from "../../games/registry";
import { useSidebarCollapsed } from "./useSidebarCollapsed";
import ServerSwitcher from "./ServerSwitcher";
import DiscordButton from "./DiscordButton";
import SidebarFooter from "./SidebarFooter";
import SidebarNavItem from "./SidebarNavItem";
import { navItems, type NavItem } from "./navItems";
import LoadingSkeleton from "../common/LoadingSkeleton";
import SectionTitle from "../common/SectionTitle";

const EXPANDED_WIDTH = 220;
const COLLAPSED_WIDTH = 56;

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { state } = useServer();
  const { t } = useTranslation();
  const plugin = getGamePlugin(state.activeServer?.gameType ?? DEFAULT_GAME);
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();

  const renderItem = ({ id, labelKey, icon }: NavItem) => (
    <SidebarNavItem
      key={id}
      label={t(labelKey)}
      icon={icon}
      active={currentPage === id}
      collapsed={collapsed}
      onClick={() => onNavigate(id)}
    />
  );

  // Jeu du serveur actif pas encore connu : entrées en skeleton plutôt que
  // celles du jeu par défaut
  const renderGamePage = (item: NavItem) =>
    state.loaded ? (
      renderItem(item)
    ) : (
      <LoadingSkeleton key={item.id} loading fullWidth>
        {renderItem(item)}
      </LoadingSkeleton>
    );

  const gamePages = navItems.filter(({ id }) => !GLOBAL_PAGES.includes(id));
  const pages = state.loaded
    ? gamePages.filter(({ id }) => plugin?.supportedPages.includes(id))
    : gamePages.slice(0, 7);
  const maintenancePages = pages.filter((p) => p.maintenance);

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
          <IconButton size="small" onClick={toggleCollapsed}>
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

      {/* Pages du jeu / du serveur actif — seule zone qui défile si la
          fenêtre est trop basse : le bas de la barre reste toujours visible. */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <List dense sx={{ py: 1, px: collapsed ? 0.5 : 1 }}>
          {pages.filter((p) => !p.maintenance).map(renderGamePage)}
          {maintenancePages.length > 0 &&
            (collapsed ? (
              <Divider sx={{ my: 0.5 }} />
            ) : (
              <SectionTitle
                component="div"
                sx={{ px: 1.25, pt: 1.5, pb: 0.75 }}
              >
                {t("sidebar.maintenance")}
              </SectionTitle>
            ))}
          {maintenancePages.map(renderGamePage)}
        </List>
      </Box>

      {/* Pages globales, indépendantes du serveur actif */}
      <Box sx={{ flexShrink: 0 }}>
        <Divider sx={{ mx: collapsed ? 0.5 : 1.5 }} />
        <List dense sx={{ py: 1, px: collapsed ? 0.5 : 1 }}>
          {navItems
            .filter(({ id }) => GLOBAL_PAGES.includes(id))
            .map(renderItem)}
        </List>
      </Box>

      <Box sx={{ p: collapsed ? 0.5 : 1, pt: 0, flexShrink: 0 }}>
        {collapsed ? <DiscordButton collapsed /> : <SidebarFooter />}
      </Box>
    </Box>
  );
}
