import { app, BrowserWindow, screen, session } from "electron/main";
import { shell } from "electron";
import { join } from "path";
import { existsSync } from "fs";
import { registerIpcHandlers } from "./ipc/handlers";
import { checkForUpdateOnStartup } from "./update/AutoUpdater";
import { launchedAtLogin } from "./startup/launchAtLogin";
import { appIconPath } from "./utils/appIcon";
import type { IpcContext } from "./ipc/context";
import {
  attachCloseToTray,
  closeToTrayEnabled,
  setupTray,
  showWindow,
} from "./tray/windowLifecycle";

// Dossier de données — doit être fixé avant `ready` et avant tout accès à
// userData.
// - Rebrand ServerForge → Nexum : une installation existante garde son dossier
//   (serveurs, historique joueurs, SteamCMD, backups par défaut). Le déplacer
//   casserait les chemins absolus persistés (dossier de backup, etc.) : on le
//   réutilise tel quel. ⚠️ Jusqu'à la 0.2.0, Electron nommait ce dossier
//   d'après le `name` du package.json (`server-forge`), PAS d'après le
//   productName « ServerForge » : c'est `%APPDATA%\server-forge` qu'il faut
//   retrouver (la 0.3.0 ne cherchait que `ServerForge` et démarrait à vide).
//   `ServerForge` reste en repli par sécurité. `config.json` = fichier
//   electron-store, présent dès qu'un dossier a réellement servi.
// - Dev : même dossier que l'app installée avant le rebrand (`server-forge`).
const LEGACY_USER_DATA_DIRS = ["server-forge", "ServerForge"];
if (!app.isPackaged) {
  // NEXUM_USER_DATA_DIR : dossier de données isolé (tests, premier lancement)
  // pour ne pas toucher aux vrais serveurs de l'app installée.
  app.setPath(
    "userData",
    process.env.NEXUM_USER_DATA_DIR ||
      join(app.getPath("appData"), "server-forge"),
  );
} else if (!existsSync(join(app.getPath("userData"), "config.json"))) {
  const legacy = LEGACY_USER_DATA_DIRS.map((d) =>
    join(app.getPath("appData"), d),
  ).find((dir) => existsSync(join(dir, "config.json")));
  if (legacy) app.setPath("userData", legacy);
}

// Une seule instance : avec l'icône de la zone de notification, rouvrir le
// raccourci doit ramener la fenêtre existante, pas lancer un 2e Nexum qui
// piloterait les mêmes serveurs. Pas en dev : le dossier de données est
// partagé avec l'app installée, qui bloquerait `yarn dev`.
const gotLock = !app.isPackaged || app.requestSingleInstanceLock();
if (!gotLock) app.quit();

let mainWindow: BrowserWindow | null = null;
let ipcCtx: IpcContext | null = null;
app.on("second-instance", () => showWindow(mainWindow));

function createWindow(): void {
  // Taille de départ bornée à la zone utile de l'écran : sur un portable
  // 1366×768 (~728 px sous la barre des tâches), 800 px de haut faisaient
  // passer le bas de la fenêtre sous la barre des tâches.
  const { workAreaSize } = screen.getPrimaryDisplay();
  mainWindow = new BrowserWindow({
    width: Math.min(1280, workAreaSize.width),
    height: Math.min(800, workAreaSize.height),
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: "hidden",
    backgroundColor: "#0E1116", // Ink (palette Nexum, voir renderer/src/theme.ts)
    // Explicite : sans elle, Windows affichait l'atome d'Electron dans la
    // barre des tâches et Alt+Tab, alors que l'exe porte bien le logo Nexum.
    icon: appIconPath(),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false, // requis par electron-vite (preload bundlé en CJS)
      contextIsolation: true,
    },
  });

  const win = mainWindow;
  attachCloseToTray(win, () => ipcCtx);

  win.on("ready-to-show", () => {
    // Lancé à la connexion Windows : rester dans la zone de notification, ou
    // réduit dans la barre des tâches si l'icône est désactivée.
    if (launchedAtLogin()) {
      if (!closeToTrayEnabled(ipcCtx)) {
        win.showInactive();
        win.minimize();
      }
    } else {
      win.show();
    }
    if (!app.isPackaged) win.webContents.openDevTools({ mode: "detach" });
    checkForUpdateOnStartup();
  });

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (!app.isPackaged && process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(async () => {
  if (!gotLock) return;
  if (process.platform === "win32") {
    // Doit correspondre à `appId` (electron-builder.yml) : regroupement barre
    // des tâches + notifications Windows. ⚠️ Identifiant distinct en dev :
    // sinon electron.exe (icône = atome d'Electron) partage l'identité de
    // l'app installée et Windows finit par afficher l'atome pour celle-ci.
    app.setAppUserModelId(
      app.isPackaged ? "com.serverforge.app" : "com.serverforge.app.dev",
    );
  }

  // CSP en production uniquement (dev : Vite HMR utilise eval)
  // img-src : icônes de mods des registres Valheim (voir registries.ts). En
  // wildcard de sous-domaine car les CDN changent sans prévenir : Thunderstore
  // est passé de gcdn. à ccdn.thunderstore.io (les anciennes URL persistées
  // dans mods.json restent en gcdn.), Hexium sert depuis cdn.hexium.gg.
  if (app.isPackaged) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.thunderstore.io https://*.hexium.gg; font-src 'self' data:",
          ],
        },
      });
    });
  }

  ipcCtx = await registerIpcHandlers();
  createWindow();
  setupTray(ipcCtx, () => mainWindow);

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
