import { useState } from "react";
import { Alert, Button } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "valheimMods.clientHintHidden";

function loadHidden(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function saveHidden(hidden: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, hidden ? "1" : "0");
  } catch {
    /* stockage indisponible */
  }
}

// Rappel : Nexum n'installe les mods que sur le serveur. Beaucoup doivent
// aussi être chez chaque joueur (vécu : mods installés côté serveur seulement,
// « aucun ne fonctionne »). Masquable (mémorisé) pour laisser la place aux
// listes sur un écran de portable ; il reste un lien d'une ligne pour le
// rouvrir.
export default function ClientModsHint() {
  const { t } = useTranslation();
  const [hidden, setHidden] = useState(loadHidden);

  const toggle = (next: boolean) => {
    setHidden(next);
    saveHidden(next);
  };

  if (hidden) {
    return (
      <Button
        size="small"
        startIcon={<InfoOutlinedIcon />}
        onClick={() => toggle(false)}
        sx={{ alignSelf: "flex-start", color: "info.main" }}
      >
        {t("valheimMods.clientHintShow")}
      </Button>
    );
  }

  return (
    <Alert
      severity="info"
      sx={{ fontSize: 13 }}
      onClose={() => toggle(true)}
      closeText={t("valheimMods.clientHintHide")}
    >
      {t("valheimMods.clientHint")}
    </Alert>
  );
}
