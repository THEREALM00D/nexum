import { useServer } from "../../../../context/ServerContext";
import SimpleDashboard from "../../../../components/server/SimpleDashboard";
import RemoteAdminNotice from "../../../../components/schedule/RemoteAdminNotice";
import { arkConfigService } from "../../services/configService";
import { useArkPlayers } from "./hooks/useArkPlayers";

export default function ArkDashboard() {
  const { state } = useServer();
  const players = useArkPlayers(state.status === "running");

  return (
    <SimpleDashboard
      noServerPathKey="arkDashboard.noServerPath"
      infoKey="arkDashboard.info"
      players={players}
      // Sans RCON : arrêt sans sauvegarde, ni joueurs ni annonces.
      warning={
        <RemoteAdminNotice
          readEnabled={arkConfigService.isRconEnabled}
          enable={arkConfigService.enableRcon}
          warningKey="arkDashboard.rconWarning"
          buttonKey="arkSchedule.enableRcon"
          enabledKey="arkSchedule.rconEnabled"
          lockedHintKey="arkSchedule.stopFirst"
        />
      }
    />
  );
}
