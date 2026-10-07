import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ModRegistry } from "@shared/types";
import { REGISTRY_LABEL } from "../utils/modPageUrl";
import { NEXUM } from "../../../../../theme";

const REGISTRY_COLOR: Record<ModRegistry, string> = {
  thunderstore: NEXUM.thunderstore,
  hexium: NEXUM.hexium,
};

interface Props {
  /** Registre d'origine, ou « manual » pour un mod copié à la main. */
  source: ModRegistry | "manual";
}

// Pastille de provenance d'un mod, une couleur par registre (liste des mods
// installés, dialogue des dépendances). Avant : même violet pour les deux,
// on ne les distinguait qu'en lisant le texte.
export default function RegistryChip({ source }: Props) {
  const { t } = useTranslation();
  const color = source === "manual" ? undefined : REGISTRY_COLOR[source];
  return (
    <Chip
      label={
        source === "manual"
          ? t("valheimMods.installed.manual")
          : REGISTRY_LABEL[source]
      }
      size="small"
      variant="outlined"
      sx={{
        fontSize: 10,
        height: 18,
        px: 0,
        ...(color && { color, borderColor: color }),
      }}
    />
  );
}
