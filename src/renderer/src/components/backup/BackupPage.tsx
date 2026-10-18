import type { ReactNode } from "react";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useTranslation } from "react-i18next";
import { useBackup } from "../../hooks/useBackup";
import BackupConfigPanel from "./BackupConfig";
import BackupList from "./BackupList";

interface BackupPageProps {
  subtitleKey: string;
  /** Bouton « ouvrir le dossier des sauvegardes du jeu » à côté du sous-titre. */
  onOpenSaveFolder?: () => void;
  openFolderTooltipKey?: string;
  /**
   * Contenu propre au jeu, entre la configuration et la liste (ex : import
   * d'un monde solo). Reçoit `refresh` pour recharger la liste des
   * sauvegardes après une action qui en crée une.
   */
  renderExtra?: (refresh: () => Promise<void>) => ReactNode;
}

/** Page « Sauvegardes » commune aux jeux : seuls le texte et les extras changent. */
export default function BackupPage({
  subtitleKey,
  onOpenSaveFolder,
  openFolderTooltipKey,
  renderExtra,
}: BackupPageProps) {
  const { t } = useTranslation();
  const backup = useBackup();

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h6">{t("backup.title")}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t(subtitleKey)}
          </Typography>
          {onOpenSaveFolder && openFolderTooltipKey && (
            <Tooltip title={t(openFolderTooltipKey)}>
              <IconButton size="small" onClick={onOpenSaveFolder}>
                <FolderOpenIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </div>

      <BackupConfigPanel
        config={backup.config}
        onSelectDir={backup.handleSelectDir}
        onConfigChange={backup.handleConfigChange}
      />

      {renderExtra?.(backup.refresh)}

      <BackupList
        backups={backup.backups}
        creating={backup.creating}
        restoring={backup.restoring}
        serverPath={backup.serverPath}
        status={backup.status}
        onCreate={backup.handleCreate}
        onRestore={backup.handleRestore}
        onDelete={backup.handleDelete}
      />
    </Stack>
  );
}
