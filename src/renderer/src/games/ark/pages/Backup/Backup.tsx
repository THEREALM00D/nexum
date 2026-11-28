import { useServer } from "../../../../context/ServerContext";
import BackupPage from "../../../../components/backup/BackupPage";
import { arkConfigService } from "../../services/configService";
import ProfilesTab from "./components/ProfilesTab";

// Onglet à côté de « Monde » : profils des joueurs, sauvegardés à part.
const TABS = [
  {
    value: "profiles",
    labelKey: "arkBackup.profiles.tab",
    render: () => <ProfilesTab />,
  },
];

export default function ArkBackup() {
  const { state } = useServer();

  // Dossier du monde de la carte choisie : Saved/SavedArks/<Carte>, ou
  // Saved/<dossier>/<Carte> avec AltSaveDirectoryName (comme getSavePath).
  const openSaveFolder = async () => {
    const { map, saveDirectory } = await arkConfigService
      .readConfig()
      .catch(() => ({ map: "TheIsland_WP", saveDirectory: "" }));
    window.api.shell.openPath(
      `${state.serverPath}/ShooterGame/Saved/${saveDirectory || "SavedArks"}/${map}`,
    );
  };

  return (
    <BackupPage
      subtitleKey="arkBackup.subtitle"
      autoNoteKey="arkBackup.autoNote"
      onOpenSaveFolder={openSaveFolder}
      openFolderTooltipKey="arkBackup.openWorldFolder"
      tabs={TABS}
    />
  );
}
