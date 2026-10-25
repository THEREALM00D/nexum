import { Alert, type SxProps, type Theme } from "@mui/material";
import MemoryIcon from "@mui/icons-material/Memory";
import { useTranslation } from "react-i18next";
import type { GameType } from "@shared/types";
import { getGamePlugin } from "../../games/registry";

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
  const { t } = useTranslation();
  const req = getGamePlugin(gameType)?.requirements;
  if (!req) return null;
  return (
    <Alert
      severity="info"
      icon={<MemoryIcon fontSize="inherit" />}
      sx={[{ fontSize: 13 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {t("gameRequirements.hint", {
        game: t(`servers.games.${gameType}`),
        ram: req.ramGb,
        disk: req.diskGb,
      })}
    </Alert>
  );
}
