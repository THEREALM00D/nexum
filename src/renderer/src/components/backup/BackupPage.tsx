import type { ReactNode } from "react";
import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useBackup } from "../../hooks/useBackup";
import BackupConfigPanel from "./BackupConfig";
import BackupList from "./BackupList";
import PageHeader from "../common/PageHeader";

interface BackupPageProps {
  subtitleKey: string;
  /**
   * Texte sous l'intervalle de sauvegarde auto : ce que contient une
   * sauvegarde faite serveur lancé (sauvegarde forcée ou dernière
   * autosauvegarde du jeu). Obligatoire : chaque jeu doit le dire.
   */
  autoNoteKey: string;
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
  autoNoteKey,
  onOpenSaveFolder,
  openFolderTooltipKey,
  renderExtra,
}: BackupPageProps) {
  const { t } = useTranslation();
  const backup = useBackup();

  return (
    <Stack spacing={3} sx={{ height: "100%" }}>
      <PageHeader
        title={t("backup.title")}
        subtitle={t(subtitleKey)}
        onOpenFolder={onOpenSaveFolder}
        folderTooltip={openFolderTooltipKey && t(openFolderTooltipKey)}
      />

      <BackupConfigPanel
        config={backup.config}
        loading={backup.loading}
        onSelectDir={backup.handleSelectDir}
        onConfigChange={backup.handleConfigChange}
        autoNoteKey={autoNoteKey}
      />

      {renderExtra?.(backup.refresh)}

      <BackupList
        backups={backup.backups}
        loading={backup.loading}
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
