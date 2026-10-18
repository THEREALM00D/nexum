import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useTranslation } from "react-i18next";

/** Titre + sous-titre de la page de config, avec le bouton « ouvrir le dossier ». */
export default function ConfigPageHeader({
  titleKey,
  subtitleKey,
  folderPath,
}: {
  titleKey: string;
  subtitleKey: string;
  folderPath: string;
}) {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="h6">{t(titleKey)}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t(subtitleKey)}
        </Typography>
        <Tooltip title={t("config.openFolder")}>
          <IconButton
            size="small"
            onClick={() => window.api.shell.openPath(folderPath)}
          >
            <FolderOpenIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
