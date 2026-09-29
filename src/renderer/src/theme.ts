import { createTheme } from "@mui/material";

// Palette d'interface Nexum (fournie avec l'identité visuelle). Noms repris de
// la charte : utiliser ces constantes plutôt que des hex en dur.
export const NEXUM = {
  ink: "#0D1117", // fond principal
  graphite: "#1A2029", // surfaces, panneaux, barre latérale
  steel: "#8A94A3", // texte secondaire
  paper: "#F3F2EE", // texte principal (sur sombre)
  signal: "#3FD68C", // accent + statut « en ligne »
  signalDeep: "#117A4A", // accent sur fond clair / variante foncée
  alert: "#F2A33A", // avertissements, redémarrage
  critical: "#E5484D", // erreurs, crash, actions destructives
  line: "#2A313C", // séparateurs (dérivé de Graphite)
} as const;

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
    fontFamily: '"Roboto", sans-serif',
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
