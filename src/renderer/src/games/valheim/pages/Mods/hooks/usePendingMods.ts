import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PendingMod } from "@shared/types";
import { useServer } from "../../../../../context/ServerContext";
import { useNotification } from "../../../../../context/NotificationContext";
import { errorMessage } from "../../../../../utils/appErrorMessage";

/**
 * Mods d'un serveur importé depuis un autre PC (« Déplacer un serveur »),
 * réinstallés par leur code. Rien n'est proposé tant que le jeu n'est pas
 * installé dans le dossier du serveur (BepInEx s'installe dedans).
 */
export function usePendingMods(onInstalled: () => void) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { state } = useServer();
  const server = state.servers.find((s) => s.id === state.activeServerId);
  const [pending, setPending] = useState<PendingMod[]>([]);
  const [gameInstalled, setGameInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!server) return;
    window.api.valheim.mods
      .getPending(server.id)
      .then(setPending)
      .catch(() => setPending([]));
    window.api.servers
      .hasExpectedExe(server.path, server.gameType)
      .then(setGameInstalled)
      .catch(() => setGameInstalled(false));
  }, [server]);

  const install = async () => {
    if (!server) return;
    setInstalling(true);
    try {
      const { installed, errors } =
        await window.api.valheim.mods.installPending(server.id);
      setPending(await window.api.valheim.mods.getPending(server.id));
      onInstalled();
      if (errors.length > 0)
        notify(
          t("valheimMods.pending.errors", { count: errors.length }),
          "warning",
        );
      else
        notify(
          t("valheimMods.pending.success", { count: installed.length }),
          "success",
        );
    } catch (e) {
      notify(errorMessage(t, e), "error");
    } finally {
      setInstalling(false);
    }
  };

  const dismiss = async () => {
    if (!server) return;
    await window.api.valheim.mods.dismissPending(server.id);
    setPending([]);
  };

  return {
    count: gameInstalled ? pending.length : 0,
    installing,
    install,
    dismiss,
  };
}
