import { createTheme } from "@mui/material";
import type { CSSProperties } from "react";

// Variantes de texte propres à Nexum, utilisables avec <Typography variant>
// et sx={{ typography: "…" }}.
declare module "@mui/material/styles" {
  interface TypographyVariants {
    display: CSSProperties;
    stat: CSSProperties;
    micro: CSSProperties;
    code: CSSProperties;
  }
  interface TypographyVariantsOptions {
    display?: CSSProperties;
    stat?: CSSProperties & Record<string, unknown>;
    micro?: CSSProperties;
    code?: CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    display: true;
    stat: true;
    micro: true;
    code: true;
  }
}

// Palette d'interface Nexum, alignée sur les couleurs du logo (kit de marque) :
// fond, texte et vert sont ceux du logo ; surfaces, bordures et texte gris
// viennent de l'aperçu social du même kit. Utiliser ces constantes plutôt que
// des hex en dur.
export const NEXUM = {
  ink: "#0E1116", // fond principal (fond du logo)
  graphite: "#161B22", // surfaces, panneaux, barre latérale
  raised: "#1C222B", // élément posé sur une surface Graphite
  steel: "#8B95A5", // texte secondaire
  paper: "#E6EAF0", // texte principal (barres du logo)
  signal: "#22C55E", // accent + statut « en ligne » (vert du logo)
  signalDeep: "#16A34A", // vert du logo sur fond clair / variante foncée
  alert: "#F2A33A", // avertissements, redémarrage
  critical: "#E5484D", // erreurs, crash, actions destructives
  line: "#252B35", // séparateurs, bordures
  // Pastilles de registre de mods Valheim (RegistryChip) : hors des couleurs
  // de statut (vert/orange/rouge) pour ne pas être lues comme un état.
  thunderstore: "#4EA8F5", // bleu
  hexium: "#B48CF2", // violet
} as const;

// Mise en page : largeur max du contenu, centré dans la zone principale
// (grands écrans). COMPACT_MEDIA = écrans de portable (1366×768, 1920×1080
// à 125-150 %) : marges réduites pour garder de la place aux listes.
export const CONTENT_MAX_WIDTH = 1280;
export const COMPACT_MEDIA = "@media (max-height: 820px), (max-width: 1100px)";
export const NARROW_WINDOW_QUERY = "(max-width: 1100px)";
export const SHORT_WINDOW_QUERY = "(max-height: 820px)";

// Polices de la marque (chargées dans main.tsx via @fontsource)
export const FONT_SANS = '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif';
export const FONT_MONO =
  '"IBM Plex Mono", Consolas, "Cascadia Mono", monospace';
// Avec fontStretch 125 % : Archivo Expanded, la typo de marque des titres
export const FONT_DISPLAY =
  '"Archivo Variable", "Segoe UI", system-ui, sans-serif';

const rem = (px: number) => `${px / 16}rem`;

const DISPLAY_TEXT = {
  fontFamily: FONT_DISPLAY,
  fontStretch: "125%",
  fontWeight: 700,
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
    fontFamily: FONT_SANS,
    display: {
      ...DISPLAY_TEXT,
      fontSize: rem(26),
      lineHeight: 1.15,
      letterSpacing: "-0.01em",
    },
    h1: {
      ...DISPLAY_TEXT,
      fontSize: rem(24),
      lineHeight: 1.2,
      letterSpacing: "normal",
    },
    h6: { fontWeight: 600 },
    // 20 px à partir de xl : les 6 cartes de StatsGrid tiennent alors sur une
    // ligne, et « 13.57 / 31.92 » doit y rester sans retour à la ligne.
    stat: {
      fontWeight: 600,
      fontSize: rem(24),
      lineHeight: 1.2,
      "@media (min-width:1536px)": { fontSize: rem(20) },
    },
    body1: { fontSize: rem(14) },
    body2: { fontSize: rem(13) },
    overline: {
      fontSize: rem(11),
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "0.08em",
    },
    micro: { fontSize: rem(11), fontWeight: 500, lineHeight: 1.4 },
    code: { fontFamily: FONT_MONO, fontSize: rem(13), fontWeight: 400 },
  },
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: { display: "h1", stat: "div" },
      },
    },
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
