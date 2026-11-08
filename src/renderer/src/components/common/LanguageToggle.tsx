import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useTranslation } from "react-i18next";

// Sélecteur de langue (page Paramètres). Le choix est persisté par i18next
// dans localStorage.locale (voir i18n/index.ts).
export default function LanguageToggle() {
  const { i18n } = useTranslation();

  return (
    <ToggleButtonGroup
      value={i18n.resolvedLanguage ?? "fr"}
      exclusive
      onChange={(_, lang: string | null) => {
        if (lang) i18n.changeLanguage(lang);
      }}
      size="small"
    >
      <ToggleButton value="fr" sx={{ px: 3 }}>
        Français
      </ToggleButton>
      <ToggleButton value="en" sx={{ px: 3 }}>
        English
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
