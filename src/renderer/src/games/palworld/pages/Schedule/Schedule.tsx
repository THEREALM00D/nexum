import RestartSchedulePage from "../../../../components/schedule/RestartSchedulePage";
import RemoteAdminNotice from "../../../../components/schedule/RemoteAdminNotice";

/**
 * Planification Palworld : la page partagée, plus un avertissement quand
 * l'API REST est désactivée (sans elle, ni annonce ni sauvegarde avant
 * l'arrêt).
 */
export default function Schedule() {
  return (
    <RestartSchedulePage
      notice={
        <RemoteAdminNotice
          readEnabled={async () =>
            (await window.api.palconfig.read()).RESTAPIEnabled === true
          }
          enable={async () =>
            window.api.palconfig.write({
              ...(await window.api.palconfig.read()),
              RESTAPIEnabled: true,
            })
          }
          warningKey="palworldSchedule.apiWarning"
          buttonKey="palworldSchedule.enableApi"
          enabledKey="palworldSchedule.notify.apiEnabled"
          failedKey="palworldSchedule.notify.apiEnableFailed"
          cannotWriteKey="palworldSchedule.notify.apiCannotWrite"
        />
      }
    />
  );
}
