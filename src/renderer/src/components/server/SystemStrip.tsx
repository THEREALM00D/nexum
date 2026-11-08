import { Box, LinearProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { SystemStats } from "@shared/types";
import { formatDuration } from "../../utils/format";
import LoadingSkeleton from "../common/LoadingSkeleton";
import SectionTitle from "../common/SectionTitle";

// Valeurs de forme réaliste, masquées sous les skeletons tant que les
// premières statistiques ne sont pas arrivées.
const PLACEHOLDER: SystemStats = {
  cpu: 0,
  ram: 0,
  ramUsed: 10.5,
  ramTotal: 31.92,
  ramUsedByGame: 0,
  serverUptime: 0,
  uptime: 5 * 86400,
};

// Barre neutre : verte, elle se lisait comme un statut « en ligne »
const meterColor = (value: number) =>
  value > 85 ? "error.main" : value > 65 ? "warning.main" : "text.secondary";

const ITEM_SX = { display: "flex", alignItems: "center", gap: 1.25 };

function Meter({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail?: string;
}) {
  return (
    <Box sx={ITEM_SX}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Box sx={{ width: 96, color: meterColor(value) }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, value)}
          color="inherit"
          sx={{ height: 4, borderRadius: 2 }}
        />
      </Box>
      <Typography variant="code">{value} %</Typography>
      {detail && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {detail}
        </Typography>
      )}
    </Box>
  );
}

/** Le PC qui héberge, au second plan des chiffres du serveur. */
export default function SystemStrip({ stats }: { stats: SystemStats | null }) {
  const { t, i18n } = useTranslation();
  const loading = stats === null;
  const s = stats ?? PLACEHOLDER;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "12px 32px",
        px: 2.5,
        py: 1.75,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
      }}
    >
      <SectionTitle component="div">{t("serverDashboard.thisPc")}</SectionTitle>
      <LoadingSkeleton loading={loading}>
        <Meter label={t("serverDashboard.cpu")} value={s.cpu} />
      </LoadingSkeleton>
      <LoadingSkeleton loading={loading}>
        <Meter
          label={t("serverDashboard.ram")}
          value={s.ram}
          detail={`${s.ramUsed} / ${s.ramTotal} GB`}
        />
      </LoadingSkeleton>
      <LoadingSkeleton loading={loading}>
        <Box sx={ITEM_SX}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("serverDashboard.poweredOnFor")}
          </Typography>
          <Typography variant="code">
            {formatDuration(s.uptime, i18n.resolvedLanguage ?? "fr")}
          </Typography>
        </Box>
      </LoadingSkeleton>
    </Box>
  );
}
