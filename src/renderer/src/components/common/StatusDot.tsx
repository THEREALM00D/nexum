import { Box, type SxProps, type Theme } from "@mui/material";
import type { ServerStatus } from "@shared/types";
import { STATUS_COLOR } from "../../utils/status";

/** Point rond à la couleur du statut (l'identité d'un serveur : ServerTile). */
export default function StatusDot({
  status,
  size = 8,
  sx,
}: {
  status: ServerStatus;
  size?: number;
  sx?: SxProps<Theme>;
}) {
  const color = STATUS_COLOR[status] ?? "default";
  return (
    <Box
      aria-hidden
      sx={[
        {
          width: size,
          height: size,
          borderRadius: "50%",
          bgcolor: color === "default" ? "text.secondary" : `${color}.main`,
          flexShrink: 0,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}
