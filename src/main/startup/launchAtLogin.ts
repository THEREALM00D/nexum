import { app } from "electron/main";
import type { LaunchAtLoginState } from "../../shared/types";

// Argument ajouté au lancement par Windows : l'app sait qu'elle a été ouverte
// à la connexion de l'utilisateur et démarre réduite (pas de fenêtre qui
// surgit au milieu de l'écran au démarrage du PC).
const LAUNCH_ARG = "--autostart";

// Build portable : process.execPath pointe vers l'exe extrait dans un dossier
// temporaire ; electron-builder expose le vrai chemin dans cette variable.
const exePath = (): string =>
  process.env.PORTABLE_EXECUTABLE_FILE || process.execPath;

/**
 * « Lancer Nexum au démarrage de Windows » — l'état vit dans Windows (entrée
 * Run du registre gérée par Electron), pas dans notre config : il reste juste
 * même si l'utilisateur le désactive depuis le Gestionnaire des tâches.
 * Non supporté en dev (on enregistrerait electron.exe au démarrage).
 */
export function getLaunchAtLogin(): LaunchAtLoginState {
  if (!app.isPackaged || process.platform !== "win32") {
    return { supported: false, enabled: false };
  }
  const { openAtLogin } = app.getLoginItemSettings({
    path: exePath(),
    args: [LAUNCH_ARG],
  });
  return { supported: true, enabled: openAtLogin };
}

export function setLaunchAtLogin(enabled: boolean): LaunchAtLoginState {
  if (app.isPackaged && process.platform === "win32") {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: exePath(),
      args: [LAUNCH_ARG],
    });
  }
  return getLaunchAtLogin();
}

export const launchedAtLogin = (): boolean => process.argv.includes(LAUNCH_ARG);
