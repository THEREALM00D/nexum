# Jeux : registre côté main

Ajouter un jeu : skill **`/new-game`** (procédure complète, tester un vrai serveur d'abord). Chaque jeu a son `CLAUDE.md` dans son dossier (faits vérifiés sur une vraie install).

- `registry.ts` : `Record<GameType, …>` qui dispatchent vers les `serverConfig.ts` de chaque jeu : `getLaunchSpec` (exe, args, `env`, `logFile`, `prepare` via `PREPARE`, `logNoise` via `LOG_NOISE`), `getGamePorts`, `getGameSavePath`, `getGameStopConfig`, `getGameEnv`, `getGameSearchName` (`SEARCH_NAMES`), `GAME_TYPES`.
- `<jeu>/serverConfig.ts` : `exeName`, `buildArgs`, `getSavePath`, `getStopConfig`, `getPorts`, `env?`, `getLogFilePath?`. Lu aussi par `detectGameType.ts` (import d'un dossier existant).
- `ports.ts` : `GamePort` (`forward: true` = à rediriger sur la box, affiché dans la carte Rejoindre ; jamais RCON/REST) + `formatPortRange`.
- `saveRequests.ts` : `SAVE_REQUESTS`, sauvegarde à chaud avant un backup (voir `src/main/backup/CLAUDE.md`).
- `transferFiles.ts` : `GAME_TRANSFERS`, ce qu'emporte « déplacer un serveur » (fichiers de config du jeu, filtre du monde, mods) ; voir `src/main/transfer/CLAUDE.md`.
- `afterStart.ts` : `AFTER_START`, tâche après un démarrage réussi (ARK : créatures sauvages, voir `src/main/scheduler/CLAUDE.md`).
- Autres `Record<GameType, …>` hors de ce dossier : `STEAM_APP_IDS` (`src/main/steamcmd/SteamCMD.ts`, exporté), `PROCESS_NAME_PREFIXES` (`src/main/servers/ServerManagerRegistry.ts`), `DEFAULT_INSTALL_PATHS` (`useInstall.ts`, renderer). `yarn typecheck` les liste tous quand `GameType` change.
- Installation / mise à jour SteamCMD : un seul IPC pour tous les jeux, `steamcmd:installGame(gameType, path)` / `steamcmd:updateGame()` (serveur actif) → `STEAM_APP_IDS[gameType]`. Renderer : `services/steamService.ts`. Jamais un canal par jeu.
- Arguments de lancement : chaque jeu a sa config dans `ServerConfig` (`launchArgs` Palworld, `valheimConfig`, `astroneerConfig`, `dragonwildsConfig`, `enshroudedConfig`, `arkConfig`). IPC `server:getLaunchArgs` / `server:setLaunchArgs` ; la section « Arguments de lancement » de la page Installation n'existe que pour Palworld (les autres passent par leur page Config).
- `exeName` peut être un chemin relatif au dossier du serveur (ARK : `ShooterGame\Binaries\Win64\ArkAscendedServer.exe`) : `ServerManager.start` et `detectGameType` font un `join()`.
- `BACKUP_FILTERS` (`registry.ts`, `getGameBackupFilter`) : fichiers du dossier des mondes à garder dans une sauvegarde (ARK : sans ses `.arkrbf` / `.bak`). Distinct de `worldFilter` (`transferFiles.ts`), qui pour Valheim ne garde que le monde choisi : l'appliquer aux sauvegardes changerait leur contenu.
- RCON : `src/main/utils/sourceRcon.ts` (protocole Source, sans dépendance, toujours `127.0.0.1`), une connexion par appel. Client de jeu : `ark/ArkRconClient.ts`.
- Écriture des INI : `src/main/utils/ini.ts`, `iniText.ts` (`readIniText` / `writeIniText` gardent encodage et fins de ligne, `patchIniSection`, **sensible à la casse**). ARK : `ark/config/iniDocument.ts` (sans casse, clés répétées et indexées), car le jeu ignore la casse. Toujours une copie `.backup` avant d'écrire un fichier de config du jeu.
