import type { ReactNode } from "react";
import { Stack } from "@mui/material";

interface Props {
  children: ReactNode;
  /** Largeur max (px) : un formulaire étiré sur tout l'écran se lit mal. */
  width?: number;
  /**
   * Occupe toute la hauteur de la page : une liste (ScrollPanel) y défile
   * seule, l'en-tête reste en place. Le parent doit être de hauteur contrainte.
   */
  fill?: boolean;
}

// Colonne des pages à formulaire (Config, Réseau, Installation, Paramètres) :
// largeur bornée et centrée dans la zone de contenu, au lieu d'être collée
// à gauche avec un grand vide à droite.
export default function FormPage({ children, width = 720, fill }: Props) {
  return (
    <Stack
      spacing={3}
      sx={{
        width: "100%",
        maxWidth: width,
        mx: "auto",
        ...(fill && { height: "100%", minHeight: 0 }),
      }}
    >
      {children}
    </Stack>
  );
}
