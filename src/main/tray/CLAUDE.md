# Zone de notification, fermeture et instance unique

- `AppTray.ts` : icône + menu reconstruit à chaque clic droit (statut de chaque serveur, Démarrer/Arrêter/Redémarrer, Ouvrir, Quitter), tooltip « N serveurs en ligne » rafraîchi toutes les 5 s. Les actions appellent les mêmes fonctions que l'UI : `startServer` / `restartServer` (`src/main/server/startServer.ts`) / `ServerManager.stop`.
- `windowLifecycle.ts` : fermeture → `hide()` au lieu de quitter si `closeToTray` (store, défaut **true**, `CloseToTraySwitch` dans Paramètres), notification Windows la 1re fois (`trayHintShown`).
- `trayStrings.ts` : textes FR/EN du tray, de la boîte de fermeture et des notifications Windows (le main n'a pas i18n ; langue dans le store `language`, mise à jour par `app:setLanguage`).
- Lancé avec Windows (`--autostart`) et `closeToTray` actif : la fenêtre ne s'affiche pas du tout (sinon : réduite).
- Une vraie fermeture (menu Quitter, `before-quit`) passe `isQuitting` à true. **Ne jamais bloquer `close` sans tester `isQuitting`**, sinon `quitAndInstall` d'electron-updater reste bloqué.
- Icône : lue à `process.resourcesPath/icon.ico` en build (voir `resources/CLAUDE.md`), `appIconPath()` (`src/main/utils/appIcon.ts`) partagé avec la fenêtre.

## Garde de fermeture (`attachQuitGuard` + `src/main/server/quitGuard.ts`)

Un serveur à processus unique lancé par Nexum meurt avec lui, sans sauvegarde (voir `src/main/servers/CLAUDE.md`). Donc :

- `before-quit` est annulé (`idle → pending → ready`) tant que `confirmAndStopServers` n'a pas répondu.
- Serveurs **lancés par Nexum** en cours (`ServerManager.ownsProcess()` ; un serveur adopté survit et n'est pas compté) → boîte native `dialog.showMessageBox` (parent = fenêtre seulement si visible) : « Arrêter et quitter » arrête tout en parallèle avec **leur** `getStopConfig` (ligne `[Manager]` `stoppingBeforeQuit` + notification Windows) puis `app.quit()` ; « Annuler » → rien. Un 2e Quitter pendant l'arrêt est ignoré.
- Fermer la fenêtre avec `closeToTray` désactivé passe par `app.quit()` (la boîte doit trouver la fenêtre encore là).
- `update:install` appelle la garde **avant** `quitAndInstall()`, qui lance l'installeur avant même `before-quit` (l'installeur fait ensuite un `taskkill /T` sur Nexum).
- ⚠️ Pas de `before-quit` à l'arrêt / la déconnexion de Windows : non couvert.
- Tester sans cliquer : `window.close()` par CDP puis `WScript.Shell.AppActivate("Quitter Nexum")` + `SendKeys("{ENTER}")` / `{ESC}`.

## Instance unique

`app.requestSingleInstanceLock()` (`src/main/index.ts`), app installée seulement : relancer Nexum ramène la fenêtre existante (`second-instance`). Pas en dev : le dossier de données est partagé avec l'app installée, qui bloquerait `yarn dev`.

## Lancer Nexum avec Windows (`src/main/startup/launchAtLogin.ts`)

`app.setLoginItemSettings` avec `--autostart` (l'état vit dans Windows, pas dans notre config) ; lancé ainsi, la fenêtre démarre réduite (`launchedAtLogin()`). Build portable : chemin réel via `PORTABLE_EXECUTABLE_FILE`. Non supporté en dev (`supported: false` → `LaunchAtLoginSwitch` grisé, pour ne pas enregistrer `electron.exe`).
