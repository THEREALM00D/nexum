import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  EnshroudedGameSettingValue,
  EnshroudedSettings,
} from "@shared/types";
import { useNotification } from "../../../../../context/NotificationContext";
import { useConfigLoad } from "../../../../../components/config/useConfigLoad";
import { appErrorMessage } from "../../../../../utils/appErrorMessage";
import { enshroudedConfigService } from "../../../services/configService";
import { CUSTOM_PRESET } from "../gameSettingsFields";

// Forme des données pendant le chargement (masquées par les skeletons).
const PLACEHOLDER: EnshroudedSettings = {
  name: "Enshrouded Server",
  ip: "0.0.0.0",
  queryPort: 15637,
  slotCount: 16,
  voiceChatMode: "Proximity",
  enableVoiceChat: false,
  enableTextChat: false,
  gameSettingsPreset: "Default",
  gameSettings: {},
  saveDirectory: "./savegame",
  logDirectory: "./logs",
  customArgs: "",
};

const SAVE_FLASH_MS = 2000;

/**
 * Config d'Enshrouded (même rôle que useValheimConfig). Le serveur réécrit
 * son JSON à chaque démarrage : enregistrement bloqué serveur lancé, fichier
 * relu à l'arrêt (useConfigLoad).
 */
export function useEnshroudedConfig() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [config, setConfig] = useState<EnshroudedSettings>(PLACEHOLDER);
  const [saved, setSaved] = useState(false);
  const { loading, locked, markDirty, markClean } = useConfigLoad(
    enshroudedConfigService.readConfig,
    setConfig,
    true,
  );

  const handleChange = (patch: Partial<EnshroudedSettings>) => {
    markDirty();
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  // Un réglage fin n'est lu qu'en preset Custom : le modifier y passe.
  const handleSettingChange = (
    key: string,
    value: EnshroudedGameSettingValue,
  ) => {
    markDirty();
    setConfig((prev) => ({
      ...prev,
      gameSettingsPreset: CUSTOM_PRESET,
      gameSettings: { ...prev.gameSettings, [key]: value },
    }));
  };

  const handleSave = async () => {
    try {
      const res = await enshroudedConfigService.writeConfig(config);
      if (!res.success) {
        notify(
          appErrorMessage(t, res.error, t("config.unknownError")),
          "error",
        );
        return;
      }
      markClean();
      setSaved(true);
      setTimeout(() => setSaved(false), SAVE_FLASH_MS);
    } catch (e) {
      notify(appErrorMessage(t, (e as Error).message), "error");
    }
  };

  return {
    config,
    loading,
    locked,
    saved,
    handleChange,
    handleSettingChange,
    handleSave,
  };
}
