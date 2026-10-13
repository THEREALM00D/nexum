import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useTranslation } from "react-i18next";
import { FONT_MONO } from "../../theme";
import { useStickToBottom } from "../../hooks/useStickToBottom";

const lineColor = (line: string) =>
  line.includes("[ERR]") || line.includes("Error")
    ? "error.main"
    : line.includes("[Manager]")
      ? "primary.main"
      : "text.secondary";

/**
 * Zone de lignes du log (en direct ou session terminée). Suit la dernière
 * ligne seulement si l'utilisateur est en bas. Quand il remonte, la vue est
 * FIGÉE : sans ça, une fois le tampon de 500 lignes plein, chaque nouvelle
 * ligne fait sortir la plus ancienne et le texte remonte quand même (signalé
 * sur Discord). Un bouton ramène au direct.
 */
export default function LogLines({ lines }: { lines: string[] }) {
  const { t } = useTranslation();
  const [frozen, setFrozen] = useState<string[] | null>(null);
  const shown = frozen ?? lines;
  const { ref, onScroll, following, scrollToBottom } = useStickToBottom(shown);

  // Fige la vue dès que l'utilisateur quitte le bas, la libère au retour
  if (!following && frozen === null) setFrozen(lines);
  if (following && frozen !== null) setFrozen(null);

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        ref={ref}
        onScroll={onScroll}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          fontFamily: FONT_MONO,
          fontSize: 12,
          lineHeight: 1.7,
        }}
      >
        {shown.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.disabled" }}>
            {t("logs.empty")}
          </Typography>
        ) : (
          shown.map((line, i) => (
            <Box key={i} component="div" sx={{ color: lineColor(line) }}>
              {line}
            </Box>
          ))
        )}
      </Box>
      {frozen !== null && frozen !== lines && (
        <Button
          size="small"
          variant="contained"
          startIcon={<ArrowDownwardIcon />}
          onClick={scrollToBottom}
          sx={{ position: "absolute", bottom: 8, right: 16 }}
        >
          {t("logs.newLines")}
        </Button>
      )}
    </Box>
  );
}
