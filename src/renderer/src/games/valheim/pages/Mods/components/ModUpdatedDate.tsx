import { Tooltip, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslation } from "react-i18next";

// Au-delà, le mod est signalé « peut-être obsolète ». Volontairement pas la
// date du dernier patch de Valheim : il faudrait interroger Steam (nouvel
// appel réseau) et la plupart des mods survivent aux patchs sans mise à jour,
// donc presque tout passerait en alerte après chaque mise à jour du jeu.
const STALE_AFTER_MS = 365 * 24 * 60 * 60 * 1000;

interface Props {
  /** `updated_timestamp` du registre (secondes) : dernière version publiée. */
  timestamp: number;
}

// Date de dernière mise à jour d'un mod dans Parcourir, en orange si ancienne.
export default function ModUpdatedDate({ timestamp }: Props) {
  const { t, i18n } = useTranslation();
  if (!timestamp) return null;
  const ms = timestamp * 1000;
  const stale = Date.now() - ms > STALE_AFTER_MS;
  const date = new Date(ms).toLocaleDateString(
    i18n.language === "fr" ? "fr-FR" : "en-US",
    { year: "numeric", month: "short", day: "numeric" },
  );

  const text = (
    <Typography
      component="span"
      variant="caption"
      sx={{
        color: stale ? "warning.main" : "text.secondary",
        display: "inline-flex",
        alignItems: "center",
        gap: 0.25,
      }}
    >
      {stale && <WarningAmberIcon sx={{ fontSize: 13 }} />}
      {t("valheimMods.browse.updatedOn", { date })}
    </Typography>
  );

  return stale ? (
    <Tooltip title={t("valheimMods.browse.staleTooltip")}>{text}</Tooltip>
  ) : (
    text
  );
}
