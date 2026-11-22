import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ModInstallProgress as Progress } from "@shared/types";

interface Props {
  /** `null` : rien reçu du main (sauvegarde avant une mise à jour…). */
  progress: Progress | null;
}

// Ligne sous les boutons de la page Mods pendant toute installation.
export default function ModInstallProgress({ progress }: Props) {
  const { t, i18n } = useTranslation();
  const percent =
    progress?.step === "downloading" ? progress.percent : undefined;

  const stepText = progress
    ? t(`valheimMods.progress.${progress.step}`, {
        name: progress.name,
        version: progress.step === "downloading" ? progress.version : "",
      })
    : t("valheimMods.nxm.installing");
  const text = progress?.batch
    ? `${t("valheimMods.progress.batch", { ...progress.batch })} · ${stepText}`
    : stepText;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        <CircularProgress size={16} sx={{ flexShrink: 0 }} />
        <Typography variant="body2" noWrap sx={{ color: "text.secondary" }}>
          {text}
        </Typography>
        {percent !== undefined && (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", ml: "auto", flexShrink: 0 }}
          >
            {new Intl.NumberFormat(i18n.language, { style: "percent" }).format(
              percent / 100,
            )}
          </Typography>
        )}
      </Box>
      {percent !== undefined && (
        <LinearProgress
          variant="determinate"
          value={percent}
          aria-label={text}
        />
      )}
    </Box>
  );
}
