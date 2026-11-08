import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import type { ReactNode } from "react";
import SectionTitle from "./SectionTitle";

/**
 * En-tête de page : titre, sous-titre, bouton « ouvrir le dossier » et
 * actions à droite. `embedded` : page affichée dans une autre (logs du
 * Dashboard), le titre devient un titre de section.
 */
export default function PageHeader({
  title,
  subtitle,
  actions,
  onOpenFolder,
  folderTooltip = "",
  embedded = false,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  onOpenFolder?: () => void;
  folderTooltip?: string;
  embedded?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {embedded ? (
          <SectionTitle>{title}</SectionTitle>
        ) : (
          <Typography variant="h1">{title}</Typography>
        )}
        {(subtitle || onOpenFolder) && (
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}
          >
            {subtitle && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {subtitle}
              </Typography>
            )}
            {onOpenFolder && (
              <Tooltip title={folderTooltip}>
                <IconButton size="small" onClick={onOpenFolder}>
                  <FolderOpenIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
      {actions}
    </Box>
  );
}
