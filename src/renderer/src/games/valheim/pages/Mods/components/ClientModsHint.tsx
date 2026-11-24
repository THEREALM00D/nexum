import { useTranslation } from "react-i18next";
import DismissibleHint from "../../../../../components/common/DismissibleHint";

// Rappel : Nexum n'installe les mods que sur le serveur. Beaucoup doivent
// aussi être chez chaque joueur (sinon : mods installés côté serveur seulement,
// « aucun ne fonctionne »).
export default function ClientModsHint() {
  const { t } = useTranslation();
  return (
    <DismissibleHint
      storageKey="valheimMods.clientHintHidden"
      text={t("valheimMods.clientHint")}
      showLabel={t("valheimMods.clientHintShow")}
      hideLabel={t("valheimMods.clientHintHide")}
    />
  );
}
