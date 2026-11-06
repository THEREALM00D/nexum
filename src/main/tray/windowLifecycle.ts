import { app, BrowserWindow, Notification } from "electron/main";
import { getLanguage } from "../i18n/language";
import type { IpcContext } from "../ipc/context";
import { confirmAndStopServers } from "../server/quitGuard";
import { createAppTray } from "./AppTray";
import { trayStrings } from "./trayStrings";

// Vrai une fois qu'une vraie fermeture est validée (menu Quitter, mise à jour
// de l'app, fenêtre fermée sans zone de notification) : la fenêtre se ferme
// alors vraiment. Passe par `attachQuitGuard` : serveurs lancés par Nexum
// arrêtés proprement d'abord.
let isQuitting = false;
// idle → pending (confirmation / arrêt des serveurs en cours) → ready.
let quitState: "idle" | "pending" | "ready" = "idle";

/**
 * Garde de fermeture : tant que les serveurs lancés par Nexum n'ont pas été
 * arrêtés (ils mourraient avec lui, sans sauvegarde), `before-quit` est
 * annulé, la confirmation affichée, puis `app.quit()` relancé. Un 2e Quitter
 * pendant l'arrêt est ignoré. ⚠️ Electron n'émet pas `before-quit` à l'arrêt
 * de Windows : rien n'est fait dans ce cas.
 */
function attachQuitGuard(
  ctx: IpcContext,
  getWindow: () => BrowserWindow | null,
): void {
  app.on("before-quit", (e) => {
    if (quitState === "ready") {
      isQuitting = true;
      return;
    }
    e.preventDefault();
    if (quitState === "pending") return;
    quitState = "pending";
    confirmAndStopServers(ctx, getWindow())
      .catch(() => true)
      .then((ok) => {
        quitState = ok ? "ready" : "idle";
        if (ok) app.quit();
      });
  });
}

export const closeToTrayEnabled = (ctx: IpcContext | null): boolean =>
  ctx?.store.get("closeToTray", true) ?? true;

export function showWindow(win: BrowserWindow | null): void {
  if (!win || win.isDestroyed()) return;
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

/**
 * Fermer la fenêtre la cache au lieu de quitter (réglage `closeToTray`, actif
 * par défaut) : sauvegardes auto, redémarrages planifiés, logs de session et
 * démarrage avec Windows ont besoin que Nexum tourne. La première fois, une
 * notification explique où est passé Nexum.
 */
export function attachCloseToTray(
  win: BrowserWindow,
  getCtx: () => IpcContext | null,
): void {
  win.on("close", (e) => {
    const ctx = getCtx();
    if (isQuitting) return;
    e.preventDefault();
    // Sans zone de notification, fermer = quitter : on passe par la garde de
    // fermeture AVANT de détruire la fenêtre (la confirmation s'y rattache).
    if (!closeToTrayEnabled(ctx)) {
      app.quit();
      return;
    }
    win.hide();
    if (ctx && !ctx.store.get("trayHintShown", false)) {
      ctx.store.set("trayHintShown", true);
      const s = trayStrings(getLanguage());
      if (Notification.isSupported()) {
        new Notification({ title: s.hintTitle, body: s.hintBody }).show();
      }
    }
  });
}

export function setupTray(
  ctx: IpcContext,
  getWindow: () => BrowserWindow | null,
) {
  attachQuitGuard(ctx, getWindow);
  return createAppTray(ctx, {
    showWindow: () => showWindow(getWindow()),
    quit: () => app.quit(),
    getLanguage,
  });
}
