import RestartSchedulePage from "../../../../components/schedule/RestartSchedulePage";
import RemoteAdminNotice from "../../../../components/schedule/RemoteAdminNotice";
import { arkConfigService } from "../../services/configService";

/**
 * Planification ARK : la page partagée, plus un avertissement quand RCON est
 * désactivé (sans lui, ni annonce ni sauvegarde avant l'arrêt).
 */
export default function ArkSchedule() {
  return (
    <RestartSchedulePage
      notice={
        <RemoteAdminNotice
          readEnabled={arkConfigService.isRconEnabled}
          enable={arkConfigService.enableRcon}
          warningKey="arkSchedule.rconWarning"
          buttonKey="arkSchedule.enableRcon"
          enabledKey="arkSchedule.rconEnabled"
          lockedHintKey="arkSchedule.stopFirst"
        />
      }
    />
  );
}
