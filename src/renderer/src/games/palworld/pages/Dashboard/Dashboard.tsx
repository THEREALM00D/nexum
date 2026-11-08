import { Box, Stack } from "@mui/material";
import { useServer } from "../../../../context/ServerContext";
import { usePalApi } from "./hooks/usePalApi";
import ServerHeader from "../../../../components/server/ServerHeader";
import ServerStats from "../../../../components/server/ServerStats";
import SystemStrip from "../../../../components/server/SystemStrip";
import JoinAndLatestLogs from "../../../../components/server/JoinAndLatestLogs";
import ServerInfoPanel from "./components/ServerInfoPanel";
import PlayersPanel from "./components/PlayersPanel";

export default function Dashboard() {
  const { state } = useServer();
  const { status, stats } = state;
  const { serverInfo, metrics, players, setPlayers } = usePalApi(status);

  return (
    <Stack spacing={3}>
      <ServerHeader noServerPathKey="dashboard.noServerPath" />

      <ServerStats
        stats={stats}
        players={{
          count: metrics?.currentplayernum ?? null,
          max: metrics?.maxplayernum,
        }}
      />

      <SystemStrip stats={stats} />

      <JoinAndLatestLogs />

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
