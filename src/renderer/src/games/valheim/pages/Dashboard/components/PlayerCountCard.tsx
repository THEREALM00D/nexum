import { Paper, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import SectionTitle from "../../../../../components/common/SectionTitle";

export default function PlayerCountCard({ count }: { count: number | null }) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 2.5 }}>
      <SectionTitle component="div">
        {t("valheimDashboard.players.title")}
      </SectionTitle>
      {count !== null ? (
        <Typography variant="stat">{count}</Typography>
      ) : (
        <Tooltip title={t("valheimDashboard.players.unknown")}>
          <Typography variant="stat" sx={{ color: "text.secondary" }}>
            —
          </Typography>
        </Tooltip>
      )}
    </Paper>
  );
}
