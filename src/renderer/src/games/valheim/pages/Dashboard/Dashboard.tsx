import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../../context/ServerContext";
import { useServerControls } from "../../../../hooks/useServerControls";
import ServerControls from "../../../../components/server/ServerControls";
import StatsGrid from "../../../../components/server/StatsGrid";
import JoinServerCard from "../../../../components/server/JoinServerCard";
import Logs from "../../../../components/server/Logs";
import { useValheimPlayerCount } from "./hooks/useValheimPlayerCount";
import { useOdinEyeStatus } from "./hooks/useOdinEyeStatus";
import PlayerCountCard from "./components/PlayerCountCard";
import OdinEyeStatusAlert from "./components/OdinEyeStatusAlert";

export default function ValheimDashboard() {
  const { t } = useTranslation();
  const { state } = useServer();
  const { start, stop, restart, canStart, canStop } = useServerControls();
  const { status, stats, serverPath } = state;
  const running = status === "running";
  const odinEye = useOdinEyeStatus(running, stats?.serverUptime ?? 0);
  const playerCount = useValheimPlayerCount(state.logs, odinEye.count);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6">{t("valheimDashboard.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {serverPath || t("valheimDashboard.noServerPath")}
        </Typography>
      </Box>

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

      {running && <PlayerCountCard count={playerCount} />}

      <OdinEyeStatusAlert status={odinEye} running={running} />

      {/* Hauteur suivant la fenêtre : 400 px fixes poussaient le bas du
          log hors de l'écran sur un portable (768 px de haut). */}
      <Box sx={{ height: "clamp(220px, 40vh, 400px)" }}>
        <Logs />
      </Box>
    </Stack>
  );
}
