import { autoUpdater } from "electron-updater";
import { BrowserWindow, ipcMain, app } from "electron/main";
import type Store from "electron-store";
import type { AppUpdateErrorKind, AppUpdateStatus } from "../../shared/types";
import type { AppStore } from "../ipc/context";

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
// Versions stables 0.x.y publiées par release-please ("latest.yml", API
// "latest release" de GitHub, qui ignore les préversions). Les bêtas
// (0.x.y-beta.N, workflow beta.yml) sont des releases GitHub « prerelease »
// avec un "beta.yml" : vues seulement quand `allowPrerelease` est vrai, donc
// quand l'utilisateur a coché « Recevoir les versions bêta » (réglage
// `betaUpdates`). Jamais de `channel` : son setter active `allowDowngrade`.
// ⚠️ `allowPrerelease` est fixé explicitement : electron-updater le met à
// vrai tout seul quand la version installée est une préversion.
// Les installs encore en 0.0.1-alpha.N (canal "alpha", `allowPrerelease`
// codé en dur) prennent la release la plus récente, bêta comprise, puis
// suivent ce réglage une fois à jour.

// Délai max d'une vérification : au-delà, on affiche une erreur au lieu de
// laisser « Vérification… » indéfiniment (requête GitHub bloquée).
const CHECK_TIMEOUT_MS = 30_000;

// Dernier statut connu, renvoyé par `update:getStatus` : une vue montée après
// la vérification du démarrage (page Paramètres) affiche le vrai état au lieu
// de repartir de « idle ».
let current: AppUpdateStatus = { state: "idle" };
let pendingCheck: Promise<void> | null = null;

function setStatus(status: AppUpdateStatus): void {
  current = status;
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send("update:status", status);
  }
}

function errorKind(err: Error): AppUpdateErrorKind {
  const { code } = err as NodeJS.ErrnoException;
  const statusCode = (err as { statusCode?: number }).statusCode;
  if (statusCode === 429 || /rate limit/i.test(err.message)) return "rateLimit";
  if (
    /^(ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN)$/.test(
      code ?? "",
    ) ||
    /net::ERR_/.test(err.message)
  ) {
    return "network";
  }
  return "unknown";
}

// Appelée par l'événement "error" ET par le rejet des promesses
// (checkForUpdates/downloadUpdate) : certaines erreurs n'émettent pas
// l'événement, elles ne doivent plus être avalées. Idempotente.
function handleError(err: Error): void {
  // Le tag/la release GitHub existe mais latest.yml n'est pas (encore)
  // uploadé — normalement impossible depuis que la release reste en draft
  // jusqu'à la fin du build (voir release.yml), gardé par sécurité. Pas
  // une vraie erreur pour l'utilisateur, juste "réessaie plus tard".
  const code = (err as NodeJS.ErrnoException).code;
  if (
    code === "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND" ||
    code === "ERR_UPDATER_NO_PUBLISHED_VERSIONS"
  ) {
    setStatus({ state: "unavailable" });
    return;
  }
  setStatus({ state: "error", kind: errorKind(err), message: err.message });
}

/**
 * Lance une vérification avec un retour immédiat (« checking » envoyé tout de
 * suite, sans attendre l'événement d'electron-updater) et toujours un état
 * final distinct : à jour, mise à jour dispo, ou erreur (y compris délai
 * dépassé). En dev, état `devMode` au lieu d'un no-op silencieux.
 */
function checkNow(): void {
  if (!app.isPackaged) {
    setStatus({ state: "devMode" });
    return;
  }
  if (pendingCheck) return;
  setStatus({ state: "checking" });
  const timer = setTimeout(() => {
    if (current.state === "checking") {
      setStatus({ state: "error", kind: "timeout", message: "Timeout" });
    }
  }, CHECK_TIMEOUT_MS);
  pendingCheck = autoUpdater
    .checkForUpdates()
    .then((result) => {
      // null = updater inactif : aucun événement ne suivra.
      if (!result && current.state === "checking") {
        setStatus({
          state: "error",
          kind: "unknown",
          message: "Updater inactive",
        });
      }
    })
    .catch(handleError)
    .finally(() => {
      clearTimeout(timer);
      pendingCheck = null;
    });
}

/**
 * Branche electron-updater sur les releases GitHub (déjà publiées par
 * electron-builder via `publish: provider: github` dans electron-builder.yml
 * — le `latest.yml` nécessaire est généré automatiquement à chaque build).
 * Flow entièrement manuel côté utilisateur : on vérifie automatiquement au
 * démarrage, mais le téléchargement et l'installation restent des actions
 * explicites (pas d'auto-download/install silencieux).
 */
export function registerAutoUpdater(store: Store<AppStore>): void {
  autoUpdater.allowPrerelease = store.get("betaUpdates", false);
  autoUpdater.on("checking-for-update", () => setStatus({ state: "checking" }));
  autoUpdater.on("update-available", (info) =>
    setStatus({ state: "available", version: info.version }),
  );
  autoUpdater.on("update-not-available", () =>
    setStatus({ state: "upToDate", checkedAt: Date.now() }),
  );
  autoUpdater.on("download-progress", (progress) =>
    setStatus({ state: "downloading", percent: Math.round(progress.percent) }),
  );
  autoUpdater.on("update-downloaded", (info) =>
    setStatus({ state: "downloaded", version: info.version }),
  );
  autoUpdater.on("error", handleError);

  ipcMain.handle("update:getCurrentVersion", () => app.getVersion());
  ipcMain.handle("update:getStatus", () => current);
  ipcMain.handle("update:check", () => checkNow());
  ipcMain.handle("update:download", () => {
    // Retour immédiat : la 1re progression peut mettre quelques secondes.
    setStatus({ state: "downloading", percent: 0 });
    autoUpdater.downloadUpdate().catch(handleError);
  });
  ipcMain.handle("update:install", () => autoUpdater.quitAndInstall());
  ipcMain.handle("update:getBetaUpdates", () =>
    store.get("betaUpdates", false),
  );
  // Revérifie tout de suite : la bêta (ou le retour au canal stable) est
  // visible sans attendre le prochain lancement. Une bêta déjà installée
  // reste en place jusqu'à la stable suivante (pas de retour en arrière).
  ipcMain.handle("update:setBetaUpdates", (_, enabled: boolean) => {
    store.set("betaUpdates", enabled);
    autoUpdater.allowPrerelease = enabled;
    if (!pendingCheck && current.state !== "downloading") checkNow();
    return enabled;
  });
}

export function checkForUpdateOnStartup(): void {
  // Best-effort (pas de connexion, rate-limit GitHub…) : l'erreur s'affiche
  // dans l'indicateur, sans notification.
  if (app.isPackaged) checkNow();
}
