import type { ReactNode } from "react";
import { Stack } from "@mui/material";

interface Props {
  children: ReactNode;
  /** Largeur max (px) : un formulaire étiré sur tout l'écran se lit mal. */
  width?: number;
}

// Colonne des pages à formulaire (Config, Réseau, Installation, Paramètres) :
// largeur bornée et centrée dans la zone de contenu, au lieu d'être collée
// à gauche avec un grand vide à droite.
export default function FormPage({ children, width = 720 }: Props) {
  return (
    <Stack spacing={3} sx={{ width: "100%", maxWidth: width, mx: "auto" }}>
      {children}
    </Stack>
  );
}
