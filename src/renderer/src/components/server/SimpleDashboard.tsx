import type { ReactNode } from "react";
import { Alert, Stack } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import { useServer } from "../../context/ServerContext";
import ServerHeader from "./ServerHeader";
import ServerStats, { type PlayersStat } from "./ServerStats";
import SystemStrip from "./SystemStrip";
import JoinAndLatestLogs from "./JoinAndLatestLogs";

interface Props {
  noServerPathKey: string;
  /** Bloc d'info du jeu (pas d'API, arrêt, comment rejoindre…). */
  infoKey: string;
  /** Avertissement propre au jeu, affiché sous l'en-tête (ex : réglage manquant). */
  warning?: ReactNode;
  /** Nombre de joueurs, pour un jeu qui le donne (ARK par RCON). */
  players?: PlayersStat;
}

/**
 * Dashboard simple (Astroneer, Dragonwilds, Enshrouded, ARK) : en-tête,
 * statistiques, carte « Rejoindre », infos du jeu. Les jeux avec un panneau
 * d'administration propre (Palworld, Valheim) ont leur Dashboard.
 */
export default function SimpleDashboard({
  noServerPathKey,
  infoKey,
  warning,
  players,
}: Props) {
  const { t } = useTranslation();
  const { state } = useServer();

  return (
    <Stack spacing={3}>
      <ServerHeader noServerPathKey={noServerPathKey} />

      {warning}

      <ServerStats stats={state.stats} players={players} />

      <SystemStrip stats={state.stats} />

      <JoinAndLatestLogs />

      <Alert severity="info" icon={<InfoOutlinedIcon fontSize="inherit" />}>
        {t(infoKey)}
      </Alert>
    </Stack>
  );
}
