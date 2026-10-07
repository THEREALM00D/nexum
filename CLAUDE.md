# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Nexum

Gestionnaire de serveurs dédiés de jeux vidéo. Supporte Palworld, Valheim et Astroneer.

## Stack

- **Electron 44** (main / preload / renderer) — nécessite **Node.js ≥ 22.12** (`engines` d'`electron`/`@electron/rebuild` l'exige ; `yarn install --frozen-lockfile` échoue sinon, y compris en CI)
- **React 19** + **MUI 9** (Material-UI) — pas de Tailwind
- **TypeScript 6** strict — types partagés dans `src/shared/types.ts`
- **Vite 5** via **electron-vite**
- **Yarn** comme gestionnaire de paquets
- **i18n** : `react-i18next` + `i18next` + `i18next-browser-languagedetector` (FR + EN)
- Dépendances-clés : `archiver` + `extract-zip` (backups ZIP), `electron-store` (config persistée), `electron-updater` (mise à jour in-app), `systeminformation` (CPU/RAM, détection de processus), `date-fns`

⚠️ **`archiver` (v8+) et `electron-store` (v9+) sont en ESM pur** (plus de build CommonJS), alors que le process main est bundlé en CJS. Un `import`/`require` statique classique casse au runtime (`ERR_REQUIRE_ESM` / « X is not a constructor » — le typecheck ne le détecte PAS, seul un vrai lancement le révèle). Pattern obligatoire : `const { default: X } = await import("paquet-esm-only")` au moment de l'utiliser, jamais en haut de fichier. Voir `BackupManager.create()` (archiver → `ZipArchive`) et `ipc/handlers.ts`/`FirewallManager.ts` (electron-store) pour des exemples. Réflexe à avoir à **chaque** bump majeur d'une dépendance qui touche le main process : vérifier `"type"` dans son `package.json`.

**Licence : GPL-3.0-or-later** (`LICENSE` = texte officiel gnu.org, `package.json` → `license`). Toute dépendance ajoutée doit être compatible GPL-3.0 (MIT/BSD/Apache-2.0/ISC/LGPL OK ; éviter les licences propriétaires ou « non-commercial »).

Pas de tests unitaires configurés dans ce projet — ne pas en chercher ni en ajouter sans demander.

## Commandes

| Commande                   | Description                                   |
| -------------------------- | --------------------------------------------- |
| `yarn dev`                 | Mode développement (hot reload)               |
| `yarn build`               | Compiler + packager en .exe (NSIS + portable) |
| `yarn typecheck`           | Vérifier les types (node + web)               |
| `yarn lint`                | ESLint avec auto-fix                          |
| `yarn lint:check`          | ESLint sans auto-fix (utilisé en CI)          |
| `yarn format`              | Prettier sur tout le projet                   |
| `yarn fix:prettier <file>` | Prettier sur un fichier spécifique            |

Un hook PostToolUse (`.claude/settings.local.json`) lance automatiquement `fix:prettier` après chaque Write/Edit.

## CI / automatisation

- **`.github/workflows/ci.yml`** : `yarn typecheck` + `yarn lint:check` sur chaque PR/push vers `main` (Node 22, `windows-latest`). `main` est protégée — PR obligatoire.
- **`.yarnrc`** : `network-timeout 600000` — le délai par défaut de yarn (30s) faisait échouer `yarn install` en CI sur les gros tarballs (`ESOCKETTIMEDOUT` sur `@mui/icons-material`, vécu sur le push de la 0.2.0). Un échec de ce genre est réseau, pas du code : relancer le job suffit.
- **Versioning / release automatique (release-please)** — voir section « Versioning & releases » plus bas. `.github/workflows/release.yml` (push sur `main`) + `.github/workflows/pr-title.yml` (titre de PR conventional commits obligatoire).
- **`.eslintrc.cjs`** : base `@electron-toolkit`, `explicit-function-return-type` désactivée (trop strict pour du TSX), seulement `react-hooks/rules-of-hooks` + `exhaustive-deps` (pas le ruleset v7 complet orienté React Compiler, qui suppose des patterns qu'on n'utilise pas).
- **Bouton Discord dans l'app** : `components/Sidebar/DiscordButton.tsx` (`DISCORD_INVITE_URL`, logo SVG Simple Icons car absent de `@mui/icons-material`) — bouton « Aide et Discord » en bas de la Sidebar, icône seule quand elle est repliée ; ouvre le navigateur via `shell.openExternal` (pas un appel réseau de l'app, rien à ajouter à la déclaration de confidentialité). L'invitation y est dupliquée avec les README et `.github/ISSUE_TEMPLATE/config.yml` : les garder synchronisées.
- **Discord communautaire** : invitation permanente `https://discord.gg/DbJ3WkK5QU`, utilisée à 4 endroits — `DISCORD_INVITE_URL` (`DiscordButton.tsx`, bouton de l'app), badge + section « Aide et communauté / Help & community » des deux README, et `contact_links` de `.github/ISSUE_TEMPLATE/config.yml` (redirige les questions vers Discord, les issues restent pour les bugs). Si l'invitation change, mettre à jour les quatre. ⚠️ La première invitation (`t49ZaZ3hWy`) avait expiré et cassait le bouton de l'app : avant d'en publier une, vérifier qu'elle est permanente (`expires_at: null` sur `https://discord.com/api/v10/invites/<code>?with_expiration=true`).
- **Dependabot** (`.github/dependabot.yml`) : PR hebdo npm (groupées minor/patch) + GitHub Actions. Un bump majeur qui casse la CI doit être corrigé **sur la branche de la PR** (pas juste mergé en espérant) — voir le pattern ESM ci-dessus pour la cause la plus probable si `yarn typecheck`/`install` échoue après un bump.

## Architecture — points non-évidents

```
src/
├── shared/types.ts        # Source unique des types qui traversent IPC
├── main/                  # Process Node.js
│   ├── games/
│   │   ├── palworld/      # Code Palworld : PalworldApiClient, PalConfigParser,
│   │   │   ├── handlers/  #   handlers IPC (palapi, players), serverConfig
│   │   │   └── ...
│   │   ├── valheim/       # Code Valheim : handlers IPC (config), serverConfig,
│   │   │                  #   OdinEyeApiClient (suivi joueurs), ValheimModsManager
│   │   ├── astroneer/     # Code Astroneer : AstroConfigParser (2 fichiers .ini),
│   │   │   ├── handlers/  #   handlers IPC (config), serverConfig
│   │   │   └── ...
│   │   └── registry.ts    # getGameServerConfig, buildGameArgs, getGameStopConfig
│   ├── ipc/
│   │   ├── handlers.ts    # Setup : instancie les services, construit IpcContext
│   │   ├── context.ts     # IpcContext passé aux sous-handlers
│   │   └── handlers/*.ts  # Domaines partagés (server, backup, firewall, etc.)
│   ├── server/            # ServerManager (générique, tous jeux)
│   ├── players/           # PlayerHistoryTracker (poller générique + JSON)
│   ├── backup/, scheduler/, firewall/, monitor/, steamcmd/
├── preload/
│   ├── index.ts           # contextBridge → window.api
│   └── index.d.ts         # Déclare Window.api globalement (importe depuis shared)
└── renderer/src/
    ├── context/           # ServerContext (useReducer), NotificationContext (toasts)
    ├── i18n/              # Setup react-i18next — ne plus éditer manuellement,
    │                      #   les strings sont chargées depuis games/*/index.ts
    ├── hooks/             # useServerControls (partagé entre jeux)
    ├── components/
    │   ├── common/        # Petits composants génériques (SearchField)
    │   ├── firewall/      # AdminBanner, StandardRules, CustomRules, RuleStatus
    │   ├── server/        # ServerControls, StatsGrid, Logs (page partagée par les 3 jeux)
    │   ├── players/       # Page « Joueurs » complète (Palworld + Valheim)
    │   ├── Sidebar/       # Sidebar + ServerSwitcher
    │   └── Titlebar/
    ├── games/
    │   ├── types.ts       # Interface GamePlugin
    │   ├── registry.ts    # GAMES[], getGamePlugin() — point d'entrée pour le shell
    │   ├── palworld/
    │   │   ├── index.ts   # Manifest Palworld (pages, supportedPages, i18n)
    │   │   └── pages/<Page>/  # Page.tsx + hooks/ + components/ + __i18n__/{fr,en}.ts
    │   ├── valheim/
    │   │   ├── index.ts   # Manifest Valheim
    │   │   └── pages/<Page>/
    │   └── astroneer/
    │       ├── index.ts   # Manifest Astroneer (pas de page "mods" ni "players")
    │       └── pages/<Page>/
    └── pages/, services/  # Pages globales (Install, Servers) + services partagés
```

### Nom de l'app : Nexum (ex-ServerForge)

L'app s'appelait **ServerForge** jusqu'à la 0.2.0. Le rebrand garde volontairement plusieurs traces de l'ancien nom pour ne pas casser les installations existantes :

- **`appId: com.serverforge.app`** (`electron-builder.yml`) **conservé** : le changer ferait installer Nexum _à côté_ de ServerForge au lieu de le mettre à jour (clé de désinstallation NSIS dérivée de l'appId). `app.setAppUserModelId()` (`main/index.ts`) utilise la même valeur (regroupement barre des tâches + notifications) — valait `com.palworld.manager` avant le rebrand.
- **Dossier de données** (`main/index.ts`, avant `ready`) : une install existante garde son ancien dossier si son `config.json` (electron-store) existe et qu'il n'y en a pas dans `%APPDATA%\Nexum`. ⚠️ Cet ancien dossier est **`%APPDATA%\server-forge`** : Electron nomme userData d'après le `name` du package.json quand celui-ci n'a pas de `productName` (le `productName` d'`electron-builder.yml` ne compte pas). La 0.3.0 cherchait `%APPDATA%\ServerForge` et démarrait avec une liste de serveurs vide — corrigé en 0.3.1 (`LEGACY_USER_DATA_DIRS`, `ServerForge` gardé en repli). Pas de déplacement : SteamCMD (lourd) et des chemins absolus (dossier de backup) y sont persistés. Nouvelles installs → `%APPDATA%\Nexum`. En dev (`!app.isPackaged`) : `%APPDATA%\server-forge`, le **même** dossier que l'app installée avant le rebrand (les deux partageaient déjà leurs données).
- **Repo GitHub renommé** `server-forge` → `nexum` : les builds ≤ 0.2.0 ont `server-forge` dans leur `app-update.yml` et comptent sur la redirection GitHub des repos renommés pour trouver les mises à jour — ne jamais recréer un repo nommé `server-forge` (ça casserait la redirection).
- `User-Agent` des appels aux registres de mods : `USER_AGENT` (`games/valheim/registries.ts`, `Nexum/<version>`).
- `CHANGELOG.md` garde l'ancien nom (historique).

**Identité visuelle** (kit fourni par le propriétaire, sources SVG hors repo) :

- Icône Windows : `resources/icon.ico` (16 → 256 px, lu par electron-builder). Logo de la Titlebar : `src/renderer/src/assets/logo.svg` (symbole seul, version pour fond sombre).
- README : `docs/images/nexum-logo-{dark,light}-bg-1200.png` via un `<picture>` qui suit le thème GitHub du visiteur. `docs/images/nexum-social-preview-1280x640.png` = aperçu social à téléverser dans _Settings → Social preview_ du repo.
- **Palette d'interface** : `src/renderer/src/theme.ts` (constantes `NEXUM` + `darkTheme` MUI), **alignée sur les couleurs du logo** : Ink `#0E1116` (fond), Graphite `#161B22` (surfaces, barre latérale), Steel `#8B95A5` (texte secondaire), Paper `#E6EAF0` (texte), Signal `#22C55E` (accent **et** statut « en ligne » → `primary` et `success`), Signal profond `#16A34A`, Alerte `#F2A33A` (`warning`), Critique `#E5484D` (`error`), bordures `#252B35`. Ne jamais écrire de hex en dur dans un composant : passer par le thème (`"background.paper"`, `"text.secondary"`…) ou `NEXUM.*`. Signal étant clair, les boutons pleins ont un texte Ink (`contrastText`). Exception : `backgroundColor` de la `BrowserWindow` (`main/index.ts`, Ink) — le main ne peut pas importer le thème du renderer.
- Typo de marque : Archivo Expanded 700 (logo, titres), IBM Plex Sans / Mono, embarquées dans l'app via `@fontsource/ibm-plex-sans` et `@fontsource/ibm-plex-mono` (imports dans `renderer/src/main.tsx`, graisses 400-700 / 400-500 ; pas de Google Fonts : app hors-ligne + CSP `font-src 'self'`). Constantes `FONT_SANS` / `FONT_MONO` dans `theme.ts` — utiliser `fontFamily: FONT_MONO`, jamais `"monospace"` en dur.
- Règles : ne pas recolorer ni déformer le logo ; sous 24 px, utiliser l'icône (tuile) plutôt que le logo horizontal.

### Droits administrateur (pare-feu uniquement)

- L'exe tourne **sans droits admin** (`requestedExecutionLevel: asInvoker`, `electron-builder.yml` — était `requireAdministrator` jusqu'à la 0.3.x : SmartScreen + UAC à chaque lancement faisaient fuir les nouveaux utilisateurs). Seul le pare-feu (`netsh advfirewall`) en a besoin.
- `FirewallManager.runNetsh(cmds)` : si l'app est déjà admin, exécution directe ; sinon **tout le lot** passe par un seul `Start-Process cmd.exe -Verb RunAs` (PowerShell `-EncodedCommand`, pour ne pas imbriquer les guillemets de netsh dans ceux de cmd puis de PowerShell) → **une seule invite UAC** par action, y compris « Tout appliquer ». La sortie d'un processus élevé n'est pas récupérable : `apply()` vérifie ensuite chaque règle avec `ruleExists()`. Codes d'erreur `FW_ERROR` (`UAC_CANCELLED`, `INVALID_RULE`, `NOT_APPLIED`) traduits côté renderer par `firewallErrorMessage()`.
- ⚠️ **Injection** : les noms de règles finissent dans une commande exécutée en admin → `SAFE_NAME` (lettres, chiffres, espace, `- _ . ( ) :`, 80 max) + port entier 1-65535 + protocole TCP/UDP, validés avant toute commande. Ne jamais assouplir sans échapper pour cmd.exe.
- Opérations groupées : IPC `firewall:applyNamedRules` / `firewall:removeNamedRules`. Ne jamais boucler sur `enableNamedRule` en parallèle (une invite UAC par appel). Valheim et Astroneer partagent `components/firewall/useNamedRulesFirewall.ts` (leurs hooks ne font que lister leurs règles).
- `netsh` répond dans la langue de Windows (FR chez le propriétaire) : ne jamais tester son texte de sortie pour décider d'un résultat — `ruleExists()` s'appuie sur le code de sortie.
- Transition : un serveur lancé par une ancienne version (admin) puis adopté par une version sans droits ne peut pas être tué par `taskkill` (accès refusé) — le relancer une fois depuis la nouvelle version.

### Communication IPC

```
Renderer (React) → window.api.xxx() → Preload (contextBridge) → ipcMain.handle() → Main
                 ← event listener    ← ipcRenderer.on()        ← event.sender.send()
```

Les services du main (`ServerManager`, `BackupManager`, etc.) sont instanciés **une seule fois** dans `registerIpcHandlers()` puis passés aux sous-handlers via `IpcContext`. Ne pas les instancier ailleurs.

### Types partagés

`src/shared/types.ts` est la source unique pour tout ce qui traverse IPC. Si un type traverse la frontière, il **doit** être là.

- **main** : `import type { ... } from "../../shared/types"`
- **renderer** : `import type { ... } from "@shared/types"` (alias vite + tsconfig)
- **preload/index.d.ts** : importe et déclare `Window.api` globalement

### Pattern GamePlugin (multi-jeux)

Chaque jeu expose un manifest typé dans `games/<jeu>/index.ts`. Le shell consomme la liste via le registry — **App.tsx, Sidebar.tsx et i18n/index.ts ne contiennent aucun nom de jeu en dur**.

**Pour ajouter un jeu :**

1. Créer `src/renderer/src/games/<jeu>/` avec la même structure (pages, i18n, `index.ts`)
2. Créer `src/main/games/<jeu>/` avec `serverConfig.ts` et `handlers/`
3. Exporter le manifest `GamePlugin` depuis `games/<jeu>/index.ts` et l'ajouter dans `games/registry.ts` (renderer) et `main/games/registry.ts` (main)
4. Ajouter les types spécifiques dans `src/shared/types.ts` s'ils traversent IPC
5. Wirer les handlers IPC dans `src/main/ipc/handlers.ts`

**Composants partagés entre jeux** → `src/renderer/src/components/firewall/`, `components/server/` et `components/players/` (page « Joueurs » complète, montée dans le manifest des jeux qui ont une source de données — voir « Historique des joueurs »). Ne jamais importer depuis `games/<autre-jeu>/`.

### Internationalisation (i18n)

- Langues supportées : **FR** (défaut) + **EN**. Détection initiale via navigateur, choix persisté dans `localStorage.locale`.
- Sélecteur de langue : ToggleButtonGroup FR/EN au bas de la Sidebar.
- **Chaque page a son dossier `__i18n__/` avec `fr.ts` et `en.ts`**. Ces fichiers sont regroupés dans le manifest `games/<jeu>/index.ts` — **ne pas les importer directement dans `i18n/index.ts`**.
- Pour ajouter des strings à une page : éditer `<Page>/__i18n__/fr.ts` ET `en.ts`, puis utiliser `const { t } = useTranslation(); t("page.key")`.
- **Interpolation** : `t("key", { name: "Bob" })` + `"Hello {{name}}"` dans la traduction.
- **Values vs labels** : les `value` des `<Select>` (ex: `Casual`, `ItemAndEquipment` de `Difficulty`/`DeathPenalty`) restent les valeurs INI brutes — seuls les labels UI sont traduits.
- Ce qui n'est **pas** traduit : logs du process serveur, tokens de coloration de logs (`[Manager]`, `[ERR]`), brand « Nexum » dans la Titlebar.

### Adoption d'un processus existant

Au démarrage, `ServerManager.tryAdopt()` scanne les processus via `systeminformation` pour détecter l'exécutable du jeu en cours (orphelin d'une session précédente) — préfixe par jeu dans `PROCESS_NAME_PREFIXES` (`main/servers/ServerManagerRegistry.ts` : `palserver`, `valheim_server`, `astroserver`). Si trouvé, le statut passe à `running` et on peut stop/restart via l'API REST (Palworld) + `taskkill`. **Les logs stdout/stderr ne sont pas récupérables** pour un processus adopté (le pipe appartenait à l'ancien parent).

### Démarrage automatique (issue #57)

- **Point d'entrée unique de démarrage** : `startServer(ctx, id, sendLog)` (`main/server/startServer.ts`) — validations (conflits de ports Palworld, mot de passe Valheim), args, env (`getGameEnv`), log des mods Valheim. Utilisé par l'IPC `server:start` ET par le démarrage automatique : ne jamais redupliquer cette logique ailleurs.
- **Par serveur** : `Server.autoStart` (case dans `ServerDialog`). `autoStartServers()` tourne **après** `tryAdoptAll` (`ipc/handlers.ts`, promesse `adoption`) : un serveur adopté (déjà en cours) n'est pas relancé ; démarrages espacés de 5 s ; un échec est écrit dans les logs du serveur.
- **Lancer Nexum avec Windows** : `main/startup/launchAtLogin.ts` — `app.setLoginItemSettings` avec l'argument `--autostart` (l'état vit dans Windows, pas dans notre config). Lancé avec cet argument, la fenêtre démarre **réduite** (`launchedAtLogin()` dans `main/index.ts`). Build portable : chemin réel via `PORTABLE_EXECUTABLE_FILE` (sinon l'exe temporaire extrait serait enregistré). Non supporté en dev (`supported: false` → l'interrupteur `LaunchAtLoginSwitch` est grisé avec une explication, pour ne pas enregistrer `electron.exe` au démarrage).

### Page Logs (partagée)

- `components/server/Logs.tsx` est la page Logs des **trois** jeux (`games/<jeu>/pages/Logs/Logs.tsx` ne fait que la réexporter). Ses textes sont dans `components/server/__i18n__/`, importés par chaque manifest (comme `components/players/`) — ils étaient dupliqués dans Palworld et Valheim, et Astroneer n'en avait pas.
- Tampon : 500 dernières lignes par serveur, en mémoire seulement (`ADD_LOG` dans `ServerContext`), perdu à la fermeture de Nexum.
- **Défilement automatique** : `hooks/useStickToBottom.ts` (page Logs, log embarqué du Dashboard Valheim, journal d'installation SteamCMD) — suit la dernière ligne seulement si l'utilisateur est déjà en bas, et agit sur `scrollTop` du conteneur. ⚠️ Jamais `scrollIntoView` : il fait défiler **tous les parents**, donc toute la page du Dashboard dans une petite fenêtre, ce qui cachait les boutons pendant le démarrage (signalé sur Discord).
- **Export pour les rapports de bug** (`LogExportButtons.tsx`, suggestion d'un utilisateur Discord) : **Copier** (presse-papiers) et **Enregistrer en .txt** (IPC `logs:saveToFile` → `dialog.showSaveDialog`, Documents par défaut ; puis bouton « Afficher dans le dossier » via `shell:showItemInFolder`). Toujours **tout** le tampon, jamais « les N dernières lignes » : la cause d'un arrêt est au début du log, la fin ne montre que la fermeture (vécu sur un rapport Valheim). Première ligne = `Nexum <version> · <jeu> · <date ISO>`. **Anonymisation à l'export** (`redactLog.ts`, demandée par le même utilisateur : un log Valheim contient l'IP publique plusieurs fois et le SteamID de chaque joueur déjà connecté) : IPv4 publiques → `[IP]` (port gardé ; boucle locale, `0.0.0.0` et plages privées conservées), SteamID64 (`7656119` + 10 chiffres) → `[SteamID]`, `join code X` → `join code [hidden]`. Marqueurs entre crochets, jamais `***` (Discord l'interprète comme du gras et casse les blocs de code — d'où aussi `redactArgs` → `-password [hidden]` dans `ServerManager`). Les noms de joueurs ne sont pas masqués ; une version en 4 parties (`1.0.0.0`) est masquée comme une IP (faux positif accepté). L'affichage à l'écran n'est pas modifié.

### Page Paramètres (réglages de l'app)

- `pages/Settings/` : page **globale** (comme Serveurs) — Démarrage (`LaunchAtLoginSwitch`), Langue, Mises à jour (`UpdateIndicator align="left"`), Aide et à propos (Discord, docs, bug, confidentialité). Règle : réglage **de l'app** → Paramètres ; réglage **d'un serveur** → sa fenêtre (`ServerDialog`) ou les pages du jeu.
- `GLOBAL_PAGES` (`App.tsx`) liste les pages indépendantes du jeu/serveur actif : toujours affichées, **séparées des pages du jeu dans la Sidebar** (groupe du bas, au-dessus de la langue et de la version, après un séparateur), pas de remount au changement de serveur. Toute nouvelle page globale doit y être ajoutée. Rendu d'une entrée : `components/Sidebar/SidebarNavItem.tsx` (partagé par les deux groupes).
- Sélecteur de langue partagé : `components/common/LanguageToggle.tsx` (compact dans la Sidebar, `size="medium"` dans Paramètres).

### Import d'un serveur déjà installé

- Pas de flow dédié : le dialogue d'ajout de serveur (`pages/Servers/components/ServerDialog.tsx`) accepte un dossier existant. Au choix du dossier, `servers:detectGameType` devine le jeu d'après l'exécutable présent à la racine (`main/servers/detectGameType.ts`, qui lit `exeName` de chaque `games/<jeu>/serverConfig.ts` — pas de liste dupliquée), et `useExeDetection` + `ExeStatusHint` confirment en direct que l'exe attendu existe (`servers:hasExpectedExe`).
- Palworld/Astroneer : rien d'autre à faire, leur config vit dans des `.ini` sous `serverPath`, relus tels quels.
- Valheim : la config passe par les args CLI (rien à relire sur disque), mais le nom du monde doit correspondre exactement. `valheim:listExistingWorlds` scanne `worlds_local` (ancien format `<nom>.fwl` à plat **et** nouveau format en dossier `<nom>/`, en excluant `*_backup*` et `.old`). À la création d'un serveur Valheim, s'il n'existe qu'un seul monde, il est pré-rempli (`useServers.importValheimWorld`) ; sinon le champ Monde de la page Config est un `Autocomplete` freeSolo qui propose les mondes détectés (`useExistingWorlds`).

## Conventions

- **UI bilingue FR/EN** via `react-i18next` — toute string user-facing passe par `t()` (jamais de texte en dur dans les JSX). Commentaires de code en français.
- **MUI uniquement** — pas de Tailwind, pas de CSS custom sauf `index.css` minimal
- **Notifications** : `useNotification().notify()` avec `t()` — jamais `alert()` ni état d'erreur local
- **Imports main** : ne jamais importer depuis `src/main/` dans le renderer (passer par IPC)
- **Fichiers < 200 lignes** : dès qu'une page dépasse, extraire hooks/components/data

## Palworld REST API

> **Avertissement** : ces API ne sont pas conçues pour être exposées sur Internet.
> L'app force `hostname: '127.0.0.1'` dans `PalworldApiClient` — ne pas changer ça.

- **Port** : `RESTAPIPort` (défaut 8212)
- **Auth** : HTTP Basic — `admin:{AdminPassword}` (depuis `PalWorldSettings.ini`)
- **Timeout** : 8 secondes
- **Fichier** : `src/main/games/palworld/PalworldApiClient.ts`

### Endpoints utilisés

| Endpoint           | Méthode | Rôle                                |
| ------------------ | ------- | ----------------------------------- |
| `/v1/api/info`     | GET     | `PalServerInfo`                     |
| `/v1/api/players`  | GET     | `{ players: PalPlayer[] }`          |
| `/v1/api/metrics`  | GET     | `PalMetrics`                        |
| `/v1/api/settings` | GET     | `Record<string, unknown>`           |
| `/v1/api/announce` | POST    | `{ message }`                       |
| `/v1/api/save`     | POST    | sauvegarde serveur                  |
| `/v1/api/shutdown` | POST    | `{ waittime, message? }` (gracieux) |
| `/v1/api/stop`     | POST    | arrêt immédiat                      |
| `/v1/api/kick`     | POST    | `{ userid, message? }`              |
| `/v1/api/ban`      | POST    | `{ userid, message? }`              |
| `/v1/api/unban`    | POST    | `{ userid }`                        |

## Config INI Palworld

- **Chemin** : `{serverPath}/Pal/Saved/Config/WindowsServer/PalWorldSettings.ini`
- **Section** : `[/Script/Pal.PalGameWorldSettings]`
- **Format** : `OptionSettings=(key1=val1,key2=val2,...)`
- **170+ paramètres** avec valeurs par défaut dans `src/main/games/palworld/PalConfigParser.ts`
- Types : string (quoté), int, float (6 décimales), bool, enum (non quoté), array `(val1,val2)`
- Les définitions d'UI (clés + types) sont dans `games/palworld/pages/Config/fields.ts`, les presets de difficulté dans `presets.ts`, et les labels/descriptions traduits dans `Config/__i18n__/{fr,en}.ts`.

## Config INI Astroneer

> **MVP sans RCON** : Astroneer expose un protocole RCON (TCP, `ConsolePort`, défaut 1234) pour liste de joueurs / save / shutdown gracieux, mais Nexum ne l'implémente pas (choix produit — voir historique du projet). L'arrêt est donc toujours brutal (`taskkill`), comme Valheim. `ConsolePort`/`ConsolePassword` sont éditables dans la page Config (parité avec le groupe RCON de Palworld) mais **sans usage applicatif**, et **sans règle firewall automatique** — ne jamais exposer ce port publiquement (avertissement officiel Astroneer).

- **2 fichiers INI standards** (contrairement au format Palworld `OptionSettings=(...)` sur une ligne), fusionnés en un seul objet `AstroneerSettings` côté app :
  - `{serverPath}/Astro/Saved/Config/WindowsServer/Engine.ini` → section `[URL]`, clé `Port` (défaut 8777)
  - `{serverPath}/Astro/Saved/Config/WindowsServer/AstroServerSettings.ini` → section `[/Script/Astro.AstroServerSettings]`, ~17 clés (`ServerName`, `MaxPlayerCount`, `OwnerName`, `ConsolePort`, etc.)
- Parser : `src/main/games/astroneer/AstroConfigParser.ts` (`read`/`write` avec backup `.backup` avant écriture, comme `PalConfigParser`).
- ⚠️ Astroneer ne persiste pas les changements de config faits pendant que le serveur tourne — éditer uniquement serveur arrêté (avertissement officiel).
- UI data-driven comme Palworld : `games/astroneer/pages/Config/fields.ts` (`FIELD_GROUPS`) + composants `ConfigGroup`/`ConfigField` (copie locale, pas de presets de difficulté).
- IPC : `astroconfig:read` / `astroconfig:write` (dossier `games/astroneer/handlers/config.ts`).

## Mods Valheim (Thunderstore + Hexium)

- **Deux registres supportés** : Thunderstore et [Hexium](https://hexium.gg) (plateforme apparue en 2026 suite au départ de plusieurs modders de Thunderstore — voir historique du projet). Hexium expose une API **volontairement compatible Thunderstore** (mêmes endpoints `/c/{communauté}/api/v1/package/` et `/api/experimental/package/{namespace}/{name}/`, même schéma, même bizarrerie `owner`/`namespace` ci-dessous, communauté Valheim identifiée `"valheim"` sur les deux) — vérifié en lisant leur spec OpenAPI live (`hexium.gg/api/openapi.json`), pas dans une doc statique. `ModRegistry = "thunderstore" | "hexium"` (`shared/types.ts`) est le type central de cette abstraction.
- `ModRegistryClient.ts` (`src/main/games/valheim/`, remplace l'ancien `ThunderstoreClient.ts`) consomme l'endpoint **v1 community package list** de l'un ou l'autre registre selon le paramètre `registry` passé à chaque méthode statique (cache TTL 5 min **par registre**, `Map<ModRegistry, ...>`). ⚠️ Ce endpoint **ne renvoie pas de champ `namespace`** (contrairement à ce que le spec OpenAPI expérimental laisse penser, vrai sur les deux registres) — l'identité de l'auteur y est exposée uniquement via `owner`. Toujours matcher les packages avec `p.owner`, jamais `p.namespace` (qui vaut `undefined` en pratique et fait échouer silencieusement tout `.find()`).
- `REGISTRY_API_BASE`/`REGISTRY_LABEL`/`modPageUrl()` centralisés dans `src/main/games/valheim/registries.ts` (URLs de base + page publique d'un mod). ⚠️ Le pattern d'URL de page publique **diffère** entre les deux : Thunderstore `https://thunderstore.io/c/valheim/p/{owner}/{name}/`, Hexium `https://valheim.hexium.gg/mods/{owner}/{name}` (sous-domaine par jeu, pas de préfixe `/c/{communauté}/`) — vérifié sur une page Hexium réelle, absent de leur doc API. Le renderer ne pouvant pas importer `src/main/`, ce même helper est dupliqué (volontairement, c'est juste un pattern d'URL) côté renderer dans `pages/Mods/utils/modPageUrl.ts`.
- Le "code" d'un mod (`thunderstoreCode` sur `ValheimMod` — nom historique conservé tel quel, persisté dans `mods.json`, vaut pour les deux registres) est parsé/reconstruit à plusieurs endroits (`ValheimModsManager.installMod`, `ModRegistryClient.checkUpdates`/`getMissingDeps`) — le segment "auteur" de ce code correspond à `owner`, pas à un vrai namespace. Le registre d'origine d'un mod installé est son champ `source` (`"thunderstore" | "hexium" | "manual"`).
- **Icônes de mods et CSP** : la CSP (`src/main/index.ts`, **appliquée uniquement en build packagé** — invisible en `yarn dev`) doit autoriser les CDN d'images des registres dans `img-src`. Wildcards `https://*.thunderstore.io https://*.hexium.gg` car Thunderstore a changé de CDN sans prévenir (`gcdn.` → `ccdn.thunderstore.io`, ça a cassé toutes les icônes) ; Hexium sert depuis `cdn.hexium.gg`. Tout nouveau registre = ajouter son domaine ici.
- `ValheimModsManager.installMod(registry, code, onProgress)` télécharge en priorité via le `download_url` réel renvoyé par l'API (fetch best-effort du package pour l'icône/date) ; si ce fetch échoue, retombe sur une URL construite par convention `{base}/package/download/{ns}/{name}/{version}/` — motif vérifié stable sur Thunderstore, pas garanti à 100% sur Hexium mais c'est le seul fallback disponible.
- **Dépendances croisées entre registres** : `ModRegistryClient.getMissingDeps` cherche chaque dépendance d'abord dans le registre du mod parent, puis dans l'autre registre via `getPackageAnyRegistry` (un mod Hexium peut dépendre d'un mod resté sur Thunderstore, et inversement).
- `ValheimModsManager` (`src/main/games/valheim/`) gère l'install locale (dossier `BepInEx/plugins/<namespace>_<nomSafe>/`, métadonnées dans `{dataDir}/mods.json`). Les mods installés manuellement (hors app) sont détectés par scan du dossier et taggés `source: "manual"` (pas de vérif de mise à jour possible, pas de `thunderstoreCode`).
- Vérif des mises à jour : IPC `checkUpdates` prend `{code, registry}[]` (pas juste des codes bruts). `ModRegistryClient.checkUpdates` cherche, pour chaque mod, une version plus récente sur son **registre d'origine d'abord, puis sur les autres** (même logique de repli que `getMissingDeps`) — pas juste "reste sur son registre", pour couvrir le cas Azumatt (mod gelé sur Thunderstore, toujours maintenu sur Hexium). `ModUpdate.sourceChanged` signale quand la mise à jour trouvée implique un changement de registre ; l'UI l'affiche explicitement (chip + tooltip "passera de X à Y"), à la manière de Gale qui prévient du changement de source avant d'installer. Compare la version installée à `pkg.versions[0].version_number` (le tableau `versions` de l'API est trié du plus récent au plus ancien).
- **Mods dépréciés** (`is_deprecated` de l'API, ex : mods Azumatt sur Thunderstore) : `listPackages` les **conserve** dans le cache (ils étaient filtrés avant, ce qui rendait tout indicateur impossible). Tendances/récents les excluent (`active()`), la recherche les garde, placés après les mods maintenus **à pertinence égale** (pas en fin de liste absolue : un mod déprécié cherché par son nom exact doit rester en tête, sinon il passe derrière la limite de 50 résultats). `checkUpdates` renvoie `ModUpdateCheck = { updates, deprecatedCodes }` : un package déprécié ne propose jamais de mise à jour (on continue sur les autres registres, comme avant), et `deprecatedCodes` liste les mods installés dépréciés sur leur registre d'origine. `getPackageAnyRegistry` préfère une version maintenue sur un autre registre à une version dépréciée sur le registre préféré. UI : composant partagé `DeprecatedChip` (liste installée + Parcourir), tooltip qui mentionne le registre alternatif quand une MàJ `sourceChanged` existe.
- **Recherche de mods** (`ModRegistryClient.search` + `searchRank`) : classement par pertinence, pas par l'ordre de l'API — nom identique (0), nom qui commence par (1), nom qui contient (2), auteur / `full_name` (3), description (4), tous les mots d'une recherche multi-mots présents (5) ; puis non déprécié avant déprécié, puis `rating_score`. Les noms sont comparés sans espaces/tirets/soulignés (« azu auto » → AzuAutoStore). Avant : simple filtre `includes` dans l'ordre de popularité, AzuAutoStore sortait 3e sur « azuauto ».
- **Dates des mods** : Parcourir affiche `updated_timestamp` (= `date_updated` du package dans la liste v1, déjà chargée — aucun appel réseau en plus) via `ModUpdatedDate`, en orange au-delà d'**un an** (`STALE_AFTER_MS`). Volontairement **pas** comparé à la date du dernier patch de Valheim (il faudrait interroger Steam → nouvel appel réseau à déclarer, et la plupart des mods survivent aux patchs : tout passerait en alerte). Onglet Installés : `publishedAt` = date de publication de la **version installée** (`date_created` de la version, lue à l'install), libellé « Version publiée sur {registre} » (l'ancien « MàJ Thunderstore » était pris pour la dernière mise à jour du mod).
- **Pastille de provenance** : `RegistryChip` (liste des mods installés + dialogue des dépendances), une couleur par registre — `NEXUM.thunderstore` (bleu), `NEXUM.hexium` (violet), gris pour « Manuel ». Volontairement hors des couleurs de statut (vert/orange/rouge, déjà prises par « en ligne », les mises à jour et « Déprécié »). Avant : même violet pour les deux.
- **Rappel côté joueurs** (`ClientModsHint`, sous le bandeau BepInEx) : Nexum n'installe que sur le serveur, la plupart des mods doivent aussi être chez chaque joueur (vécu : un utilisateur pensait que le serveur suffisait, « aucun mod ne marche »).
- **Onglet Parcourir** : sélecteur de registre (`ToggleButtonGroup` Thunderstore/Hexium dans `ModBrowser.tsx`) — deux listes indépendantes, pas de fusion. Même sélecteur dans le dialog "coller un code" (`Mods.tsx`) puisqu'un code brut `Auteur-Nom-Version` est ambigu entre les deux registres.
- **Onglet Configs** (`pages/Mods/`) : `ConfigFilesList` (filtre par nom de fichier) → `ConfigFileEditorDialog` (champ de recherche + `CfgStructuredEditor`, filtre section/clé/description avec `useDeferredValue`). Perf sur les gros fichiers (Valheim Plus = centaines de paramètres) : sections en accordéons (`CfgSection`, `unmountOnExit` → les champs MUI ne sont montés qu'à l'ouverture ; une recherche n'auto-ouvre les sections que sous 40 résultats) et lignes (`CfgEntryRow`) en `React.memo` : `updateEntry` ne doit remplacer que l'objet de l'entrée modifiée et `onChange` rester stable. ⚠️ Pas de `content-visibility: auto` sur les lignes (son paint containment rogne le label flottant des Select) ni de `InputLabel` sur les Select (la clé est déjà affichée à gauche).
- **Import de profil r2modman/Gale** (`parseThunderstoreProfile`) : un code d'export est un jeton opaque (pas forcément un UUID — le backend actuel génère des clés type `xxx#yyy`), résolu via `GET {base}/api/experimental/legacyprofile/get/<code>/` (⚠️ le `/get/` est obligatoire, absent du spec OpenAPI). **Gale supporte des profils mélangeant Thunderstore et Hexium** — le code lui-même peut avoir été créé par l'un ou l'autre backend, donc `resolveProfileCodeViaApi` essaie chaque registre (`REGISTRIES`) jusqu'à ce que l'un réponde ; une fois la liste de mods obtenue, chaque code est ensuite installé en essayant chaque registre à son tour (`installCodes` dans `handlers/mods.ts`) puisque le format r2x (YAML `name`+`version`, pas de champ registre) ne dit pas d'où vient un mod donné. La réponse de résolution est du **texte brut** (pas du JSON) : `"#r2modman\n" + base64(zip)`. Le zip contient `export.r2x`, extrait via `extract-zip` dans un dossier temporaire puis parsé par regex (`extractModRefsFromR2x`, pas de dépendance YAML ajoutée).

## Arguments de lancement

- **Variables d'environnement par jeu** : `env` dans `games/<jeu>/serverConfig.ts`, lues par `getGameEnv()` (`main/games/registry.ts`) et passées à `ServerManager.start/restart` (conservées pour l'auto-restart). **Valheim : `SteamAppId=892970`**, comme `start_headless_server.bat` — sans elle ni `steam_appid.txt` dans le dossier (absent de certaines installs faites via la bibliothèque Steam ; SteamCMD le crée), le serveur s'arrête quelques secondes après le démarrage (signalé par un utilisateur, 0.4.2). Tout démarrage (manuel, redémarrage, planifié) doit passer `getGameEnv(gameType)`.
- **Validations Valheim au démarrage** (`server:start`, `ipc/handlers/server.ts`) : mot de passe < 5 caractères et mot de passe contenu dans le nom du serveur → démarrage bloqué avec un message (Valheim quitterait silencieusement). ⚠️ Nexum lance avec **sa** config (page Config), pas avec le `.bat` de l'utilisateur : un serveur importé peut avoir un nom/monde/mot de passe différents.
- **Palworld** : config `launchArgs: { publicLobby, performanceFlags, customArgs }` (type `LaunchArgsConfig`). `buildArgs` dans `src/main/games/palworld/serverConfig.ts`.
- **Valheim** : config `valheimConfig: ValheimLaunchConfig`. `buildArgs` dans `src/main/games/valheim/serverConfig.ts`.
- **Astroneer** : config `astroneerConfig: { customArgs }` (type `AstroneerLaunchConfig`) — Astroneer ne prend quasi aucun argument CLI, toute la config passe par les fichiers `.ini` (voir « Config INI Astroneer »). `buildArgs` dans `src/main/games/astroneer/serverConfig.ts`.
- IPC : `server:getLaunchArgs` / `server:setLaunchArgs`. UI : section « Arguments de lancement » dans Installation (Palworld uniquement — Valheim/Astroneer n'affichent pas cette section, leur config passe par leur page Config dédiée).
- `-publiclobby` active le mode lobby EOS Palworld (crossplay Xbox).

## Sauvegardes

- Dossier zippé : `{serverPath}/Pal/Saved/SaveGames/` (Palworld) ou `{serverPath}/Astro/Saved/SaveGames/` (Astroneer, résolu dans `main/ipc/handlers/backup.ts`). Valheim utilise un chemin hors `serverPath` (`%LOCALAPPDATA_LOW%/IronGate/Valheim/worlds_local` ou `savedir` custom).
- Format : ZIP niveau 9, nom `backup-YYYY-MM-DD_HH-MM-SS.zip`
- Dossier cible : configurable (défaut `{userData}/backups`)
- Rotation : garde N dernières (0 = infini)
- Auto : intervalle 0 à 1440 min, **actif uniquement si serveur en cours**

## Redémarrage planifié

- Une heure quotidienne (`HH:MM` 24h), pas de multi-horaires
- Flow (Palworld) : annonce (via `/v1/api/announce`) → attente `warningMinutes` → save → shutdown API
- Scheduler vérifie toutes les 30 secondes
- **Requiert l'API REST activée** (Palworld) — sinon l'arrêt est brutal (`taskkill`) sans save. Astroneer n'a pas de flow gracieux dans Nexum (`getStopConfig()` renvoie `restApiEnabled: false` → `taskkill` systématique). **Valheim** n'a pas d'API REST mais a son propre mécanisme : `getStopConfig()` renvoie `gracefulSignal: true`, et `ServerManager.stop()` envoie un vrai CTRL+C (`windowsCtrlC.ts`, via `AttachConsole`/`GenerateConsoleCtrlEvent`) avant de retomber sur `taskkill` en dernier recours (timeout 30s) — recommandé par le manuel officiel pour éviter une sauvegarde corrompue.
- **Détection de fin d'arrêt** (`ServerManager.stop`) : pour un processus lancé par Nexum, la fin est lue sur le `ChildProcess` lui-même (`close` / `exitCode`), **jamais** via `si.processes()` — cette liste peut échouer ou être en retard (appels concurrents du monitoring) et `isPidAlive` répond alors « vivant », ce qui déclenchait un `taskkill /F /T` sur un serveur déjà fermé proprement (log « Server exited with code 0 » suivi de « Le processus ne répond pas »), au risque de tuer un autre programme si Windows a réattribué le PID. La vérification par PID (`ensureStopped`, `waitForPidExit`) ne sert que pour les processus **adoptés**.

## Historique des joueurs

- `PlayerHistoryTracker` (`src/main/players/`) est **générique multi-jeux** : il ne connaît que l'interface structurelle `{ getPlayers(): Promise<{ players: TrackedPlayer[] }> }` (voir en tête du fichier), pas les clients concrets. Poll toutes les 30s **uniquement quand le serveur tourne ET qu'une source de données joueurs est configurée pour ce jeu**.
  - **Palworld** : `PalworldApiClient.getPlayers()` (API REST officielle, voir plus haut).
  - **Valheim** : `OdinEyeApiClient.getPlayers()` (`src/main/games/valheim/OdinEyeApiClient.ts`), qui interroge le plugin BepInEx tiers **Odin-Eye** ([sparcopt.github.io/odin-eye](https://sparcopt.github.io/odin-eye/)). ⚠️ La doc en ligne (`GET /v1/players` → `{ entries: [...] }`) ne correspond pas au plugin v1.0.0.0 réellement installé, qui expose `GET /players` (tableau JSON) et répond un **200 au corps vide** sur tout chemin inconnu (donc un 200 ne prouve rien) — le client essaie les deux et échoue si aucun ne renvoie du JSON. Il adapte `steamId`→`userId`/`id`→`playerId` (pas d'IP disponible côté cette API). `odinEyeUrl` (ex: `http://127.0.0.1:21618`) est un champ de `ValheimLaunchConfig`, édité dans la section Réseau de la page Config Valheim — vide = suivi désactivé. **Installation côté serveur** (à faire manuellement par l'utilisateur, Nexum ne l'automatise pas) : BepInEx requis, copier les `.dll` de la release Odin-Eye dans `Valheim/BepInEx/plugins/`, démarrer une fois pour générer `Valheim/BepInEx/config/org.bepinex.plugins.odineye.cfg`, y renseigner `HttpServerAddress` sur un port ≠ 2456/2457, redémarrer. ⚠️ Comme Palworld, **pas d'authentification** côté plugin à ce jour — ne jamais exposer ce port publiquement.
  - `PlayerCountCard` (Dashboard Valheim) s'affiche dès que le serveur tourne, **crossplay ou non**. Compteur (`useValheimPlayerCount`) : Odin-Eye quand `odinEyeUrl` est renseigné (`useOdinEyeOnlineCount` = entrées `online` de l'historique, rafraîchi toutes les 10s ; latence max ~30s du tracker), sinon regex `now N player(s)` sur les logs — ⚠️ ces lignes viennent de la session PlayFab et **n'existent qu'avec `-crossplay`** : hors crossplay sans Odin-Eye, le compteur affiche « — ». Le code de connexion / IP ne sont **volontairement pas affichés** (uniquement dans les logs crossplay, Odin-Eye ne les expose pas : `/v1/serverInfo` = `maxNumberOfPlayers`/`gameVersion`/`steamAppId`).
  - **Astroneer** : pas de source (MVP sans RCON, voir plus haut) — le tracker ne démarre jamais pour ce jeu.
  - Le routage par jeu (`gameType` → bon client) est fait dans `getApiClientForServer` (`main/ipc/handlers.ts`).
- Stockage : `{userData}/servers/<id>/players/history.json` — un fichier JSON par serveur avec tableau de `PlayerHistoryEntry` (cf. `shared/types.ts`).
- Chaque entrée trace `firstSeen`, `lastSeen`, `lastIp`, `totalPlaytimeMs`, `sessionCount`, `online`, `currentSessionStart` et un tableau `sessions[]` (cap à 50, plus anciennes éjectées).
- Le tracker est démarré/arrêté via une boucle de surveillance dans `handlers.ts` qui vérifie `serverManager.getStatus()` toutes les 5s. À l'arrêt il ferme toutes les sessions ouvertes et persiste.
- IPC : `players:getHistory` / `players:clearHistory` / `players:removeEntry` (déjà génériques). UI : page « Joueurs » — composant **partagé** `src/renderer/src/components/players/` (comme `components/firewall/`), montée dans le manifest de chaque jeu qui a une source de données (Palworld, Valheim ; pas Astroneer).

## Versioning & releases (release-please)

- **Semver sans suffixe** : `0.x.y` (le `0.` signale déjà l'instabilité). Plus de `-alpha.N` depuis la `0.1.0`.
- **Version calculée automatiquement** par [release-please](https://github.com/googleapis/release-please-action) à partir des **titres de PR** (squash-merge → le titre devient le commit sur `main`) :
  - `fix: …` → patch, `feat: …` → mineur, `feat!: …` → mineur aussi tant qu'on est en `0.x` (`bump-minor-pre-major`) ;
  - `chore:`/`docs:`/`ci:`/`refactor:` … → pas de release (masqués du CHANGELOG, voir `changelog-sections`).
  - `pr-title.yml` bloque une PR dont le titre n'est pas conventional commits.
- **Flow** : chaque push sur `main` → release-please met à jour une PR `chore(main): release X.Y.Z` (bump `package.json` + `.release-please-manifest.json` + `CHANGELOG.md`). **Merger cette PR = publier** : release-please crée la release GitHub **en draft** + le tag (`force-tag-creation`, sinon GitHub ne crée le tag d'un draft qu'à la publication et release-please ne retrouve plus la release précédente), puis le job `build-windows` lance `yarn build --publish always` (electron-builder réutilise toujours un draft existant pour le tag ; `releaseType: draft` dans `electron-builder.yml` pour ne jamais publier seul) et publie enfin la release (`gh release edit --draft=false`) — l'updater ne voit jamais une release sans `latest.yml`.
- Tout est dans **un seul workflow** : un tag créé avec `GITHUB_TOKEN` ne déclenche aucun autre workflow.
- **Signature de code (SignPath Foundation)** : ⚠️ **candidature refusée le 2026-10-02** (manque de visibilité publique : étoiles, forks, références externes) — recandidater quand le projet aura plus de traction. Les exe ne sont **pas signés** : `docs/code-signing.md` (+ `.fr.md`) le dit explicitement et décrit les règles qui s'appliqueront. La phrase « Free code signing provided by SignPath.io, certificate by SignPath Foundation » (exigée par SignPath) ne doit y être remise **qu'une fois la signature réellement en place** — l'afficher avant ferait croire que l'app est signée. La page contient aussi les rôles de l'équipe et la déclaration de confidentialité. ⚠️ Cette déclaration liste **chaque** connexion réseau de l'app (GitHub au démarrage pour les mises à jour, Steam via SteamCMD, Thunderstore/Hexium sur la page Mods) : tout nouvel appel réseau doit y être ajouté, sinon la déclaration devient fausse et SignPath peut révoquer. `package.json` → `author` alimente le champ éditeur de l'exe (métadonnées exigées). Conditions SignPath : pas de double licence commerciale, MFA sur GitHub et SignPath, approbation manuelle de chaque signature.
- **Vérification des téléchargements** (l'exe n'est pas signé) : avant la publication, le workflow ajoute aux notes de release le **SHA256** de chaque `.exe` et, si le secret `VT_API_KEY` existe (clé gratuite virustotal.com), les liens d'analyse **VirusTotal** (`crazy-max/ghaction-virustotal`, `continue-on-error` : un échec VirusTotal ne bloque jamais une release). Piste de signature gratuite pour projet open source : SignPath Foundation (candidature à faire par le propriétaire).
- **Si l'étape « Publish release » échoue** (ex : HTTP 502 de l'API GitHub, vécu en 0.1.1 — l'étape fait désormais 5 tentatives) : le build et l'upload sont déjà faits, la release est complète mais reste en **draft**. Vérifier les assets (`gh release view vX.Y.Z` → `latest.yml` + setup + portable + blockmap) puis publier à la main avec `gh release edit vX.Y.Z --draft=false --latest`. Inutile de relancer tout le job (4 min de build pour rien).
- **Ne jamais** bumper `version` dans `package.json` ni pousser de tag à la main.
- Pour forcer une version précise (ex: passage en `1.0.0`), ajouter temporairement `"release-as": "X.Y.Z"` dans `packages["."]` de `release-please-config.json`, puis le retirer une fois la release sortie (sinon release-please continue de proposer cette version). ⚠️ release-please ne crée **aucune** PR de release tant qu'il n'y a pas au moins un commit `feat`/`fix`/`perf`/`revert`/`deps` depuis la dernière release, même avec `release-as` (vécu pour la 0.1.0).
- Prérequis côté repo GitHub : _Settings → Actions → General → « Allow GitHub Actions to create and approve pull requests »_ (sinon release-please ne peut pas ouvrir sa PR), et squash-merge avec _« Default to pull request title »_.

## Mise à jour in-app (electron-updater)

- `src/main/update/AutoUpdater.ts` branche `electron-updater` sur les releases GitHub publiées par le workflow de release (canal par défaut → `latest.yml`, ni `allowPrerelease` ni `channel` — versions stables `0.x.y` depuis la `0.1.0`).
- **Migration depuis les alphas** : les installs en `0.0.1-alpha.N` ont `channel = "alpha"` + `allowPrerelease = true` codés en dur. Elles retrouvent quand même les versions stables : `electron-updater` (6.8.x, `GitHubProvider`) accepte un tag sans suffixe depuis le canal alpha, cherche `alpha.yml` puis retombe sur `latest.yml`. Ne pas réintroduire de suffixe `-alpha`/`-beta` sans revoir ça.
- Vérification auto au démarrage (`checkForUpdateOnStartup`), mais **téléchargement et installation restent des actions manuelles** déclenchées depuis la Sidebar (`UpdateIndicator.tsx`) — pas d'auto-download/install silencieux.
- L'installeur NSIS est en mode assisté (`oneClick: false`, `allowToChangeInstallationDirectory: true`) — nécessaire pour que l'auto-update fonctionne correctement avec un chemin d'installation choisi par l'utilisateur. Le build portable n'a pas d'auto-update (mise à jour manuelle uniquement).
