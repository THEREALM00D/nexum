import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useServer } from "../context/ServerContext";
import { useNotification } from "../context/NotificationContext";
import { serverService } from "../services/serverService";

/**
 * Notifications des vérifications faites au démarrage d'un serveur (côté
 * main, en arrière-plan) :
 * - jeu pas à jour (`checkGameUpdateOnStart`) → bouton vers la page
 *   Installation, sauf install de la bibliothèque Steam (c'est Steam qui la
 *   met à jour) ;
 * - mods Valheim à mettre à jour ou dépréciés (`checkModUpdatesOnStart`) →
 *   bouton vers la page Mods.
 * Le bouton sélectionne d'abord le serveur concerné.
 */
export function useUpdateNotices(pages: {
  openInstallPage: () => void;
  openModsPage: () => void;
}): void {
  const { t } = useTranslation();
  const { state, switchActive } = useServer();
  const { notify } = useNotification();

  // Valeurs lues au moment de l'événement, sans réabonner les écouteurs
  const latest = useRef({ state, switchActive, pages, notify, t });
  latest.current = { state, switchActive, pages, notify, t };

  useEffect(() => {
    const serverName = (id: string) =>
      latest.current.state.servers.find((s) => s.id === id)?.name ?? "";
    const goTo = async (id: string, open: () => void) => {
      const { state, switchActive } = latest.current;
      if (state.activeServerId !== id) await switchActive(id);
      open();
    };

    const stopGame = serverService.onGameUpdateAvailable((notice) => {
      const { notify, t, pages } = latest.current;
      const params = {
        name: serverName(notice.serverId),
        build: notice.latestBuild,
      };
      if (notice.steamLibrary) {
        notify(t("gameUpdate.availableSteamLibrary", params), "warning");
        return;
      }
      notify(t("gameUpdate.available", params), "warning", {
        label: t("gameUpdate.update"),
        onClick: () => goTo(notice.serverId, pages.openInstallPage),
      });
    });

    const stopMods = serverService.onModUpdatesAvailable((notice) => {
      const { notify, t, pages } = latest.current;
      const name = serverName(notice.serverId);
      const message = [
        notice.updates > 0 &&
          t("modUpdate.available", { name, count: notice.updates }),
        notice.deprecated > 0 &&
          t("modUpdate.deprecated", { name, count: notice.deprecated }),
      ]
        .filter(Boolean)
        .join(" ");
      notify(message, "warning", {
        label: t("modUpdate.open"),
        onClick: () => goTo(notice.serverId, pages.openModsPage),
      });
    });

    return () => {
      stopGame();
      stopMods();
    };
  }, []);
}
