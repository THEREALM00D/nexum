import { useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useTranslation } from "react-i18next";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { FONT_MONO } from "../../theme";
import { logLineColor } from "./logLineColor";

// Marge (px) sous laquelle on considère l'utilisateur « en bas » du log.
const BOTTOM_THRESHOLD = 24;

/**
 * Zone de lignes du log (en direct ou session terminée), virtualisée : seules
 * les lignes visibles sont dans le DOM, toute la session peut donc être
 * affichée (avant : 500 lignes en direct, 2000 pour une session passée).
 * Suit la dernière ligne seulement si l'utilisateur est en bas ; remonter met
 * le suivi en pause (les lignes ne sortent plus du tampon, la vue ne bouge
 * plus) et un bouton ramène au direct.
 *
 * Ouvre en bas du log : remonter le composant (`key`) pour un autre log.
 */
export default function LogLines({ lines }: { lines: string[] }) {
  const { t } = useTranslation();
  const ref = useRef<VirtuosoHandle>(null);
  const [atBottom, setAtBottom] = useState(true);
  // Nombre de lignes au moment où l'utilisateur a quitté le bas
  const [seen, setSeen] = useState(lines.length);

  const onBottomChange = (bottom: boolean) => {
    setAtBottom(bottom);
    if (!bottom) setSeen(lines.length);
  };

  const scrollToBottom = () =>
    ref.current?.scrollToIndex({ index: "LAST", align: "end" });

  if (lines.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "text.disabled" }}>
        {t("logs.empty")}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        position: "relative",
        typography: "caption",
        fontFamily: FONT_MONO,
        lineHeight: 1.7,
      }}
    >
      <Virtuoso
        ref={ref}
        style={{ height: "100%" }}
        data={lines}
        initialTopMostItemIndex={lines.length - 1}
        followOutput={(bottom) => (bottom ? "auto" : false)}
        atBottomThreshold={BOTTOM_THRESHOLD}
        atBottomStateChange={onBottomChange}
        increaseViewportBy={400}
        itemContent={(_, line) => (
          <Box sx={{ color: logLineColor(line), wordBreak: "break-word" }}>
            {line}
          </Box>
        )}
      />
      {!atBottom && lines.length > seen && (
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
