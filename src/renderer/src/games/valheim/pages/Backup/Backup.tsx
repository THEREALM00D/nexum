import BackupPage from "../../../../components/backup/BackupPage";
import { useValheimConfig } from "../Config/hooks/useValheimConfig";

export default function ValheimBackup() {
  const { config } = useValheimConfig();
  return (
    <BackupPage
      subtitleKey="valheimBackup.subtitle"
      onOpenSaveFolder={() => window.api.valheim.openSaveFolder(config.savedir)}
      openFolderTooltipKey="valheimBackup.openWorldFolder"
    />
  );
}
