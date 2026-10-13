import { useEffect, useState } from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { darkTheme } from "./theme";
import { ServerProvider, useServer } from "./context/ServerContext";
import { NotificationProvider } from "./context/NotificationContext";
import Install from "./pages/Install/Install";
import Servers from "./pages/Servers/Servers";
import Settings from "./pages/Settings/Settings";
import SetupWizard from "./pages/Setup/SetupWizard";
import Titlebar from "./components/Titlebar/Titlebar";
import Sidebar from "./components/Sidebar/Sidebar";
import { DEFAULT_GAME, getGamePlugin } from "./games/registry";
import { useUpdateNotices } from "./hooks/useUpdateNotices";

export type Page =
  | "dashboard"
  | "install"
  | "config"
  | "logs"
  | "network"
  | "backup"
  | "schedule"
  | "players"
  | "mods"
  | "servers"
  | "settings"
  // Assistant de démarrage : hors Sidebar, ouvert sans serveur ou depuis Serveurs
  | "setup";

// Pages indépendantes du jeu / du serveur actif (toujours affichées)
export const GLOBAL_PAGES: Page[] = ["servers", "settings"];

function AppShell() {
  const [page, setPage] = useState<Page>("dashboard");
  const { state, refreshServers } = useServer();
  useUpdateNotices({
    openInstallPage: () => setPage("install"),
    openModsPage: () => setPage("mods"),
  });

  // Premier lancement (aucun serveur) : l'assistant plutôt qu'une app vide
  useEffect(() => {
    refreshServers()
      .then((list) => list.length === 0 && setPage("setup"))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gameType = state.activeServer?.gameType ?? DEFAULT_GAME;

  // Si le serveur actif change de jeu et que la page courante n'existe pas
  // pour ce jeu (ex: "mods" en quittant Valheim), on retombe sur le
  // dashboard plutôt que d'afficher un écran vide.
  useEffect(() => {
    if (page === "install" || page === "setup" || GLOBAL_PAGES.includes(page))
      return;
    const supported = getGamePlugin(gameType)?.supportedPages ?? [];
    if (!supported.includes(page)) setPage("dashboard");
  }, [gameType, page]);

  const renderPage = () => {
    if (page === "install") return <Install />;
    if (page === "settings") return <Settings />;
    if (page === "setup")
      return <SetupWizard onFinish={() => setPage("dashboard")} />;
    if (page === "servers")
      return <Servers onOpenSetup={() => setPage("setup")} />;
    const Component = getGamePlugin(gameType)?.pages[page];
    return Component ? <Component /> : null;
  };

  // Clé composée : changement de page OU de serveur actif → re-mount complet,
  // donc tous les useEffect/state des pages se réinitialisent avec les bonnes
  // données du nouveau serveur. Sauf pour les pages globales.
  const pageKey =
    GLOBAL_PAGES.includes(page) || page === "setup"
      ? page
      : `${page}:${state.activeServerId ?? "none"}`;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Titlebar />
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar currentPage={page} onNavigate={setPage} />
        <Box component="main" sx={{ flex: 1, overflow: "auto", p: 3 }}>
          <Box key={pageKey}>{renderPage()}</Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <NotificationProvider>
        <ServerProvider>
          <AppShell />
        </ServerProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
