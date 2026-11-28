import { useState, type ReactNode } from "react";
import { Stack, Tab, Tabs } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useBackup } from "../../hooks/useBackup";
import BackupConfigPanel from "./BackupConfig";
import BackupList from "./BackupList";
import PageHeader from "../common/PageHeader";
import ConfigBackupTab from "./config/ConfigBackupTab";

/** Onglet propre au jeu, à côté de « Monde » (ARK : profils des joueurs). */
export interface BackupTab {
  value: string;
  labelKey: string;
  render: () => ReactNode;
}

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
  /** Onglets du jeu, entre « Monde » et « Configuration » (commun). */
  tabs?: BackupTab[];
}

const WORLD_TAB = "world";
// Copies des fichiers de config du jeu : pour tous les jeux.
const CONFIG_TAB: BackupTab = {
  value: "config",
  labelKey: "backup.tabs.config",
  render: () => <ConfigBackupTab />,
};

/** Page « Sauvegardes » commune aux jeux : seuls le texte et les extras changent. */
export default function BackupPage({
  subtitleKey,
  autoNoteKey,
  onOpenSaveFolder,
  openFolderTooltipKey,
  renderExtra,
  tabs,
}: BackupPageProps) {
  const { t } = useTranslation();
  const backup = useBackup();
  const [tab, setTab] = useState(WORLD_TAB);
  const allTabs = [...(tabs ?? []), CONFIG_TAB];
  const gameTab = allTabs.find((candidate) => candidate.value === tab);

  return (
    <Stack spacing={3} sx={{ height: "100%" }}>
      <PageHeader
        title={t("backup.title")}
        subtitle={t(subtitleKey)}
        onOpenFolder={onOpenSaveFolder}
        folderTooltip={openFolderTooltipKey && t(openFolderTooltipKey)}
      />

      <Tabs
        value={tab}
        onChange={(_, value: string) => setTab(value)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
      >
        <Tab value={WORLD_TAB} label={t("backup.tabs.world")} />
        {allTabs.map((candidate) => (
          <Tab
            key={candidate.value}
            value={candidate.value}
            label={t(candidate.labelKey)}
          />
        ))}
      </Tabs>

      {gameTab ? (
        gameTab.render()
      ) : (
        <>
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
        </>
      )}
    </Stack>
  );
}
