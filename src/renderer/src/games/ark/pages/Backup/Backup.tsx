import { useServer } from "../../../../context/ServerContext";
import BackupPage from "../../../../components/backup/BackupPage";
import { arkConfigService } from "../../services/configService";

export default function ArkBackup() {
  const { state } = useServer();

  // Dossier du monde de la carte choisie : SavedArks/<Carte>.
  const openSaveFolder = async () => {
    const { map } = await arkConfigService
      .readConfig()
      .catch(() => ({ map: "TheIsland_WP" }));
    window.api.shell.openPath(
      `${state.serverPath}/ShooterGame/Saved/SavedArks/${map}`,
    );
  };

  return (
    <BackupPage
      subtitleKey="arkBackup.subtitle"
      autoNoteKey="arkBackup.autoNote"
      onOpenSaveFolder={openSaveFolder}
      openFolderTooltipKey="arkBackup.openWorldFolder"
    />
  );
}
