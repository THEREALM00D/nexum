import { Paper, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function PlayerCountCard({ count }: { count: number | null }) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {t("valheimDashboard.players.title")}
      </Typography>
      {count !== null ? (
        <Typography variant="h6">{count}</Typography>
      ) : (
        <Tooltip title={t("valheimDashboard.players.unknown")}>
          <Typography variant="h6" sx={{ color: "text.secondary" }}>
            —
          </Typography>
        </Tooltip>
      )}
    </Paper>
  );
}
