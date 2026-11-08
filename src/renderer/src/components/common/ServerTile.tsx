import { Box } from "@mui/material";
import { NEXUM } from "../../theme";

/**
 * Identité d'un serveur : tuile carrée avec son initiale. Le rond est réservé
 * au statut. Décorative : le nom est toujours affiché ou annoncé à côté.
 */
export default function ServerTile({
  name,
  color,
  size = 24,
}: {
  name: string;
  color: string | null;
  size?: number;
}) {
  // Array.from : une initiale hors du plan de base (emoji) tient sur 2 unités
  const initial = Array.from(name.trim())[0]?.toUpperCase() ?? "";
  return (
    <Box
      aria-hidden
      sx={{
        typography: "caption",
        fontWeight: 600,
        lineHeight: 1,
        width: size,
        height: size,
        borderRadius: `${Math.round(size / 4)}px`,
        bgcolor: color ?? NEXUM.steel,
        color: NEXUM.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {initial}
    </Box>
  );
}
