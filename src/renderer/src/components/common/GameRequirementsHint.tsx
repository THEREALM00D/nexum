import { Alert, type SxProps, type Theme } from "@mui/material";
import MemoryIcon from "@mui/icons-material/Memory";
import { useTranslation } from "react-i18next";
import type { GameType } from "@shared/types";
import { getGamePlugin } from "../../games/registry";
import { formatNumber } from "../../utils/format";

/**
 * Rappel de la RAM et de l'espace disque à prévoir, pour les jeux qui en
 * déclarent dans leur manifest (`requirements`) — avant d'installer.
 */
export default function GameRequirementsHint({
  gameType,
  sx,
}: {
  gameType: GameType;
  sx?: SxProps<Theme>;
}) {
  const { t, i18n } = useTranslation();
  const requirements = getGamePlugin(gameType)?.requirements;
  if (!requirements) return null;
  const locale = i18n.resolvedLanguage ?? "fr";
  return (
    <Alert severity="info" icon={<MemoryIcon fontSize="inherit" />} sx={sx}>
      {t("gameRequirements.hint", {
        game: t(`servers.games.${gameType}`),
        ram: formatNumber(requirements.ramGb, locale, 1, 0),
        disk: formatNumber(requirements.diskGb, locale, 1, 0),
      })}
    </Alert>
  );
}
