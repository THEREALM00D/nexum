import type { ReactNode } from "react";
import { Alert, Box, Stack } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import { useServer } from "../../context/ServerContext";
import ServerHeader from "./ServerHeader";
import ServerStats from "./ServerStats";
import SystemStrip from "./SystemStrip";
import JoinServerCard from "./JoinServerCard";
import Logs from "./Logs";

interface Props {
  noServerPathKey: string;
  /** Bloc d'info du jeu (pas d'API, arrêt, comment rejoindre…). */
  infoKey: string;
  /** Avertissement propre au jeu, affiché sous l'en-tête (ex : réglage manquant). */
  warning?: ReactNode;
  /** Log du serveur sous les cartes. */
  showLogs?: boolean;
}

/**
 * Dashboard des jeux sans API d'administration (Astroneer, Dragonwilds,
 * Enshrouded) : en-tête, statistiques, carte « Rejoindre », infos du jeu.
 */
export default function SimpleDashboard({
  noServerPathKey,
  infoKey,
  warning,
  showLogs,
}: Props) {
  const { t } = useTranslation();
  const { state } = useServer();

  return (
    <Stack spacing={3}>
      <ServerHeader noServerPathKey={noServerPathKey} />

      {warning}

      <ServerStats stats={state.stats} />

      <SystemStrip stats={state.stats} />

      <JoinServerCard />

      <Alert severity="info" icon={<InfoOutlinedIcon fontSize="inherit" />}>
        {t(infoKey)}
      </Alert>

      {/* Hauteur suivant la fenêtre : 400 px fixes poussaient le bas du
          log hors de l'écran sur un portable (768 px de haut). */}
      {showLogs && (
        <Box sx={{ height: "clamp(220px, 40vh, 400px)" }}>
          <Logs embedded />
        </Box>
      )}
    </Stack>
  );
}
