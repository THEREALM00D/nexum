# Process main (Node.js)

Chaque domaine a son `CLAUDE.md` dans son dossier (`server/`, `servers/`, `logs/`, `backup/`, `scheduler/`, `tray/`, `firewall/`, `monitor/`, `players/`, `update/`, `games/<jeu>/`). Ce fichier = ce qui vaut pour tout le main.

## Services et IPC

- Les services (`ServerManager`, `BackupManager`, schedulers…) sont instanciés **une seule fois** dans `registerIpcHandlers()` (`ipc/handlers.ts`) puis passés aux sous-handlers via `IpcContext` (`ipc/context.ts`). **Ne jamais les instancier ailleurs.**
- Sous-handlers par domaine dans `ipc/handlers/*.ts`, par jeu dans `games/<jeu>/handlers/`.
- Tout type qui traverse l'IPC est dans `src/shared/types.ts` (`import type { … } from "../../shared/types"`).

## Textes et erreurs (le main n'a pas i18n)

- **Lignes de log écrites par le main** (`[Manager]`, progression SteamCMD) : `i18n/logStrings.ts`, dictionnaire FR + EN typé (`EN: typeof FR` : une clé oubliée ne compile pas). `log(managerLine(lt().clé(params)))`, **jamais de phrase en dur dans un `log(...)`**. Langue : `i18n/language.ts` (`getLanguage` / `setLanguage`), lue dans le store au démarrage, mise à jour par `app:setLanguage`. Une ligne est écrite dans la langue du moment.
- Tray, boîtes natives et notifications Windows : `tray/trayStrings.ts`.
- **Erreurs renvoyées au renderer** : jamais de phrase, un code. `appError(code, params)` / `throw new AppError(code, params)` (`utils/appError.ts`, codes dans `AppErrorCode` de `shared/types.ts`) → chaîne `@app:{…}`, trouvée n'importe où dans le message (fonctionne aussi pour une erreur levée dans `ipcMain.handle`). Un paramètre qui est lui-même une erreur codée est traduit aussi. Dans un log : `appErrorLogText(raw)` (déplie les codes imbriqués).
- Erreurs réseau de Node (`ECONNREFUSED`, `ENOTFOUND`…) → `networkError(url, err)` (`NETWORK_ERROR`, hôte + code système).

## Identité de l'app (ex-ServerForge)

L'app s'appelait ServerForge jusqu'à la 0.2.0 ; plusieurs traces sont gardées **volontairement** :

- **`appId: com.serverforge.app`** (`electron-builder.yml`) : le changer installerait Nexum _à côté_ de l'ancienne app (clé de désinstallation NSIS dérivée de l'appId). `app.setAppUserModelId()` (`index.ts`) utilise la même valeur, **sauf en dev : `com.serverforge.app.dev`**. ⚠️ Pour une notification Windows, Electron crée tout seul `Menu Démarrer\Programs\Electron.lnk` (cible `electron.exe`) avec l'identifiant de l'app ; créé en dev avec l'identifiant de prod, il prenait le pas sur `Nexum.lnk` et la barre des tâches affichait l'atome d'Electron pour la vraie app. Si ça se reproduit : supprimer le `.lnk` dont `System.AppUserModel.ID` vaut `com.serverforge.app` et qui pointe vers `electron.exe`. La fenêtre reçoit aussi l'icône explicitement (`utils/appIcon.ts`).
- **Dossier de données** (`startup/userDataMigration.ts`, appelé dans `index.ts` avant `ready` et avant `requestSingleInstanceLock`) : l'app packagée déplace l'ancien dossier vers `%APPDATA%\Nexum` quand celui-ci n'a pas de `config.json`. ⚠️ L'ancien dossier est **`%APPDATA%\server-forge`** (Electron nommait userData d'après le `name` du package.json sans `productName` ; celui d'`electron-builder.yml` ne compte pas), `ServerForge` en repli (`LEGACY_USER_DATA_DIRS`).
  - `renameSync`, pas de copie (sauvegardes volumineuses). Un `%APPDATA%\Nexum` sans `config.json` (restes de la 0.3.0, cache Chromium) est supprimé avant. Si le renommage échoue (une autre instance tient `lockfile`, antivirus), l'app reste sur l'ancien dossier et réessaie au lancement suivant : c'est ce qui protège d'une instance déjà ouverte, d'où l'appel avant le verrou d'instance.
  - Des chemins absolus vers l'ancien dossier sont enregistrés : `backupDir` dans `config.json` (dossier choisi, ou défaut enregistré par une ancienne version) et les `.vdf` écrits par SteamCMD. `FILES_WITH_PATHS` les réécrit (séparateurs `\`, `\\` ou `/`, sans casse). Un fichier qui en contient d'autres → l'ajouter à cette liste.
  - ⚠️ Tout se passe avant le verrou d'instance : deux lancements simultanés au premier démarrage pouvaient supprimer le dossier que l'autre venait de déplacer. D'où `startup/migrationLock.ts` (`%APPDATA%\.nexum-migration.lock` créé en `wx`, l'autre processus attend puis relit l'état ; verrou de plus de 30 s = processus tué, repris). Réécriture des fichiers via `.tmp` + `renameSync` : un `config.json` tronqué empêche electron-store de démarrer.
  - Le marqueur `.migrated-from` est écrit avant le renommage et retiré après la réécriture : s'il reste dans `%APPDATA%\Nexum`, la réécriture est refaite au démarrage suivant.
  - En dev : `NEXUM_USER_DATA_DIR`, sinon le même dossier que l'app installée (`%APPDATA%\Nexum` s'il a un `config.json`, sinon `server-forge`), jamais de migration.
- Repo renommé `server-forge` → `nexum` : les builds ≤ 0.2.0 comptent sur la redirection GitHub pour leurs mises à jour. **Ne jamais recréer un repo `server-forge`.** `CHANGELOG.md` garde l'ancien nom.

## Fenêtre et CSP (`index.ts`)

- Taille de départ bornée à la zone utile (`screen.getPrimaryDisplay().workAreaSize`) : 800 px de haut dépassaient sous la barre des tâches d'un 1366×768. `backgroundColor` = Ink (le main ne peut pas importer le thème du renderer).
- CSP appliquée **uniquement en build packagé** (invisible en `yarn dev`) : `img-src` des CDN des registres de mods, `font-src 'self'`. Tester une modif de CSP sur un build (skill `/test-app`).
