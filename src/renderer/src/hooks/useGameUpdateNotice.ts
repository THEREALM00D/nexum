import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useServer } from "../context/ServerContext";
import { useNotification } from "../context/NotificationContext";
import { serverService } from "../services/serverService";

/**
 * Notifie quand la vérification faite au démarrage d'un serveur trouve une
 * version plus récente du jeu (`checkGameUpdateOnStart` côté main). Le bouton
 * « Mettre à jour » sélectionne ce serveur et ouvre la page Installation ;
 * pas de bouton pour une install de la bibliothèque Steam (c'est Steam qui
 * la met à jour).
 */
export function useGameUpdateNotice(openInstallPage: () => void): void {
  const { t } = useTranslation();
  const { state, switchActive } = useServer();
  const { notify } = useNotification();

  // Valeurs lues au moment de l'événement, sans réabonner l'écouteur
  const latest = useRef({ state, switchActive, openInstallPage, notify, t });
  latest.current = { state, switchActive, openInstallPage, notify, t };

  useEffect(
    () =>
      serverService.onGameUpdateAvailable((notice) => {
        const { state, switchActive, openInstallPage, notify, t } =
          latest.current;
        const name =
          state.servers.find((s) => s.id === notice.serverId)?.name ?? "";
        const params = { name, build: notice.latestBuild };
        if (notice.steamLibrary) {
          notify(t("gameUpdate.availableSteamLibrary", params), "warning");
          return;
        }
        notify(t("gameUpdate.available", params), "warning", {
          label: t("gameUpdate.update"),
          onClick: async () => {
            if (state.activeServerId !== notice.serverId) {
              await switchActive(notice.serverId);
            }
            openInstallPage();
          },
        });
      }),
    [],
  );
}
