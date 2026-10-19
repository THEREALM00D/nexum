import { Box, Paper, Typography, LinearProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { SystemStats } from "@shared/types";
import { formatDuration } from "../../utils/format";
import LoadingSkeleton from "../common/LoadingSkeleton";

// Valeurs de forme réaliste, affichées masquées sous les skeletons tant que
// les premières statistiques ne sont pas arrivées (même taille de cartes).
const PLACEHOLDER: SystemStats = {
  cpu: 0,
  ram: 0,
  ramUsed: 10.5,
  ramTotal: 31.92,
  ramUsedByGame: 0,
  serverUptime: 0,
  uptime: 5 * 86400,
};

function StatCard({
  label,
  value,
  unit,
  progress,
  loading,
}: {
  label: string;
  value: string | number;
  unit?: string;
  progress?: number;
  loading: boolean;
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
      <LoadingSkeleton loading={loading} sx={{ mt: 0.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            gap: 0.5,
            mt: loading ? 0 : 0.5,
          }}
        >
          {/* 6 cartes par ligne (xl) : un peu plus petit pour que
            « 13.57 / 31.92 » tienne sur une ligne */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              whiteSpace: "nowrap",
              fontSize: { xl: "1.25rem" },
            }}
          >
            {value}
          </Typography>
          {unit && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {unit}
            </Typography>
          )}
        </Box>
      </LoadingSkeleton>
      {progress !== undefined && (
        <LoadingSkeleton loading={loading} fullWidth sx={{ mt: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, progress)}
            color={color}
            sx={{ mt: loading ? 0 : 1.5, height: 4, borderRadius: 2 }}
          />
        </LoadingSkeleton>
      )}
    </Paper>
  );
}

/** `stats` null : premières statistiques pas encore reçues → skeletons. */
export default function StatsGrid({ stats }: { stats: SystemStats | null }) {
  const { t, i18n } = useTranslation();
  const loading = stats === null;
  const s = stats ?? PLACEHOLDER;
  return (
    // 6 cartes sur une ligne seulement sur grand écran (xl, ≥ 1536 px) ; en
    // dessous 3×2 : sur un portable, six cartes écrasaient les valeurs
    // (« 13.57 / 31.92 GB » sur deux lignes).
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(3, 1fr)", xl: "repeat(6, 1fr)" },
        gap: 2,
      }}
    >
      <Box>
        <StatCard
          label={t("dashboard.stats.cpu")}
          value={s.cpu}
          unit="%"
          progress={s.cpu}
          loading={loading}
        />
      </Box>
      <Box>
        <StatCard
          label={t("dashboard.stats.ram")}
          value={s.ram}
          unit="%"
          progress={s.ram}
          loading={loading}
        />
      </Box>
      <Box>
        <StatCard
          label={t("dashboard.stats.ramUsed")}
          value={`${s.ramUsed} / ${s.ramTotal}`}
          unit="GB"
          loading={loading}
        />
      </Box>
      <Box>
        <StatCard
          label={t("dashboard.stats.ramServer")}
          value={`${s.ramUsedByGame} / ${s.ramTotal}`}
          unit="GB"
          loading={loading}
        />
      </Box>
      <Box>
        <StatCard
          label={t("dashboard.stats.uptimeSystem")}
          value={formatDuration(s.uptime, i18n.resolvedLanguage ?? "fr")}
          loading={loading}
        />
      </Box>
      <Box>
        <StatCard
          label={t("dashboard.stats.uptimeServer")}
          value={formatDuration(s.serverUptime, i18n.resolvedLanguage ?? "fr")}
          loading={loading}
        />
      </Box>
    </Box>
  );
}
