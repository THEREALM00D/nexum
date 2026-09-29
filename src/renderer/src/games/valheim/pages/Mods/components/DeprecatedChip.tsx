import { Chip, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ModRegistry } from "@shared/types";
import { REGISTRY_LABEL } from "../utils/modPageUrl";

interface Props {
  /** Registre sur lequel le package est déprécié. */
  registry: ModRegistry;
  /** Registre proposant une version maintenue, si une MàJ y a été trouvée. */
  alternative?: ModRegistry;
}

// Badge « Déprécié » partagé entre la liste des mods installés et Parcourir.
export default function DeprecatedChip({ registry, alternative }: Props) {
  const { t } = useTranslation();
  const tooltip = alternative
    ? t("valheimMods.deprecated.tooltipAlternative", {
        registry: REGISTRY_LABEL[registry],
        alternative: REGISTRY_LABEL[alternative],
      })
    : t("valheimMods.deprecated.tooltip", {
        registry: REGISTRY_LABEL[registry],
      });

  return (
    <Tooltip title={tooltip}>
      <Chip
        label={t("valheimMods.deprecated.label")}
        size="small"
        color="error"
        variant="outlined"
        sx={{ fontSize: 10, height: 18, px: 0 }}
      />
    </Tooltip>
  );
}
