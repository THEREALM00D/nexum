import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FONT_MONO } from "../../theme";
import { useStickToBottom } from "../../hooks/useStickToBottom";

const lineColor = (line: string) =>
  line.includes("[ERR]") || line.includes("Error")
    ? "error.main"
    : line.includes("[Manager]")
      ? "primary.main"
      : "text.secondary";

// Zone de lignes du log (en direct ou session terminée), avec défilement qui
// suit la dernière ligne seulement si l'utilisateur est déjà en bas.
export default function LogLines({ lines }: { lines: string[] }) {
  const { t } = useTranslation();
  const { ref, onScroll } = useStickToBottom(lines);
  return (
    <Box
      ref={ref}
      onScroll={onScroll}
      sx={{
        flex: 1,
        overflowY: "auto",
        fontFamily: FONT_MONO,
        fontSize: 12,
        lineHeight: 1.7,
      }}
    >
      {lines.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.disabled" }}>
          {t("logs.empty")}
        </Typography>
      ) : (
        lines.map((line, i) => (
          <Box key={i} component="div" sx={{ color: lineColor(line) }}>
            {line}
          </Box>
        ))
      )}
    </Box>
  );
}
