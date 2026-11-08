import { Box, Button, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "../../context/NavigationContext";
import { useServer } from "../../context/ServerContext";
import { FONT_MONO } from "../../theme";
import SectionTitle from "../common/SectionTitle";
import { logLineColor } from "./logLineColor";

const LINE_COUNT = 5;
const LINE_HEIGHT = 1.8;

/** Dernières lignes de la session ; la lecture complète est sur la page Logs. */
export default function LatestLogsCard() {
  const { t } = useTranslation();
  const { state } = useServer();
  const navigate = useNavigate();
  const lines = state.logs.slice(-LINE_COUNT);

  return (
    <Paper
      sx={{
        p: 2.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <SectionTitle>{t("logs.latest")}</SectionTitle>
        <Button size="small" onClick={() => navigate("logs")}>
          {t("logs.viewAll")}
        </Button>
      </Box>
      <Box
        sx={{
          flex: 1,
          px: 1.75,
          py: 1.5,
          borderRadius: 1,
          bgcolor: "background.default",
        }}
      >
        {/* Hauteur des 5 lignes réservée : la carte ne saute pas au démarrage */}
        <Box
          sx={{
            typography: "caption",
            fontFamily: FONT_MONO,
            lineHeight: LINE_HEIGHT,
            minHeight: `${LINE_COUNT * LINE_HEIGHT}em`,
          }}
        >
          {lines.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.disabled" }}>
              {t("logs.empty")}
            </Typography>
          ) : (
            lines.map((line, i) => (
              <Box
                key={i}
                title={line}
                sx={{
                  color: logLineColor(line),
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {line}
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Paper>
  );
}
