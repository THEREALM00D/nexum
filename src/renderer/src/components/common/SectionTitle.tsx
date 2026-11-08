import { Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { ElementType, ReactNode } from "react";

/**
 * Titre d'une carte (variante `overline`). `component` : `span` dans un
 * élément qui n'accepte pas de titre (résumé d'Accordion), `div` pour un
 * simple libellé (carte de statistique).
 */
export default function SectionTitle({
  children,
  component = "h2",
  sx,
}: {
  children: ReactNode;
  component?: ElementType;
  sx?: SxProps<Theme>;
}) {
  return (
    <Typography
      variant="overline"
      component={component}
      sx={[
        { display: "block", color: "text.secondary" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Typography>
  );
}
