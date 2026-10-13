import { app, BrowserWindow, Notification } from "electron/main";
import type { IpcContext } from "../ipc/context";
import { createAppTray } from "./AppTray";
import { trayStrings } from "./trayStrings";

// Vrai une fois qu'une vraie fermeture est demandée (menu Quitter, mise à
// jour de l'app, arrêt de Windows) : la fenêtre se ferme alors vraiment.
let isQuitting = false;
app.on("before-quit", () => {
  isQuitting = true;
});

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
    if (isQuitting || !closeToTrayEnabled(ctx)) return;
    e.preventDefault();
    win.hide();
    if (ctx && !ctx.store.get("trayHintShown", false)) {
      ctx.store.set("trayHintShown", true);
      const s = trayStrings(ctx.store.get("language", "fr"));
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
  return createAppTray(ctx, {
    showWindow: () => showWindow(getWindow()),
    quit: () => {
      isQuitting = true;
      app.quit();
    },
    getLanguage: () => ctx.store.get("language", "fr"),
  });
}
