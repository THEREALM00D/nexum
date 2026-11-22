import { BrowserWindow, Notification } from "electron/main";
import type {
  AutoRestartGaveUpNotice,
  AutoStartFailedNotice,
  Server,
} from "../../shared/types";
import { getLanguage } from "../i18n/language";
import { sendToRenderer } from "../ipc/rendererEvents";
import { showWindow } from "../tray/windowLifecycle";
import { trayStrings } from "../tray/trayStrings";

// Alertes d'un serveur que Nexum gère seul : toast dans l'app (bouton « Voir
// les logs », `hooks/useServerNotices`) et, si personne ne regarde la
// fenêtre (cachée dans la zone de notification, en arrière-plan, ou Nexum
// lancé avec Windows), notification Windows qui la rouvre au clic.

// Référence gardée : une Notification libérée par le ramasse-miettes ne
// reçoit plus son `click`.
let lastNotification: Notification | null = null;

function alertIfUnwatched(title: string, body: string): void {
  const windows = BrowserWindow.getAllWindows();
  const watched = windows.some(
    (window) => window.isVisible() && window.isFocused(),
  );
  if (watched || !Notification.isSupported()) return;
  lastNotification = new Notification({ title, body });
  lastNotification.on("click", () => showWindow(windows[0] ?? null));
  lastNotification.show();
}

/** Relance après plantage abandonnée (`crashRestart.ts`). */
export function notifyGaveUp(
  server: Server,
  crashes: number,
  minutes: number,
): void {
  const notice: AutoRestartGaveUpNotice = {
    serverId: server.id,
    crashes,
    minutes,
  };
  sendToRenderer("server:autoRestartGaveUp", notice);
  const strings = trayStrings(getLanguage());
  alertIfUnwatched(
    strings.crashGaveUpTitle,
    strings.crashGaveUpBody(server.name, crashes, minutes),
  );
}

/**
 * Démarrage auto à l'ouverture ou relance après plantage qui échoue : le
 * serveur reste arrêté sans que personne l'ait demandé.
 */
export function notifyStartFailed(
  server: Server,
  kind: AutoStartFailedNotice["kind"],
  error: string,
): void {
  const notice: AutoStartFailedNotice = { serverId: server.id, kind, error };
  sendToRenderer("server:autoStartFailed", notice);
  const strings = trayStrings(getLanguage());
  alertIfUnwatched(
    kind === "autoStart"
      ? strings.autoStartFailedTitle
      : strings.autoRestartFailedTitle,
    strings.startFailedBody(server.name),
  );
}
