import type { ReactNode } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import { useServer } from "../../context/ServerContext";
import { useServerControls } from "../../hooks/useServerControls";
import ServerControls from "./ServerControls";
import StatsGrid from "./StatsGrid";
import JoinServerCard from "./JoinServerCard";
import Logs from "./Logs";

interface Props {
  titleKey: string;
  noServerPathKey: string;
  /** Bloc d'info du jeu (pas d'API, arrêt, comment rejoindre…). */
  infoKey: string;
  /** Avertissement propre au jeu, affiché sous le titre (ex : réglage manquant). */
  warning?: ReactNode;
  /** Log du serveur sous les cartes. */
  showLogs?: boolean;
}

/**
 * Dashboard des jeux sans API d'administration (Astroneer, Dragonwilds,
 * Enshrouded) : contrôles, statistiques, carte « Rejoindre », infos du jeu.
 */
export default function SimpleDashboard({
  titleKey,
  noServerPathKey,
  infoKey,
  warning,
  showLogs,
}: Props) {
  const { t } = useTranslation();
  const { state } = useServer();
  const { start, stop, restart, canStart, canStop } = useServerControls();
  const { status, stats, serverPath } = state;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6">{t(titleKey)}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {serverPath || t(noServerPathKey)}
        </Typography>
      </Box>

      {warning}

      <ServerControls
        status={status}
        canStart={canStart}
        canStop={canStop}
        onStart={start}
        onStop={stop}
        onRestart={restart}
      />

      <StatsGrid stats={stats} />

      <JoinServerCard />

      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="inherit" />}
        sx={{ fontSize: 13 }}
      >
        {t(infoKey)}
      </Alert>

      {/* Hauteur suivant la fenêtre : 400 px fixes poussaient le bas du
          log hors de l'écran sur un portable (768 px de haut). */}
      {showLogs && (
        <Box sx={{ height: "clamp(220px, 40vh, 400px)" }}>
          <Logs />
        </Box>
      )}
    </Stack>
  );
}
