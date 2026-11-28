import { Box } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { DiffLine } from "@shared/lineDiff";
import { FONT_MONO } from "../../../theme";

/** Lignes identiques gardées autour d'un changement ; le reste devient « … ». */
const CONTEXT = 2;

type Shown = DiffLine | { kind: "gap" };

/** Garde les changements et quelques lignes autour. */
function collapse(lines: DiffLine[]): Shown[] {
  const keep = lines.map(() => false);
  lines.forEach((line, index) => {
    if (line.kind === "same") return;
    for (
      let near = Math.max(0, index - CONTEXT);
      near <= Math.min(lines.length - 1, index + CONTEXT);
      near++
    )
      keep[near] = true;
  });
  const shown: Shown[] = [];
  lines.forEach((line, index) => {
    if (keep[index]) shown.push(line);
    else if (shown[shown.length - 1]?.kind !== "gap")
      shown.push({ kind: "gap" });
  });
  return shown;
}

interface Props {
  lines: DiffLine[];
}

/** Bloc mono : en rouge ce que la copie contient, en vert l'actuel. */
export default function DiffView({ lines }: Props) {
  const theme = useTheme();
  const styleOf = (kind: Shown["kind"]) => {
    if (kind === "removed")
      return {
        bgcolor: alpha(theme.palette.error.main, 0.12),
        color: "error.light",
      };
    if (kind === "added")
      return {
        bgcolor: alpha(theme.palette.success.main, 0.12),
        color: "success.main",
      };
    return { color: "text.secondary" };
  };
  const prefix = { removed: "- ", added: "+ ", same: "  ", gap: "  " };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        borderRadius: 1,
        py: 1,
        maxHeight: "clamp(200px, 45vh, 420px)",
        overflow: "auto",
      }}
    >
      {collapse(lines).map((line, index) => (
        <Box
          key={index}
          sx={{
            typography: "code",
            fontFamily: FONT_MONO,
            whiteSpace: "pre",
            px: 1.5,
            lineHeight: 1.8,
            ...styleOf(line.kind),
          }}
        >
          {prefix[line.kind]}
          {line.kind === "gap" ? "…" : line.text}
        </Box>
      ))}
    </Box>
  );
}
