import { Box, Paper, Typography, LinearProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { SystemStats } from "@shared/types";
import { formatDuration } from "../../utils/format";

function StatCard({
  label,
  value,
  unit,
  progress,
}: {
  label: string;
  value: string | number;
  unit?: string;
  progress?: number;
}) {
  const color =
    (progress ?? 0) > 85
      ? "error"
      : (progress ?? 0) > 65
        ? "warning"
        : "success";
  return (
    <Paper
      sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mt: 0.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
        {unit && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {unit}
          </Typography>
        )}
      </Box>
      {progress !== undefined && (
        <LinearProgress
          variant="determinate"
          value={Math.min(100, progress)}
          color={color}
          sx={{ mt: 1.5, height: 4, borderRadius: 2 }}
        />
      )}
    </Paper>
  );
}

export default function StatsGrid({ stats }: { stats: SystemStats }) {
  const { t, i18n } = useTranslation();
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Box sx={{ flex: 1 }}>
        <StatCard
          label={t("dashboard.stats.cpu")}
          value={stats.cpu}
          unit="%"
          progress={stats.cpu}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <StatCard
          label={t("dashboard.stats.ram")}
          value={stats.ram}
          unit="%"
          progress={stats.ram}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <StatCard
          label={t("dashboard.stats.ramUsed")}
          value={`${stats.ramUsed} / ${stats.ramTotal}`}
          unit="GB"
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <StatCard
          label={t("dashboard.stats.ramServer")}
          value={`${stats.ramUsedByGame} / ${stats.ramTotal}`}
          unit="GB"
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <StatCard
          label={t("dashboard.stats.uptimeSystem")}
          value={formatDuration(stats.uptime, i18n.resolvedLanguage ?? "fr")}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <StatCard
          label={t("dashboard.stats.uptimeServer")}
          value={formatDuration(
            stats.serverUptime,
            i18n.resolvedLanguage ?? "fr",
          )}
        />
      </Box>
    </Box>
  );
}
