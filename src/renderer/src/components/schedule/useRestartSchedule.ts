import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../context/NotificationContext";
import type { RestartConfig } from "@shared/types";
import { DEFAULT_RESTART, MAX_WARNING_MINUTES } from "@shared/restartSchedule";
import { errorMessage } from "../../utils/appErrorMessage";
import { isIntegerInRange } from "./integerInput";

/** Formulaire de la page Planification, passé aux cartes propres à un jeu. */
export interface ScheduleForm {
  config: RestartConfig;
  update: (patch: Partial<RestartConfig>) => void;
  loading: boolean;
}

/**
 * Enregistrement refusé (le formulaire dit quoi corriger) : heures fixes
 * activées sans heure ou sans jour (rien ne serait planifié), ou nombre
 * vide ou hors bornes dans un réglage actif.
 */
export function isScheduleInvalid(config: RestartConfig): boolean {
  const { enabled, mode, wildDinos } = config;
  return (
    (enabled &&
      mode === "times" &&
      (config.times.length === 0 || config.weekdays.length === 0)) ||
    (enabled &&
      mode === "interval" &&
      !isIntegerInRange(config.intervalHours, 1, 24)) ||
    (config.checkUpdates &&
      !isIntegerInRange(config.updateWarningMinutes, 0, MAX_WARNING_MINUTES)) ||
    (wildDinos.repeat && !isIntegerInRange(wildDinos.everyHours, 1, 168))
  );
}

/** Lecture / écriture du redémarrage planifié du serveur actif. */
export function useRestartSchedule() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [config, setConfig] = useState<RestartConfig>(DEFAULT_RESTART);
  const [dirty, setDirty] = useState(false);
  // Vrai tant que la config n'est pas lue : la page affiche des skeletons
  // plutôt que DEFAULT_RESTART (l'interrupteur passait de OFF à ON).
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.api.schedule
      .getRestart()
      .then(setConfig)
      .catch((error) => notify(errorMessage(t, error), "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (patch: Partial<RestartConfig>) => {
    setConfig((previous) => ({ ...previous, ...patch }));
    setDirty(true);
  };

  const save = async () => {
    try {
      // Relu après l'écriture : le main trie et nettoie les valeurs.
      await window.api.schedule.setRestart(config);
      setConfig(await window.api.schedule.getRestart());
      setDirty(false);
      notify(t("schedule.notify.saved"), "success");
    } catch (error) {
      notify(errorMessage(t, error, t("schedule.notify.saveFailed")), "error");
    }
  };

  return {
    config,
    loading,
    dirty,
    invalid: isScheduleInvalid(config),
    update,
    save,
  };
}
