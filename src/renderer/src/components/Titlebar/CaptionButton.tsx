import { ButtonBase, SvgIcon } from "@mui/material";

// Tracés fins à 1 px, comme les boutons de fenêtre de Windows
const ICON_PATHS = {
  minimize: "M1 6h10",
  maximize: "M1.5 1.5h9v9h-9z",
  restore: "M3.5 3.5v-2h7v7h-2M1.5 3.5h7v7h-7z",
  close: "M1.5 1.5l9 9M10.5 1.5l-9 9",
};

/** Bouton de fenêtre : réduire, agrandir / restaurer, fermer. */
export default function CaptionButton({
  icon,
  label,
  onClick,
}: {
  icon: keyof typeof ICON_PATHS;
  label: string;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={label}
      sx={{
        width: 46,
        height: 40,
        color: "text.secondary",
        "&:hover":
          icon === "close"
            ? { bgcolor: "error.main", color: "error.contrastText" }
            : { bgcolor: "action.hover", color: "text.primary" },
        // Contour vers l'intérieur : le bouton touche les bords de la fenêtre
        "&.Mui-focusVisible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: -2,
        },
      }}
    >
      <SvgIcon viewBox="0 0 12 12" sx={{ fontSize: 12 }}>
        <path d={ICON_PATHS[icon]} fill="none" stroke="currentColor" />
      </SvgIcon>
    </ButtonBase>
  );
}
