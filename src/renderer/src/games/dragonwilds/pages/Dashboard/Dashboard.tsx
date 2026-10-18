import { useEffect, useState } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../../context/ServerContext";
import { useServerControls } from "../../../../hooks/useServerControls";
import ServerControls from "../../../../components/server/ServerControls";
import StatsGrid from "../../../../components/server/StatsGrid";
import JoinServerCard from "../../../../components/server/JoinServerCard";
import Logs from "../../../../components/server/Logs";
import { dragonwildsConfigService } from "../../services/configService";

export default function DragonwildsDashboard() {
  const { t } = useTranslation();
  const { state } = useServer();
  const { start, stop, restart, canStart, canStop } = useServerControls();
  const { status, stats, serverPath } = state;
  // Sans Player ID, le démarrage est refusé : on le dit avant le clic.
  const [ownerMissing, setOwnerMissing] = useState(false);

  useEffect(() => {
    if (!serverPath) return;
    dragonwildsConfigService
      .readConfig()
      .then((cfg) => setOwnerMissing(!String(cfg.OwnerId ?? "").trim()))
      .catch(() => {});
  }, [serverPath, status]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6">{t("dragonwildsDashboard.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {serverPath || t("dragonwildsDashboard.noServerPath")}
        </Typography>
      </Box>

      {ownerMissing && (
        <Alert severity="warning" sx={{ fontSize: 13 }}>
          {t("dragonwildsDashboard.ownerMissing")}
        </Alert>
      )}

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
          {t("dragonwildsDashboard.waitingStats")}
        </Typography>
      )}

      <JoinServerCard />

      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="inherit" />}
        sx={{ fontSize: 13 }}
      >
        {t("dragonwildsDashboard.noApi")}
      </Alert>

      <Box sx={{ height: 400 }}>
        <Logs />
      </Box>
    </Stack>
  );
}
