import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../context/NotificationContext";
import type { RestartConfig } from "@shared/types";

const DEFAULT_RESTART: RestartConfig = {
  enabled: false,
  time: "04:00",
  warningMinutes: 5,
  message: "Le serveur va redémarrer dans {minutes} minutes",
  updateGame: false,
};

/** Lecture / écriture du redémarrage planifié du serveur actif. */
export function useRestartSchedule() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [cfg, setCfg] = useState<RestartConfig>(DEFAULT_RESTART);
  const [dirty, setDirty] = useState(false);
  // Vrai tant que la config n'est pas lue : la page affiche des skeletons
  // plutôt que DEFAULT_RESTART (l'interrupteur passait de OFF à ON).
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.api.schedule
      .getRestart()
      .then(setCfg)
      .catch((e) => notify((e as Error).message, "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (patch: Partial<RestartConfig>) => {
    setCfg((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const save = async () => {
    try {
      await window.api.schedule.setRestart(cfg);
      setDirty(false);
      notify(t("schedule.notify.saved"), "success");
    } catch (e) {
      notify((e as Error).message || t("schedule.notify.saveFailed"), "error");
    }
  };

  return { cfg, loading, dirty, update, save };
}
