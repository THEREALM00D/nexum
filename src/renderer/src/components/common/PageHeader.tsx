import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import type { ReactNode } from "react";

/** En-tête de page : titre, sous-titre, « ouvrir le dossier », actions à droite. */
export default function PageHeader({
  title,
  subtitle,
  actions,
  onOpenFolder,
  folderTooltip = "",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  onOpenFolder?: () => void;
  folderTooltip?: string;
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
        <Typography variant="h1">{title}</Typography>
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
