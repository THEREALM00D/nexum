import type { ServerStatus } from "../../shared/types";
import type { AppLanguage } from "../i18n/language";

// Le main n'a pas react-i18next : textes du menu de l'icône, de la
// notification « Nexum continue en arrière-plan » et de la confirmation avant
// de quitter (`server/quitGuard.ts`), en FR et EN. La langue vient du
// renderer (IPC `app:setLanguage`), mémorisée dans le store.
export type TrayLanguage = AppLanguage;

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
    quitTitle: "Quitter Nexum",
    quitMessage: (n: number) =>
      n > 1
        ? `${n} serveurs lancés par Nexum sont en ligne`
        : "Un serveur lancé par Nexum est en ligne",
    quitDetail: (names: string) =>
      `${names}

Ils s'arrêtent avec Nexum : Nexum va d'abord les arrêter proprement (sauvegarde du monde), puis se fermer. Cela peut prendre jusqu'à une minute.`,
    quitStop: "Arrêter et quitter",
    quitCancel: "Annuler",
    stoppingTitle: "Arrêt des serveurs",
    stoppingBody: "Nexum arrête proprement les serveurs et se fermera ensuite.",
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
    quitTitle: "Quit Nexum",
    quitMessage: (n: number) =>
      n > 1
        ? `${n} servers started by Nexum are online`
        : "A server started by Nexum is online",
    quitDetail: (names: string) =>
      `${names}

They stop with Nexum: Nexum will first stop them cleanly (the world is saved), then quit. This can take up to a minute.`,
    quitStop: "Stop and quit",
    quitCancel: "Cancel",
    stoppingTitle: "Stopping servers",
    stoppingBody:
      "Nexum is stopping the servers cleanly and will quit afterwards.",
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
