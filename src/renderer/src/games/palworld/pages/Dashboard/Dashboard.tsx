import { Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../../context/ServerContext";
import { useServerControls } from "../../../../hooks/useServerControls";
import { usePalApi } from "./hooks/usePalApi";
import ServerControls from "../../../../components/server/ServerControls";
import StatsGrid from "../../../../components/server/StatsGrid";
import JoinServerCard from "../../../../components/server/JoinServerCard";
import ServerInfoPanel from "./components/ServerInfoPanel";
import PlayersPanel from "./components/PlayersPanel";
import PageHeader from "../../../../components/common/PageHeader";

export default function Dashboard() {
  const { t } = useTranslation();
  const { state } = useServer();
  const { start, stop, restart, canStart, canStop } = useServerControls();
  const { status, stats, serverPath } = state;
  const { serverInfo, metrics, players, setPlayers } = usePalApi(status);

  return (
    <Stack spacing={3}>
      <PageHeader
        title={t("dashboard.title")}
        subtitle={serverPath || t("dashboard.noServerPath")}
      />

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

      {serverInfo && (
        // Côte à côte sur grand écran, l'un sous l'autre sur un portable
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <ServerInfoPanel serverInfo={serverInfo} metrics={metrics} />
          <PlayersPanel players={players} setPlayers={setPlayers} />
        </Box>
      )}
    </Stack>
  );
}
