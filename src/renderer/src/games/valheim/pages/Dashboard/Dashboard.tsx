import { Alert, Box, Stack, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../../context/ServerContext";
import { useServerControls } from "../../../../hooks/useServerControls";
import ServerControls from "../../../../components/server/ServerControls";
import StatsGrid from "../../../../components/server/StatsGrid";
import Logs from "../../../../components/server/Logs";
import { useValheimPlayerCount } from "./hooks/useValheimPlayerCount";
import { useOdinEyeOnlineCount } from "./hooks/useOdinEyeOnlineCount";
import PlayerCountCard from "./components/PlayerCountCard";

export default function ValheimDashboard() {
  const { t } = useTranslation();
  const { state } = useServer();
  const { start, stop, restart, canStart, canStop } = useServerControls();
  const { status, stats, serverPath } = state;
  const odinEyeCount = useOdinEyeOnlineCount();
  const playerCount = useValheimPlayerCount(state.logs, odinEyeCount);

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

      {stats ? (
        <StatsGrid stats={stats} />
      ) : (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t("valheimDashboard.waitingStats")}
        </Typography>
      )}

      {status === "running" && <PlayerCountCard count={playerCount} />}

      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="inherit" />}
        sx={{ fontSize: 13 }}
      >
        {t("valheimDashboard.noApi")}
      </Alert>

      <Box sx={{ height: 400 }}>
        <Logs />
      </Box>
    </Stack>
  );
}
