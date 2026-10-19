import { useEffect, useState } from "react";
import { Alert, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../../context/NotificationContext";
import RestartSchedulePage from "../../../../components/schedule/RestartSchedulePage";

/**
 * Planification Palworld : la page partagée, plus un avertissement quand
 * l'API REST est désactivée (sans elle, ni annonce ni sauvegarde avant
 * l'arrêt).
 */
export default function Schedule() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [apiEnabled, setApiEnabled] = useState<boolean | null>(null);

  const checkApi = async () => {
    try {
      const settings = await window.api.palconfig.read();
      setApiEnabled(settings.RESTAPIEnabled === true);
    } catch {
      setApiEnabled(null);
    }
  };

  useEffect(() => {
    checkApi();
  }, []);

  const handleEnableApi = async () => {
    try {
      const settings = await window.api.palconfig.read();
      const res = await window.api.palconfig.write({
        ...settings,
        RESTAPIEnabled: true,
      });
      if (res.success) {
        notify(t("palworldSchedule.notify.apiEnabled"), "success");
        await checkApi();
      } else {
        notify(res.error || t("palworldSchedule.notify.apiEnableFailed"));
      }
    } catch {
      notify(t("palworldSchedule.notify.apiCannotWrite"));
    }
  };

  return (
    <RestartSchedulePage
      notice={
        apiEnabled === false && (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={handleEnableApi}>
                {t("palworldSchedule.enableApi")}
              </Button>
            }
          >
            {t("palworldSchedule.apiWarning")}
          </Alert>
        )
      }
    />
  );
}
