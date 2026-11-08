# Jeux : registre côté main

Ajouter un jeu : skill **`/new-game`** (procédure complète, tester un vrai serveur d'abord). Chaque jeu a son `CLAUDE.md` dans son dossier (faits vérifiés sur une vraie install).

- `registry.ts` : `Record<GameType, …>` qui dispatchent vers les `serverConfig.ts` de chaque jeu : `getLaunchSpec` (exe, args, `env`, `logFile`, `prepare` via `PREPARE`, `logNoise` via `LOG_NOISE`), `getGamePorts`, `getGameSavePath`, `getGameStopConfig`, `getGameEnv`, `getGameSearchName` (`SEARCH_NAMES`), `GAME_TYPES`.
- `<jeu>/serverConfig.ts` : `exeName`, `buildArgs`, `getSavePath`, `getStopConfig`, `getPorts`, `env?`, `getLogFilePath?`. Lu aussi par `detectGameType.ts` (import d'un dossier existant).
- `ports.ts` : `GamePort` (`forward: true` = à rediriger sur la box, affiché dans la carte Rejoindre ; jamais RCON/REST) + `formatPortRange`.
- `saveRequests.ts` : `SAVE_REQUESTS`, sauvegarde à chaud avant un backup (voir `src/main/backup/CLAUDE.md`).
- Autres `Record<GameType, …>` hors de ce dossier : `STEAM_APP_IDS` (`src/main/steamcmd/SteamCMD.ts`, exporté), `PROCESS_NAME_PREFIXES` (`src/main/servers/ServerManagerRegistry.ts`), `DEFAULT_INSTALL_PATHS` (`useInstall.ts`, renderer). `yarn typecheck` les liste tous quand `GameType` change.
- Installation / mise à jour SteamCMD : un seul IPC pour tous les jeux, `steamcmd:installGame(gameType, path)` / `steamcmd:updateGame()` (serveur actif) → `STEAM_APP_IDS[gameType]`. Renderer : `services/steamService.ts`. Jamais un canal par jeu.
- Arguments de lancement : chaque jeu a sa config dans `ServerConfig` (`launchArgs` Palworld, `valheimConfig`, `astroneerConfig`, `dragonwildsConfig`, `enshroudedConfig`). IPC `server:getLaunchArgs` / `server:setLaunchArgs` ; la section « Arguments de lancement » de la page Installation n'existe que pour Palworld (les autres passent par leur page Config).
- Écriture des INI : `src/main/utils/ini.ts`, `iniText.ts` (`readIniText` / `writeIniText` gardent encodage et fins de ligne, `patchIniSection`). Toujours une copie `.backup` avant d'écrire un fichier de config du jeu.
