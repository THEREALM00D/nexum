import { createTheme } from "@mui/material";

// Palette d'interface Nexum, alignée sur les couleurs du logo (kit de marque) :
// fond, texte et vert sont ceux du logo ; surfaces, bordures et texte gris
// viennent de l'aperçu social du même kit. Utiliser ces constantes plutôt que
// des hex en dur.
export const NEXUM = {
  ink: "#0E1116", // fond principal (fond du logo)
  graphite: "#161B22", // surfaces, panneaux, barre latérale
  steel: "#8B95A5", // texte secondaire
  paper: "#E6EAF0", // texte principal (barres du logo)
  signal: "#22C55E", // accent + statut « en ligne » (vert du logo)
  signalDeep: "#16A34A", // vert du logo sur fond clair / variante foncée
  alert: "#F2A33A", // avertissements, redémarrage
  critical: "#E5484D", // erreurs, crash, actions destructives
  line: "#252B35", // séparateurs, bordures
} as const;

// Polices de la marque (chargées dans main.tsx via @fontsource)
export const FONT_SANS = '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif';
export const FONT_MONO =
  '"IBM Plex Mono", Consolas, "Cascadia Mono", monospace';

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    // Signal est clair : texte des boutons pleins en Ink pour rester lisible
    primary: {
      main: NEXUM.signal,
      dark: NEXUM.signalDeep,
      contrastText: NEXUM.ink,
    },
    success: { main: NEXUM.signal, contrastText: NEXUM.ink },
    warning: { main: NEXUM.alert, contrastText: NEXUM.ink },
    error: { main: NEXUM.critical },
    background: {
      default: NEXUM.ink,
      paper: NEXUM.graphite,
    },
    text: {
      primary: NEXUM.paper,
      secondary: NEXUM.steel,
    },
    divider: NEXUM.line,
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: FONT_SANS,
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 500 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
  },
});
