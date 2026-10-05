import { Box, Divider, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FONT_MONO } from "../../../theme";
import { useStickToBottom } from "../../../hooks/useStickToBottom";

export default function InstallLogs({ logs }: { logs: string[] }) {
  const { t } = useTranslation();
  const { ref: scrollRef, onScroll } = useStickToBottom(logs);
  return (
    <Paper sx={{ p: 2 }}>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {t("install.progress")}
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Box
        ref={scrollRef}
        onScroll={onScroll}
        sx={{
          height: 180,
          overflowY: "auto",
          fontFamily: FONT_MONO,
          fontSize: 11,
          color: "text.secondary",
          lineHeight: 1.6,
        }}
      >
        {logs.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </Box>
    </Paper>
  );
}
