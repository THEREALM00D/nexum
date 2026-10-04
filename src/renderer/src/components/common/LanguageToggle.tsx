import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { useTranslation } from "react-i18next";

// Sélecteur FR/EN partagé (Sidebar + page Paramètres). Le choix est persisté
// par i18next dans localStorage.locale (voir i18n/index.ts).
export default function LanguageToggle({
  size = "small",
  sx,
}: {
  size?: "small" | "medium";
  sx?: SxProps<Theme>;
}) {
  const { i18n } = useTranslation();
  const compact = size === "small";
  const btn = compact ? { fontSize: 11, py: 0.25 } : { px: 3 };

  return (
    <ToggleButtonGroup
      value={i18n.resolvedLanguage ?? "fr"}
      exclusive
      onChange={(_, lang: string | null) => {
        if (lang) i18n.changeLanguage(lang);
      }}
      size="small"
      fullWidth={compact}
      sx={sx}
    >
      <ToggleButton value="fr" sx={btn}>
        {compact ? "FR" : "Français"}
      </ToggleButton>
      <ToggleButton value="en" sx={btn}>
        {compact ? "EN" : "English"}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
