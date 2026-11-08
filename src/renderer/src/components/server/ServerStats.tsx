import { useEffect, useState } from "react";
import { Box, Paper, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { SystemStats } from "@shared/types";
import { useServer } from "../../context/ServerContext";
import { formatDuration } from "../../utils/format";
import LoadingSkeleton from "../common/LoadingSkeleton";
import SectionTitle from "../common/SectionTitle";

function StatCard({
  label,
  value,
  unit,
  hint,
  tooltip = "",
  loading,
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  tooltip?: string;
  loading: boolean;
}) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <SectionTitle component="div">{label}</SectionTitle>
      <LoadingSkeleton loading={loading} sx={{ mt: 1.25 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            gap: 0.75,
            mt: loading ? 0 : 1.25,
          }}
        >
          <Tooltip title={tooltip}>
            <Typography variant="stat" sx={{ whiteSpace: "nowrap" }}>
              {value}
            </Typography>
          </Tooltip>
          {unit && (
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              {unit}
            </Typography>
          )}
        </Box>
      </LoadingSkeleton>
      {/* Ligne réservée : les cartes ne changent pas de hauteur avec le statut */}
      <Typography
        variant="caption"
        component="div"
        sx={{ color: "text.secondary", mt: 1.25 }}
      >
        {hint || " "}
      </Typography>
    </Paper>
  );
}

export interface PlayersStat {
  count: number | null;
  max?: number;
  /** Explication quand le nombre est inconnu. */
  tooltip?: string;
}

/**
 * Chiffres du serveur. `players` absent : le jeu ne donne pas cette
 * information (pas d'API), la carte n'est pas affichée.
 */
export default function ServerStats({
  stats,
  players,
}: {
  stats: SystemStats | null;
  players?: PlayersStat;
}) {
  const { t, i18n } = useTranslation();
  const { state } = useServer();
  const { status } = state;
  const online = status === "running";
  const loading = stats === null;
  const [restartTime, setRestartTime] = useState<string | null>(null);

  useEffect(() => {
    window.api.schedule
      .getRestart()
      .then((c) => setRestartTime(c.enabled ? c.time : null))
      .catch(() => setRestartTime(null));
  }, [status]);

  const statusLabel = t(`status.${status}`, { defaultValue: status });

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 2,
      }}
    >
      {players && (
        <StatCard
          label={t("serverDashboard.players")}
          value={players.count ?? "—"}
          unit={
            players.count !== null && players.max
              ? `/ ${players.max}`
              : undefined
          }
          hint={online ? undefined : statusLabel}
          tooltip={players.tooltip}
          loading={false}
        />
      )}
      <StatCard
        label={t("serverDashboard.ramServer")}
        value={online && stats ? stats.ramUsedByGame : "—"}
        unit={online ? "GB" : undefined}
        hint={
          stats
            ? t("serverDashboard.ramOf", { total: stats.ramTotal })
            : undefined
        }
        loading={loading}
      />
      <StatCard
        label={t("serverDashboard.onlineFor")}
        value={
          online && stats
            ? formatDuration(stats.serverUptime, i18n.resolvedLanguage ?? "fr")
            : "—"
        }
        hint={
          online && restartTime
            ? t("serverDashboard.nextRestart", { time: restartTime })
            : undefined
        }
        loading={loading}
      />
    </Box>
  );
}
