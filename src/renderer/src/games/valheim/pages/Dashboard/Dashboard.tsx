import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../../context/ServerContext";
import ServerHeader from "../../../../components/server/ServerHeader";
import ServerStats from "../../../../components/server/ServerStats";
import SystemStrip from "../../../../components/server/SystemStrip";
import JoinAndLatestLogs from "../../../../components/server/JoinAndLatestLogs";
import { useValheimPlayerCount } from "./hooks/useValheimPlayerCount";
import { useOdinEyeStatus } from "./hooks/useOdinEyeStatus";
import OdinEyeStatusAlert from "./components/OdinEyeStatusAlert";

export default function ValheimDashboard() {
  const { t } = useTranslation();
  const { state } = useServer();
  const { status, stats } = state;
  const running = status === "running";
  const odinEye = useOdinEyeStatus(running, stats?.serverUptime ?? 0);
  const playerCount = useValheimPlayerCount(state.logs, odinEye.count);

  return (
    <Stack spacing={3}>
      <ServerHeader noServerPathKey="valheimDashboard.noServerPath" />

      <ServerStats
        stats={stats}
        players={{
          count: running ? playerCount : null,
          tooltip:
            running && playerCount === null
              ? t("valheimDashboard.players.unknown")
              : undefined,
        }}
      />

      <SystemStrip stats={stats} />

      <JoinAndLatestLogs />

      <OdinEyeStatusAlert status={odinEye} running={running} />
    </Stack>
  );
}
