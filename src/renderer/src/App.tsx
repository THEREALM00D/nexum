import { useEffect, useLayoutEffect, useState } from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { COMPACT_MEDIA, CONTENT_MAX_WIDTH, darkTheme } from "./theme";
import { ServerProvider, useServer } from "./context/ServerContext";
import { NotificationProvider } from "./context/NotificationContext";
import Install from "./pages/Install/Install";
import Servers from "./pages/Servers/Servers";
import Settings from "./pages/Settings/Settings";
import SetupWizard from "./pages/Setup/SetupWizard";
import Titlebar from "./components/Titlebar/Titlebar";
import Sidebar from "./components/Sidebar/Sidebar";
import PageSkeleton from "./components/common/PageSkeleton";
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

// Pages qui gardent toute la largeur de la fenêtre (lignes de log longues)
const FULL_WIDTH_PAGES: Page[] = ["logs"];

function AppShell() {
  const [page, setPage] = useState<Page>("dashboard");
  const { state } = useServer();
  useUpdateNotices({
    openInstallPage: () => setPage("install"),
    openModsPage: () => setPage("mods"),
  });

  // Premier lancement (aucun serveur) : l'assistant plutôt qu'une app vide.
  // Layout effect : décidé avant l'affichage, le dashboard ne clignote pas.
  useLayoutEffect(() => {
    if (state.loaded && state.servers.length === 0) setPage("setup");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.loaded]);

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
        <Box
          component="main"
          // Pas de marge basse ici : elle se placerait sous le wrapper
          // (height: 100%), pas sous le contenu qui en déborde → le bas des
          // pages longues touchait le bord. Elle est portée par la page.
          sx={{
            flex: 1,
            overflow: "auto",
            px: 3,
            pt: 3,
            [COMPACT_MEDIA]: { px: 2, pt: 2 },
          }}
        >
          {/* Hauteur définie : une page peut remplir l'écran (Logs) et ne faire
              défiler que sa zone de log. Les pages plus hautes débordent et
              la zone principale défile comme avant. */}
          {/* Contenu centré, largeur bornée : sur un grand écran la page ne
              s'étire pas d'un bord à l'autre (sauf les logs, où chaque
              colonne compte). */}
          <Box
            key={pageKey}
            sx={{
              height: "100%",
              maxWidth: FULL_WIDTH_PAGES.includes(page)
                ? undefined
                : CONTENT_MAX_WIDTH,
              mx: "auto",
              // Marge basse = pseudo-élément en fin de page, pas un padding :
              // une page à hauteur 100 % (Sauvegardes, Joueurs, Logs) trop
              // haute pour la fenêtre déborde de sa propre boîte, et son
              // padding resterait avant le débordement. Le ::after, lui, se
              // place toujours après le dernier élément (bloc ou colonne
              // flex), même débordant. Ne pas le remplacer par
              // `minHeight: min-content` : les listes à défilement interne
              // (ScrollPanel) s'étireraient sur toute leur longueur.
              "& > :last-child::after": {
                content: '""',
                display: "block",
                flexShrink: 0,
                height: 24,
                [COMPACT_MEDIA]: { height: 16 },
              },
            }}
          >
            {/* Serveurs pas encore lus : on ne sait pas quel jeu afficher */}
            {state.loaded ? renderPage() : <PageSkeleton />}
          </Box>
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
