# CLAUDE.md

Doc technique pour Claude Code (et les devs). Règles de travail (langue, issues, commits, PR, doc utilisateur) : `.claude/CLAUDE.md`.

## Nexum

Gestionnaire de serveurs dédiés de jeux vidéo pour Windows : Palworld, Valheim, Astroneer, RuneScape: Dragonwilds et Enshrouded.

## Où est la doc

Ce fichier ne contient que ce qui vaut partout. Le détail d'un domaine est dans le `CLAUDE.md` de son dossier, chargé automatiquement quand on lit un fichier de ce dossier. **Avant de modifier un domaine sans avoir encore ouvert de fichier dedans, lire son `CLAUDE.md`.**

| Domaine                                                                        | Fichier                                               |
| ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Main : services, IPC, textes et erreurs (`AppError`), identité, CSP            | `src/main/CLAUDE.md`                                  |
| Démarrage / arrêt / relance, démarrage auto, vérif. de version, Rejoindre      | `src/main/server/CLAUDE.md`                           |
| Serveur actif, adoption de processus, conflits de ports, import                | `src/main/servers/CLAUDE.md`                          |
| Logs (sessions, fichier suivi, lignes masquées, export anonymisé)              | `src/main/logs/CLAUDE.md`                             |
| Sauvegardes (à chaud, auto, avant mise à jour)                                 | `src/main/backup/CLAUDE.md`                           |
| Redémarrage planifié                                                           | `src/main/scheduler/CLAUDE.md`                        |
| Zone de notification, garde de fermeture, instance unique, lancer avec Windows | `src/main/tray/CLAUDE.md`                             |
| Pare-feu et droits admin                                                       | `src/main/firewall/CLAUDE.md`                         |
| Monitoring CPU/RAM (coût de `systeminformation`)                               | `src/main/monitor/CLAUDE.md`                          |
| Historique des joueurs                                                         | `src/main/players/CLAUDE.md`                          |
| Mise à jour in-app (electron-updater, bêtas)                                   | `src/main/update/CLAUDE.md`                           |
| Registre des jeux côté main                                                    | `src/main/games/CLAUDE.md`                            |
| Un jeu (fichiers, ports, arrêt, pièges vérifiés)                               | `src/main/games/<jeu>/CLAUDE.md`                      |
| Conventions d'UI : thème, i18n, erreurs, skeletons, mise en page, listes       | `src/renderer/src/CLAUDE.md`                          |
| Pages globales (assistant, Paramètres, Serveurs, Installation)                 | `src/renderer/src/pages/CLAUDE.md`                    |
| Page de config partagée                                                        | `src/renderer/src/components/config/CLAUDE.md`        |
| Page Mods Valheim                                                              | `src/renderer/src/games/valheim/pages/Mods/CLAUDE.md` |
| CI, release-please, bêtas, signature, Discord                                  | `.github/CLAUDE.md`                                   |
| Icône, installeur et désinstalleur NSIS                                        | `resources/CLAUDE.md`                                 |

Skills du projet (`.claude/skills/`) : `/issue` (créer une issue), `/nexum <N>` (traiter une issue de bout en bout), `/test-app` (lancer Nexum sur un dossier de données isolé), `/new-game` (ajouter un jeu), `/revue [PR]` (revue de code par l'agent `nexum-reviewer`, `.claude/agents/`).

## Stack

- **Electron 45** (main / preload / renderer), **Node.js ≥ 22.12** (exigé par `electron` / `@electron/rebuild` ; `yarn install --frozen-lockfile` échoue sinon, CI comprise). Pas de `postinstall` chez `electron` : `node_modules/electron/dist` se télécharge au premier usage. **electron-builder 26**, **Vite 5** via **electron-vite**, **Yarn**.
- **React 19** + **MUI 9**, **TypeScript 6** strict, **react-i18next** (FR + EN).
- Dépendances-clés : `archiver` + `extract-zip` (ZIP), `electron-store` (config), `electron-updater`, `systeminformation`, `date-fns`, `react-virtuoso`.
- ⚠️ **ESM pur dans le main** : `archiver` (v8+) et `electron-store` (v9+) n'ont plus de build CommonJS alors que le main est bundlé en CJS. Un import statique casse **au runtime** (`ERR_REQUIRE_ESM` / « X is not a constructor »), pas au typecheck. Pattern obligatoire : `const { default: X } = await import("paquet")` au moment de l'utiliser (exemples : `BackupManager.create()`, `ipc/handlers.ts`, `FirewallManager.ts`). À chaque bump majeur d'une dépendance du main : vérifier `"type"` dans son `package.json`.
- **Aucun module natif** : pas de `postinstall`, rien à recompiler, pas besoin de Visual Studio. En ajouter un (`binding.gyp`) remettrait `electron-builder install-app-deps`, `asarUnpack`, Visual Studio avec les bibliothèques Spectre (`MSB8040`) et ~2 min 30 de compilation par job CI.
- **Licence GPL-3.0-or-later** : toute dépendance ajoutée doit être compatible (MIT/BSD/Apache-2.0/ISC/LGPL ; jamais propriétaire ou « non-commercial »).
- **Pas de tests unitaires** : ne pas en chercher ni en ajouter sans demander.

## Commandes

| Commande                   | Description                                   |
| -------------------------- | --------------------------------------------- |
| `yarn dev`                 | Mode développement (hot reload)               |
| `yarn build`               | Compiler + packager en .exe (NSIS + portable) |
| `yarn typecheck`           | Vérifier les types (node + web)               |
| `yarn lint`                | ESLint avec auto-fix                          |
| `yarn lint:check`          | ESLint sans auto-fix (CI)                     |
| `yarn format`              | Prettier sur tout le projet                   |
| `yarn fix:prettier <file>` | Prettier sur un fichier                       |

- Hook PostToolUse (`.claude/settings.json` → `.claude/hooks/prettier.mjs`) : Prettier sur chaque fichier du projet écrit par Write/Edit. Réglages Claude Code partagés dans `.claude/settings.json` ; `.claude/settings.local.json` est personnel et ignoré par git.
- ESLint (`.eslintrc.cjs`) : base `@electron-toolkit`, `explicit-function-return-type` désactivée, seulement `react-hooks/rules-of-hooks` + `exhaustive-deps`.
- Packager une version précise sans toucher à `package.json` (Git Bash, PowerShell découpe `-c.x=y`) : `yarn electron-vite build && yarn electron-builder --win --publish never -c.extraMetadata.version=X.Y.Z-beta.N`.

## ⚠️ Ne jamais toucher aux vrais serveurs en dev

`yarn dev` et `electron.exe` partagent `%APPDATA%\server-forge` avec l'**app installée** (ses vrais serveurs et sa config). D'où les garde-fous : pas de démarrage auto (`NEXUM_DEV_AUTOSTART=1` pour forcer), pas d'adoption (`NEXUM_DEV_ADOPT=1`), pas de verrou d'instance. Pour tout test qui lance l'app : **skill `/test-app`** (`NEXUM_USER_DATA_DIR` = dossier isolé). Jamais `dist/win-unpacked/nexum.exe` : il ouvre les vraies données et démarre les serveurs en démarrage auto.

## Architecture

```
src/
├── shared/types.ts        # Source unique des types qui traversent l'IPC
├── main/                  # Process Node.js (voir src/main/CLAUDE.md)
│   ├── games/<jeu>/       #   serverConfig, parseurs de config, handlers/ (IPC du jeu)
│   ├── games/registry.ts  #   Record<GameType, …> : lancement, ports, sauvegardes, arrêt
│   ├── ipc/               #   handlers.ts (instancie les services), context.ts, handlers/*.ts
│   ├── server/            #   ServerManager (générique), startServer, relance, arrêt
│   ├── servers/           #   registre, adoption, conflits de ports, ServerConfigStore
│   ├── logs/, backup/, scheduler/, tray/, firewall/, monitor/, players/, update/
│   ├── steamcmd/, startup/, i18n/ (textes du main), utils/ (ini, appError…)
├── preload/
│   ├── index.ts           # contextBridge → window.api
│   └── index.d.ts         # Déclare Window.api (importe depuis shared)
└── renderer/src/          # React (voir src/renderer/src/CLAUDE.md)
    ├── context/           #   ServerContext (useReducer), NotificationContext
    ├── games/types.ts     #   Interface GamePlugin ; registry.ts : GAMES, getGamePlugin()
    ├── games/<jeu>/       #   index.ts (manifest) + pages/<Page>/{Page.tsx,hooks,components,__i18n__}
    ├── components/        #   Partagés entre jeux : common, server, config, backup,
    │                      #   schedule, firewall, players, Sidebar, Titlebar
    ├── hooks/             #   useServerControls, useServerNotices…
    ├── pages/             #   Pages globales : Setup, Servers, Install, Settings
    ├── services/          #   steamService (SteamCMD pour tous les jeux)
    ├── i18n/              #   Setup i18next (lit les manifests, ne pas y ajouter de strings)
    └── theme.ts           #   Palette, polices, constantes de mise en page
```

### IPC

```
Renderer → window.api.xxx() → Preload (contextBridge) → ipcMain.handle() → Main
         ← listener          ← ipcRenderer.on()        ← event.sender.send()
```

- Tout type qui traverse la frontière est dans `src/shared/types.ts`. Main : `import type { … } from "../../shared/types"` ; renderer : `@shared/types` ; `preload/index.d.ts` déclare `Window.api`.
- Le renderer n'importe **jamais** depuis `src/main/`.
- Services instanciés une seule fois dans `registerIpcHandlers()` et passés par `IpcContext`.
- Beaucoup d'IPC prennent un `serverId?` qui retombe sur le serveur actif : les actions sur un serveur passent toujours le `serverId` explicitement (voir `src/main/servers/CLAUDE.md`).
- Erreurs : codes `AppError` côté main, `errorMessage` / `appErrorMessage` côté renderer, jamais de phrase en dur (voir `src/main/CLAUDE.md` et `src/renderer/src/CLAUDE.md`).

### Multi-jeux (GamePlugin)

Chaque jeu = un manifest typé `games/<jeu>/index.ts` (pages, `supportedPages`, i18n, `requirements`) côté renderer + un dossier `src/main/games/<jeu>/` + des entrées dans les `Record<GameType, …>`. `App.tsx`, la Sidebar, `i18n/index.ts`, l'assistant, le dialogue d'ajout de serveur, la page Installation et la détection d'un dossier existant lisent la liste des jeux : **aucun nom de jeu en dur**. Valheim est le modèle (le plus testé). Ajouter un jeu : skill **`/new-game`**.

Pages partagées par tous les jeux : `components/server/Logs`, `components/backup/BackupPage`, `components/schedule/RestartSchedulePage`, `components/config/ConfigPage`, `components/players/`, `components/server/JoinServerCard`, `SimpleDashboard`.

## Réseau et confidentialité

La déclaration de confidentialité (`docs/code-signing.md` + `.fr.md`) liste **chaque** connexion réseau de l'app : GitHub (mises à jour), Steam via SteamCMD (installation, vérification de version au démarrage), Thunderstore / Hexium (page Mods, vérification des mods au démarrage, partage de modpack), `api.ipify.org` (IP publique, au clic seulement). **Tout nouvel appel réseau doit y être ajouté**, dans la même PR. Les appels faits par la CI (Discord, VirusTotal) n'en font pas partie, ni un lien ouvert dans le navigateur avec `shell.openExternal` (bouton « Aide et Discord » de la Sidebar, `components/Sidebar/DiscordButton.tsx`).

## Écrire dans les CLAUDE.md

À la fin de chaque travail, noter ce qu'un dev ne devinerait pas en lisant le code (décision, piège, comportement vérifié d'un jeu), **dans le fichier du domaine**, pas ici.

- **Où** : le `CLAUDE.md` du dossier le plus proche du code concerné. Ce fichier-ci ne reçoit que ce qui vaut pour tout le projet. Un domaine nouveau et substantiel → nouveau `CLAUDE.md` dans son dossier + une ligne dans le tableau « Où est la doc ».
- **Quoi** : la règle et sa raison (« X, sinon Y »). Pas d'historique ni de numéros de version, sauf si le comportement en dépend (migration, données d'anciennes installs). Un piège corrigé se note en une phrase : ce qu'il ne faut pas refaire et pourquoi.
- **Comment** : phrases courtes, chemins et noms exacts entre backticks (ils doivent exister), ⚠️ pour les pièges. Ne pas répéter ce que dit déjà un autre CLAUDE.md : y renvoyer.
- Retirer ce qui devient faux. Le code fait foi : ne pas décrire ce qu'une lecture rapide du fichier montre déjà.
