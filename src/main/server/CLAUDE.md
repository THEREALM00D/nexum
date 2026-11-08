# Démarrage, arrêt et relance des serveurs

## Point d'entrée unique : `startServer(ctx, id, sendLog)` (`startServer.ts`)

Validations (conflits de ports tous jeux confondus, règles du jeu), `getLaunchSpec` (exe, args, env, fichier de log suivi, `prepare`, `logNoise`), log des mods Valheim. Utilisé par l'IPC `server:start` **et** le démarrage automatique ; `restartServer` (même fichier) par `server:restart`, le menu du tray et le redémarrage planifié. **Ne jamais redupliquer cette logique.**

- **`LaunchSpec.prepare`** (`PREPARE` dans `src/main/games/registry.ts`) : exécuté par `ServerManager.start` avant **chaque** lancement, relance après plantage comprise ; un message renvoyé refuse le démarrage. Les préparations propres à un jeu vont là, pas dans `startServer`.
- **Variables d'environnement** : `env` du `serverConfig.ts` du jeu, lues par `getGameEnv()` et conservées pour la relance. Tout démarrage (manuel, redémarrage, planifié) doit passer `getGameEnv(gameType)` (Valheim en a besoin, voir son CLAUDE.md).
- Écrire dans la session de log depuis l'extérieur : `ServerManager.log()`, **après** `start()` (sinon la nouvelle session l'efface).

## Démarrage automatique (issue #57)

- ⚠️ **Jamais en dev** : `autoStartServers` ne fait rien quand `!app.isPackaged` (sauf `NEXUM_DEV_AUTOSTART=1`) : `yarn dev` partage le dossier de données de l'app installée, donc ses vrais serveurs, qu'il couperait net à la fermeture.
- Par serveur (`Server.autoStart`, case dans `ServerDialog`). Tourne **après** `tryAdoptAll` (promesse `adoption`, `ipc/handlers.ts`) : un serveur adopté n'est pas relancé. Démarrages espacés de 5 s, échec écrit dans les logs du serveur.

## Relance après un plantage (`crashRestart.ts`, `registerCrashRestart`, `Server.autoRestart`)

- `ServerManager` appelle `onCrash` (via `ServerManagerRegistry.onCrash`) quand le serveur s'arrête seul avec une erreur (statut `crashed`, lancé **ou** adopté), **avant** la fermeture de la session : « Relance automatique dans 10 s » et l'abandon vont dans son `.crashed.log` (issue #146).
- Relance par `startServer` 10 s plus tard, sauf serveur supprimé, option décochée ou relancé à la main entre-temps. Au plus 3 relances en 30 min, puis abandon écrit dans les logs et `notifyGaveUp` : événement `server:autoRestartGaveUp` (`AutoRestartGaveUpNotice`) → toast « Voir les logs » (`hooks/useServerNotices`), plus une notification Windows (textes `trayStrings.ts`, clic → `showWindow`, référence gardée sinon le ramasse-miettes perd le `click`) si aucune fenêtre n'est visible et au premier plan.
- Compte rendu (`autoRestarted` / `autoRestartFailed`) écrit **après** `startServer`, dans la nouvelle session.

## Messages de fin (`exitText`, `src/main/i18n/logStrings.ts`)

Code NTSTATUS (≥ `0xC0000000`) affiché en hexadécimal et nommé (`crashNames`) avec « erreur du jeu lui-même, pas de Nexum ». Sauf `0xC000013A` (STATUS_CONTROL_C_EXIT : console fermée ou CTRL+Pause) → `consoleClosed`, pas « planté » (la relance s'applique quand même). Autres codes : « Le serveur s'est arrêté (code N) ».

## Arrêt (`ServerManager.stop`, `getStopConfig` de chaque jeu)

- Trois mécanismes : API (Palworld, `restApiEnabled`), signal console `gracefulSignal: "ctrlBreak"` (Valheim, Enshrouded ; `sendConsoleSignal`, `windowsCtrlC.ts`, `AttachConsole`/`GenerateConsoleCtrlEvent`), sinon `taskkill` (Astroneer, Dragonwilds : `restApiEnabled: false` sans signal). Signal ignoré → `taskkill` après 30 s.
- ⚠️ **CTRL+Pause, pas CTRL+C** : un serveur lancé par Nexum ignore CTRL+C (attribut « ignorer CTRL+C » probablement hérité du parent, `SetConsoleCtrlHandler(NULL, TRUE)`), alors que CTRL+Pause ne peut pas être ignoré ainsi. Valheim : « OnApplicationQuit » → « World save (5/5) done », code 0, ~3 s.
- **Détection de fin** : processus lancé par Nexum → lue sur le `ChildProcess` (`close` / `exitCode`), **jamais** via `si.processes()` (liste en retard ou en échec → « vivant » → `taskkill /F /T` sur un serveur déjà fermé, voire sur un autre programme si le PID est réattribué). `ensureStopped` / `waitForPidExit` / `pidExists` ne servent qu'aux processus **adoptés**.

## Vérifications au démarrage (jamais attendues)

- **Version du jeu** (`gameUpdateCheck.ts`, `checkGameUpdateOnStart`) : après un `start()` réussi (bouton et démarrage auto, pas les redémarrages). Réutilise `SteamCMD.checkForUpdate`. Choix produit : **avertir seulement**. ⚠️ Rien n'est signalé si `requiredBuild` est `null` (Steam injoignable, timeout, SteamCMD absent…) : le repli renvoie `upToDate: false`, ne jamais le lire comme « pas à jour ». Résultat dans la session (`ServerManager.log()`) et, si MàJ, `server:gameUpdateAvailable` (`GameUpdateNotice`) → `hooks/useServerNotices` (bouton « Mettre à jour » → Installation ; `notify()` accepte une `action`, 15 s).
- Install de la **bibliothèque Steam** (`isSteamLibraryInstall`) : `UpdateCheckResult.steamLibrary = true` → « mettez-le à jour depuis Steam », sans bouton.
- **Build installé** (`getInstalledBuildId`, `src/main/steamcmd/`) : manifest du client Steam (`<bibliothèque>/steamapps/appmanifest_<appId>.acf`) et celui de SteamCMD (`<serveur>/steamapps/`) peuvent coexister : on garde le **plus récent** (`LastUpdated`, sinon date du fichier). Préférer toujours celui de la bibliothèque faisait annoncer la mise à jour en boucle après une MàJ faite depuis Nexum.
- **Mods Valheim** : `checkModUpdatesOnStart`, voir `src/main/games/valheim/CLAUDE.md`.
- Ces vérifications contactent Steam / les registres : déclarées dans `docs/code-signing*.md`.

## Carte « Rejoindre le serveur » (`joinInfo.ts`)

IPC `server:getJoinInfo`, `server:getPublicIp` ; composant `components/server/JoinServerCard.tsx`.

- IP locale + port de jeu + ports UDP à rediriger (`getGamePorts`, `forward: true` uniquement, jamais RCON/REST ; `formatPortRange` → `2456-2458` ou `7777, 8888`), code crossplay Valheim lu dans les logs (`join code X`), nom à chercher dans le jeu (`JoinInfo.searchName`, `SEARCH_NAMES` dans `src/main/games/registry.ts`).
- **IP publique uniquement au clic** (`api.ipify.org`, cache 10 min, déclaré dans `docs/code-signing*.md`) : jamais automatiquement.
- `localIpv4()` classe les cartes réseau au lieu d'exclure par nom : ⚠️ un commutateur Hyper-V **externe** « vEthernet (…) » porte la vraie IP du PC ; seuls « Default Switch », WSL, VirtualBox, VMware, VPN… sont pénalisés. Préférence 192.168.x.x > 10.x > 172.16-31.
