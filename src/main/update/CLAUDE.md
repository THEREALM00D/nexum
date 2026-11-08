# Mise à jour in-app (electron-updater)

`AutoUpdater.ts` branche `electron-updater` sur les releases GitHub (canal par défaut → `latest.yml`). Publication des releases : `.github/CLAUDE.md`. Installeur et désinstalleur NSIS : `resources/CLAUDE.md`.

- **Vérification auto au démarrage** (`checkForUpdateOnStartup`) ; **téléchargement et installation restent manuels** (`UpdateIndicator.tsx`, Sidebar et Paramètres). Jamais d'auto-download/install silencieux.
- **Bêtas** (`0.x.y-beta.N`) : réglage `betaUpdates` du store (défaut false, `BetaUpdatesSwitch`, IPC `update:getBetaUpdates` / `update:setBetaUpdates`, qui revérifie tout de suite) → `autoUpdater.allowPrerelease`.
  - ⚠️ Toujours le fixer explicitement : electron-updater le met à vrai tout seul quand la version installée est une préversion.
  - ⚠️ Jamais `autoUpdater.channel` : son setter active `allowDowngrade`.
  - Avec `allowPrerelease`, `GitHubProvider` (6.8.x) lit `releases.atom`, prend la 1re entrée (bêta ou stable), puis `beta.yml` pour une bêta (404 chez nous → repli sur le `latest.yml` de la même release). Sans : API « latest release », qui ignore les préversions.
  - Une bêta désactivée reste installée jusqu'à la stable suivante (pas de downgrade, voulu). Une stable dont le draft a été créé avant une bêta peut passer derrière elle dans le flux atom (rare).
- **Anciennes alphas** (`0.0.1-alpha.N`) : `channel = "alpha"` + `allowPrerelease = true` codés en dur. Elles cherchent `alpha.yml` puis retombent sur `latest.yml`, puis suivent `betaUpdates` une fois à jour. Ne pas réintroduire de suffixe `-alpha` ni de canal autre que `beta` sans revoir ça.
- **États** (`AppUpdateStatus` → `UpdateStatusDetails`) : chaque clic sur « Vérifier » donne un retour visible : `checking` (envoyé tout de suite par `checkNow()`, affiché ≥ 700 ms par `useAppUpdate`) → `upToDate` + `checkedAt` / `available` → `downloading` (0 % affiché dès le clic) → `downloaded`, ou `error` avec `kind` (`network`/`rateLimit`/`timeout`/`unknown`, message brut en tooltip) + Réessayer. Vérification > 30 s → `timeout`. Les rejets de `checkForUpdates`/`downloadUpdate` passent par le même `handleError` que l'événement `error`. En dev : état `devMode`.
- Le main garde le **dernier statut** (`update:getStatus`) pour une vue montée après coup. ⚠️ `onStatus` (preload) retire **son** listener (`removeListener`), jamais `removeAllListeners` : quitter Paramètres débranchait la Sidebar.
- `update:install` appelle la garde de fermeture **avant** `quitAndInstall()` (voir `src/main/tray/CLAUDE.md`).
- Le build portable n'a pas d'auto-update.

## Tester en dev

`autoUpdater.forceDevUpdateConfig = true` + un `dev-app-update.yml` (`owner`/`repo`/`provider: github`) à la racine, en levant temporairement le test `app.isPackaged` de `checkNow()` ; baisser `version` dans `package.json` pour voir « mise à jour disponible ». Lancer sans `ELECTRON_RUN_AS_NODE` et avec `NEXUM_USER_DATA_DIR` (skill `/test-app`). **Ne rien committer de tout ça.**
