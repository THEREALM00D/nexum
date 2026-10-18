import { useEffect, useRef, type ReactNode } from "react";
import { Box, Paper } from "@mui/material";

interface Props {
  /** Reste visible au-dessus de la liste (recherche, tri, onglets…). */
  header?: ReactNode;
  /** La liste elle-même : seule cette zone défile. */
  children: ReactNode;
  /** false : pas de fond, pour une liste de cartes déjà en Paper. */
  paper?: boolean;
  /** Marge intérieure (unités du thème) ; 0 pour un tableau bord à bord. */
  padding?: number;
  /**
   * Hauteur minimale de la liste (du panneau entier si `grow` est faux) :
   * quand la place manque, c'est la page qui défile plutôt que d'écraser
   * la liste.
   */
  minHeight?: number;
  /**
   * true (défaut) : occupe toute la hauteur restante. false : garde la
   * taille de son contenu et ne rétrécit (en défilant) que si la place manque.
   */
  grow?: boolean;
  /** Quand cette valeur change (tri, onglet…), la liste revient en haut. */
  resetKey?: unknown;
}

// Liste avec sa propre barre de défilement et un en-tête qui reste en place.
// Remplit la hauteur restante de son parent : la page doit être une colonne
// flex de hauteur contrainte (`height: "100%"`, voir le wrapper d'App.tsx).
export default function ScrollPanel({
  header,
  children,
  paper = true,
  padding = 2,
  minHeight = 240,
  grow = true,
  resetKey,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [resetKey]);
  const inset = paper ? padding : 0;
  return (
    <Paper
      elevation={paper ? 1 : 0}
      sx={{
        flex: grow ? 1 : "0 1 auto",
        // grow : pas de minHeight ici, la taille minimale du panneau vaut
        // en-tête + base de la liste (flex-basis ci-dessous). Une base en %
        // ou auto la ferait suivre toute la liste, qui ne défilerait plus.
        minHeight: grow ? undefined : minHeight,
        display: "flex",
        flexDirection: "column",
        ...(!paper && { bgcolor: "transparent" }),
      }}
    >
      {header && (
        <Box sx={{ flexShrink: 0, px: inset, pt: inset, pb: paper ? 1 : 2 }}>
          {header}
        </Box>
      )}
      <Box
        ref={bodyRef}
        sx={{
          flex: grow ? `1 1 ${minHeight}px` : "0 1 auto",
          minHeight: 0,
          overflow: "auto",
          borderRadius: "inherit",
          px: inset,
          pb: inset,
          pt: header ? 0 : inset,
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}
