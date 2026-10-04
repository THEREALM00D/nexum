import { app, BrowserWindow, session } from "electron/main";
import { shell } from "electron";
import { join } from "path";
import { existsSync } from "fs";
import { registerIpcHandlers } from "./ipc/handlers";
import { checkForUpdateOnStartup } from "./update/AutoUpdater";
import { launchedAtLogin } from "./startup/launchAtLogin";

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
  app.setPath("userData", join(app.getPath("appData"), "server-forge"));
} else if (!existsSync(join(app.getPath("userData"), "config.json"))) {
  const legacy = LEGACY_USER_DATA_DIRS.map((d) =>
    join(app.getPath("appData"), d),
  ).find((dir) => existsSync(join(dir, "config.json")));
  if (legacy) app.setPath("userData", legacy);
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: "hidden",
    backgroundColor: "#0E1116", // Ink (palette Nexum, voir renderer/src/theme.ts)
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false, // requis par electron-vite (preload bundlé en CJS)
      contextIsolation: true,
    },
  });

  mainWindow.on("ready-to-show", () => {
    // Lancé à la connexion Windows : démarrer réduit dans la barre des tâches
    if (launchedAtLogin()) {
      mainWindow.showInactive();
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
    if (!app.isPackaged)
      mainWindow.webContents.openDevTools({ mode: "detach" });
    checkForUpdateOnStartup();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (!app.isPackaged && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(async () => {
  if (process.platform === "win32") {
    // Doit correspondre à `appId` (electron-builder.yml) : regroupement barre
    // des tâches + notifications Windows.
    app.setAppUserModelId("com.serverforge.app");
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

  await registerIpcHandlers();
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
