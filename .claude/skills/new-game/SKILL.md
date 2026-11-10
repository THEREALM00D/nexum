---
name: new-game
description: Procédure complète pour ajouter le support d'un nouveau jeu à Nexum — test d'un vrai serveur dédié d'abord, puis types, main, store, preload, renderer, pare-feu, docs. Utiliser quand l'utilisateur veut ajouter, supporter ou intégrer un nouveau jeu (serveur dédié) dans Nexum, ou qu'une issue le demande.
argument-hint: <nom du jeu>
---

# Ajouter un jeu à Nexum : $ARGUMENTS

Suit les règles de `.claude/CLAUDE.md` (issue, branche, PR, doc). Si ce travail vient de `/nexum`, ce skill détaille ses étapes de plan et de développement. **Valheim est le modèle** (le plus testé) : ne reprendre un autre jeu que pour ce que Valheim n'a pas (config INI : Astroneer / Dragonwilds ; config JSON et page Config façon Valheim : Enshrouded ; API REST : Palworld). Lire `src/main/games/CLAUDE.md` et le `CLAUDE.md` du jeu modèle avant de commencer.

## 1. Tester un vrai serveur d'abord (avant tout code)

Les guides officiels se trompent souvent (Dragonwilds : 5 erreurs). Installer le serveur avec SteamCMD dans un **dossier de test** (appId Steam du serveur dédié, `anonymous` si possible), le lancer **depuis une console séparée** (`Start-Process`), puis relever :

- [ ] Nom réel de l'exe à la racine, et du processus enfant s'il y a un lanceur (préfixe du **serveur**, différent de celui du client du jeu)
- [ ] Ce qui sort sur stdout (complet ou non → fichier de log à suivre ?), ce qui sort sur stderr et qui n'est pas une erreur
- [ ] Arrêt propre : **CTRL+Pause d'abord** (un CTRL+C peut être ignoré par un serveur lancé par Nexum), puis CTRL+C, `taskkill` sans `/F` ; code de sortie ; monde sauvegardé ou non. Tester depuis une console séparée : un script qui partage la console du serveur reçoit le signal aussi.
- [ ] Ports réellement ouverts : `Get-NetUDPEndpoint -OwningProcess <pid>` / `Get-NetTCPConnection` (fixes ou éphémères, lesquels rediriger)
- [ ] Fichier de config : chemin, format, encodage, fins de ligne, **qui le réécrit et quand** (démarrage, arrêt, en cours d'exécution)
- [ ] Sauvegardes : dossier, fréquence de l'autosauvegarde, sauvegarde à chaud sur commande (API, RCON, console) ?
- [ ] Secrets écrits dans les logs (mots de passe, IP publique, identifiants) → masquage à l'export
- [ ] RAM au repos, place disque, joueurs max, comment on rejoint (nom cherché dans le jeu, IP:port)
- [ ] Un serveur lancé par Nexum meurt-il avec lui (processus unique) ?

Noter les résultats : ils deviennent le `CLAUDE.md` du jeu. Si quelque chose ne peut pas être testé (pas de connexion d'un joueur…), le dire et ouvrir une issue de suivi.

## 2. Types partagés

`src/shared/types.ts` : le jeu dans `GameType`, sa config de lancement dans `ServerConfig` (+ types qui traversent l'IPC, codes `AppErrorCode`). Puis **`yarn typecheck`** : il liste tous les `Record<GameType, …>` à compléter (`GAME_SERVER_CONFIGS` et les dispatchs de `src/main/games/registry.ts`, `SAVE_REQUESTS`, `GAME_TRANSFERS` (fichiers de config qui suivent « déplacer un serveur »), `STEAM_APP_IDS`, `PROCESS_NAME_PREFIXES`, `DEFAULT_INSTALL_PATHS`…).

## 3. Main

- `src/main/games/<jeu>/serverConfig.ts` : `exeName`, `buildArgs`, `getSavePath`, `getStopConfig` (`gracefulSignal: "ctrlBreak"` si le test l'a validé), `getPorts` (`forward: true` pour les ports à rediriger), `env?`, `getLogFilePath?`.
- Parser de config (`.backup` avant écriture, encodage et fins de ligne gardés via `readIniText` / `writeIniText`, clés inconnues préservées), `handlers/` pour l'IPC du jeu.
- Préparation avant chaque démarrage (validations, fichiers à réécrire) → `PREPARE` dans `registry.ts`, pas dans `startServer`. Lignes techniques à masquer → `LOG_NOISE`. Nom à chercher dans le jeu → `SEARCH_NAMES`.
- `src/main/servers/ServerConfigStore.ts` : valeurs par défaut + fusion dans `get` / `update` / `migrateLegacy`.
- `src/main/ipc/context.ts` + `ipc/handlers.ts` : accesseurs `get/update<Jeu>Config`, enregistrement des handlers.
- Secrets du log → `redactLog.ts`. Source de joueurs éventuelle → `getApiClientForServer`.

## 4. Preload

`src/preload/index.ts` + `index.d.ts` : namespace du jeu.

## 5. Renderer

- `src/renderer/src/games/<jeu>/` : manifest `GamePlugin` (`index.ts` : pages, `supportedPages`, i18n, `requirements` RAM/disque), pages, `__i18n__/{fr,en}.ts` par page. Ajouter à `GAMES` (`games/registry.ts`) et `servers.games.<jeu>` dans `pages/Servers/__i18n__`.
- Réutiliser : `ConfigPage` (ou `ConfigGroup` / `ConfigField` / `useConfigLoad` pour une page façon Valheim, avec `lockWhileRunning` si le jeu réécrit sa config), `BackupPage` (`autoNoteKey` obligatoire), `RestartSchedulePage`, `useNamedRulesFirewall` (port dans le nom des règles), `JoinServerCard`, `Logs`, `SimpleDashboard`. Ne rien importer depuis un autre jeu : extraire dans `components/`.
- **Clés i18n préfixées par le jeu** (`<jeu>Config`, `<jeu>Dashboard`…) : la fusion i18n est à un seul niveau, une clé de 1er niveau commune écrase l'autre.
- Rien à modifier dans `App.tsx`, la Sidebar, `i18n/index.ts`, l'assistant, le dialogue d'ajout de serveur, la page Installation, la détection d'un dossier existant : ils lisent la liste des jeux.

## 6. Vérifier

`yarn typecheck`, `yarn lint:check`, puis `/test-app` avec le serveur de test : installation, détection d'un dossier existant, config (écriture relue par le serveur), démarrage, logs, arrêt propre (monde sauvegardé), sauvegarde serveur lancé, pare-feu, carte Rejoindre, redémarrage planifié.

## 7. Docs et listes de jeux

- [ ] `docs/<jeu>.md` + `docs/<jeu>.fr.md` (mêmes contenus)
- [ ] Listes de jeux : `README.md`, `README.fr.md`, `docs/installation*.md`, champ « Game » de `.github/ISSUE_TEMPLATE/*.yml`, phrase d'intro du `CLAUDE.md` racine
- [ ] Label `game:<jeu>` sur GitHub (`gh label create game:<jeu> --color 1d76db`)
- [ ] Liens de doc officielle dans `.claude/CLAUDE.md` (« Doc officielle »)
- [ ] `src/main/games/<jeu>/CLAUDE.md` (résultats du test réel, ⚠️ pour chaque écart avec la doc officielle) + renvoi d'une ligne dans `src/renderer/src/games/<jeu>/CLAUDE.md`
- [ ] Nouvel appel réseau éventuel → `docs/code-signing*.md`
