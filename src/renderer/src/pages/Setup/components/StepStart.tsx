import { Paper, Stack } from "@mui/material";
import { useServer } from "../../../context/ServerContext";
import { useServerControls } from "../../../hooks/useServerControls";
import ServerControls from "../../../components/server/ServerControls";
import JoinServerCard from "../../../components/server/JoinServerCard";

/** Dernière étape : démarrer le serveur et voir comment le rejoindre. */
export default function StepStart() {
  const { state } = useServer();
  const { start, stop, restart, canStart, canStop } = useServerControls();
  return (
    <Stack spacing={3}>
      {/* Sans onViewLogs : on ne quitte pas l'assistant pour lire les logs */}
      <Paper sx={{ p: 2.5, display: "flex", justifyContent: "center" }}>
        <ServerControls
          status={state.status}
          canStart={canStart}
          canStop={canStop}
          onStart={start}
          onStop={stop}
          onRestart={restart}
          uptime={state.stats?.serverUptime}
        />
      </Paper>
      <JoinServerCard />
    </Stack>
  );
}
