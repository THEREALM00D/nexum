import type { ServerStatus } from "../../shared/types";

// Le main n'a pas react-i18next : textes du menu de l'icône et de la
// notification « Nexum continue en arrière-plan », en FR et EN. La langue
// vient du renderer (IPC `app:setLanguage`), mémorisée dans le store.
export type TrayLanguage = "fr" | "en";

const STRINGS = {
  fr: {
    open: "Ouvrir Nexum",
    quit: "Quitter Nexum",
    start: "Démarrer",
    stop: "Arrêter",
    restart: "Redémarrer",
    noServers: "Aucun serveur",
    tooltip: (running: number) =>
      running === 0
        ? "Nexum — aucun serveur en ligne"
        : `Nexum — ${running} serveur${running > 1 ? "s" : ""} en ligne`,
    hintTitle: "Nexum tourne toujours",
    hintBody:
      "Nexum reste ouvert dans la zone de notification pour garder vos sauvegardes et redémarrages planifiés. Clic droit sur l'icône pour quitter. Réglable dans Paramètres.",
    status: {
      running: "En ligne",
      starting: "Démarrage…",
      stopping: "Arrêt…",
      stopped: "Arrêté",
      crashed: "Planté",
    } as Record<ServerStatus, string>,
  },
  en: {
    open: "Open Nexum",
    quit: "Quit Nexum",
    start: "Start",
    stop: "Stop",
    restart: "Restart",
    noServers: "No servers",
    tooltip: (running: number) =>
      running === 0
        ? "Nexum — no server online"
        : `Nexum — ${running} server${running > 1 ? "s" : ""} online`,
    hintTitle: "Nexum is still running",
    hintBody:
      "Nexum stays in the notification area to keep your scheduled backups and restarts running. Right-click the icon to quit. You can change this in Settings.",
    status: {
      running: "Online",
      starting: "Starting…",
      stopping: "Stopping…",
      stopped: "Stopped",
      crashed: "Crashed",
    } as Record<ServerStatus, string>,
  },
};

export const trayStrings = (lang: TrayLanguage) => STRINGS[lang] ?? STRINGS.fr;
