import { Box, Divider, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { PalServerInfo, PalMetrics } from "@shared/types";

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.75,
      }}
    >
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          maxWidth: "60%",
          textAlign: "right",
          wordBreak: "break-all",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

interface Props {
  serverInfo: PalServerInfo;
  metrics: PalMetrics | null;
}

export default function ServerInfoPanel({ serverInfo, metrics }: Props) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 2.5, flex: "1 1 360px", minWidth: 0 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t("dashboard.info.title")}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <InfoRow label={t("dashboard.info.name")} value={serverInfo.servername} />
      <InfoRow label={t("dashboard.info.version")} value={serverInfo.version} />
      {serverInfo.description && (
        <InfoRow
          label={t("dashboard.info.description")}
          value={serverInfo.description}
        />
      )}
      <InfoRow label={t("dashboard.info.guid")} value={serverInfo.worldguid} />
      {metrics && (
        <>
          <Divider sx={{ my: 1 }} />
          <InfoRow
            label={t("dashboard.info.onlinePlayers")}
            value={`${metrics.currentplayernum} / ${metrics.maxplayernum}`}
          />
          <InfoRow label={t("dashboard.info.dayInGame")} value={metrics.days} />
          <InfoRow
            label={t("dashboard.info.serverFps")}
            value={metrics.serverfps}
          />
          <InfoRow
            label={t("dashboard.info.basecamps")}
            value={metrics.basecampnum}
          />
        </>
      )}
    </Paper>
  );
}
