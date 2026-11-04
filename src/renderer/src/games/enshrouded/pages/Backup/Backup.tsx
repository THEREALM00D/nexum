import { useServer } from "../../../../context/ServerContext";
import BackupPage from "../../../../components/backup/BackupPage";
import { enshroudedConfigService } from "../../services/configService";

// saveDirectory : relatif au dossier du serveur (./savegame) ou absolu.
const isAbsolute = (dir: string) => /^([A-Za-z]:[\\/]|[\\/]{2})/.test(dir);

export default function EnshroudedBackup() {
  const { state } = useServer();

  const openSaveFolder = async () => {
    const { saveDirectory } = await enshroudedConfigService
      .readConfig()
      .catch(() => ({ saveDirectory: "./savegame" }));
    const dir = saveDirectory || "./savegame";
    window.api.shell.openPath(
      isAbsolute(dir)
        ? dir
        : `${state.serverPath}/${dir.replace(/^\.[\\/]/, "")}`,
    );
  };

  return (
    <BackupPage
      subtitleKey="enshroudedBackup.subtitle"
      onOpenSaveFolder={openSaveFolder}
      openFolderTooltipKey="enshroudedBackup.openWorldFolder"
    />
  );
}
