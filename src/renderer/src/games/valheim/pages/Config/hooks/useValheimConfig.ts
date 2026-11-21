import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../../../context/NotificationContext";
import { errorMessage } from "../../../../../utils/appErrorMessage";
import type { ValheimLaunchConfig, ValheimModifiers } from "@shared/types";

const DEFAULT_MODIFIERS: ValheimModifiers = {
  combat: "",
  deathpenalty: "",
  resources: "",
  raids: "",
  portals: "",
};

const DEFAULT_CONFIG: ValheimLaunchConfig = {
  name: "",
  world: "Dedicated",
  password: "",
  port: 2456,
  public: true,
  savedir: "",
  crossplay: false,
  logFile: "",
  customArgs: "",
  worldSeed: "",
  worldSize: "",
  modifierPreset: "",
  modifiers: DEFAULT_MODIFIERS,
  odinEyeUrl: "",
};

export function useValheimConfig() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [config, setConfig] = useState<ValheimLaunchConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.api.valheim
      .getConfig()
      .then((savedConfig) => setConfig({ ...DEFAULT_CONFIG, ...savedConfig }))
      .catch((error) =>
        notify(
          t("valheimConfig.loadFailed", { error: errorMessage(t, error) }),
          "error",
        ),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (patch: Partial<ValheimLaunchConfig>) => {
    setConfig((previous) => ({ ...previous, ...patch }));
  };

  const handleSave = async () => {
    try {
      await window.api.valheim.setConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      notify(
        t("valheimConfig.saveFailed", { error: errorMessage(t, error) }),
        "error",
      );
    }
  };

  return { config, loading, saved, handleChange, handleSave };
}
