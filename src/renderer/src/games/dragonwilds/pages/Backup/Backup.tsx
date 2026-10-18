import { useServer } from "../../../../context/ServerContext";
import BackupPage from "../../../../components/backup/BackupPage";
import WorldsCard from "./components/WorldsCard";

export default function DragonwildsBackup() {
  const { state } = useServer();
  return (
    <BackupPage
      subtitleKey="dragonwildsBackup.subtitle"
      onOpenSaveFolder={() =>
        window.api.shell.openPath(
          `${state.serverPath}/RSDragonwilds/Saved/SaveGames`,
        )
      }
      openFolderTooltipKey="dragonwildsBackup.openWorldFolder"
      renderExtra={(refresh) => <WorldsCard onImported={refresh} />}
    />
  );
}
