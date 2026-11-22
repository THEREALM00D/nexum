import { BrowserWindow } from "electron/main";

// Événements envoyés par le main au renderer (lignes de log, nouvelle
// session, notices d'un serveur). La fenêtre est créée tout de suite (même
// cachée, au lancement avec Windows), mais son renderer met quelques
// secondes à poser ses écouteurs : un `webContents.send` fait avant est perdu
// (lignes d'une adoption, échec d'un démarrage automatique et son toast).
// Tout passe donc par une file jusqu'à `app:rendererReady`.

// Garde-fou : un serveur bavard adopté au démarrage ne doit pas remplir la
// mémoire si le renderer ne répond jamais. Les plus anciens partent d'abord.
const MAX_QUEUED = 5000;

let rendererReady = false;
const queue: { channel: string; payload: unknown }[] = [];

function sendNow(channel: string, payload: unknown): void {
  BrowserWindow.getAllWindows().forEach((window) =>
    window.webContents.send(channel, payload),
  );
}

export function sendToRenderer(channel: string, payload: unknown): void {
  if (rendererReady) {
    sendNow(channel, payload);
    return;
  }
  queue.push({ channel, payload });
  if (queue.length > MAX_QUEUED) queue.shift();
}

/**
 * Le renderer écoute (fin de l'effet de montage de `ServerProvider`) : la
 * file part dans l'ordre (une `server:logSession` avant ses lignes).
 */
export function markRendererReady(): void {
  rendererReady = true;
  for (const { channel, payload } of queue.splice(0)) sendNow(channel, payload);
}
