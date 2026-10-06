import { Alert } from "@mui/material";
import { useTranslation } from "react-i18next";

// Rappel : Nexum n'installe les mods que sur le serveur. Beaucoup doivent
// aussi être chez chaque joueur (vécu : mods installés côté serveur seulement,
// « aucun ne fonctionne »).
export default function ClientModsHint() {
  const { t } = useTranslation();
  return (
    <Alert severity="info" sx={{ fontSize: 13 }}>
      {t("valheimMods.clientHint")}
    </Alert>
  );
}
