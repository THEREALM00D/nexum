# Logs des serveurs (main + page Logs)

Page partagée : `src/renderer/src/components/server/Logs.tsx` (les `games/<jeu>/pages/Logs/Logs.tsx` ne font que la réexporter), textes dans `components/server/__i18n__/`, importés par chaque manifest.

## Sessions persistantes (`SessionLogStore.ts`)

- Un fichier par session dans `{userData}/servers/<id>/logs/YYYY-MM-DD_HH-mm-ss.log`, écrit par le **main** (fenêtre fermée ou démarrage avec Windows inclus). `ServerManager` reçoit un `SessionLogSink` : `begin()` à chaque `start()` et à l'adoption, `end(crashed)` à la fin (`crashed` = arrêt non demandé avec code ≠ 0 → `.crashed.log`).
- Toute ligne passe par le logger enveloppé (`ServerManager.beginSession`) ; de l'extérieur : `ServerManager.log()`. Lignes horodatées `[HH:mm:ss]`, écritures groupées toutes les 500 ms (`flushAll()` sur `will-quit`), 20 sessions gardées.
- 20 Mo max par fichier : la session **continue dans un nouveau fichier** (`continueInNewFile`, sans `server:logSession` pour ne pas vider la vue, une ligne `[Manager]` dans chaque fichier renvoie vers l'autre). Un Dragonwilds actif atteint 20 Mo en ~11 h : arrêter d'écrire perdait la fin de session, la plus utile.
- Hors session (serveur arrêté), `SessionLogStore.line` est ignorée : un compte rendu se fait **après** `startServer`, dans la nouvelle session.
- Fichiers **bruts** (IP, SteamID) : le masquage ne se fait qu'à l'export. `begin()` émet `server:logSession` → le renderer vide la vue de ce serveur (`CLEAR_LOGS`).
- IPC `logs:listSessions` / `logs:readSession(name, id, forDisplay = true)` (nom validé contre la traversée de chemin) / `logs:openDir` / `logs:saveToFile`. `loadFullLog` relit la liste à chaque export (le fichier « en cours » change).
- Processus adopté : seules les lignes `[Manager]`, dit dans la session.

## Fichier de log du jeu au lieu de stdout (`LogFileTailer.ts`, `LaunchSpec.logFile`)

Pour les jeux dont stdout est incomplet (Dragonwilds : ~10 % du log). `ServerManager` vide stdout sans l'afficher et suit le fichier (toutes les secondes, horodatage Unreal `[2026.10.18-00.36.00:140][  0]` retiré, dernière lecture avant « Server exited »). Au démarrage comme à l'adoption, le contenu déjà présent est ignoré. ⚠️ Nouvelle session détectée par **la 1re ligne** (« Log file open, <date> »), une taille qui diminue ou un identifiant de fichier qui change, pas par l'identifiant seul : Dragonwilds copie l'ancien log en `RSDragonwilds-backup-<date>.log` puis vide et réutilise **le même** fichier. Bonus : un serveur adopté retrouve ses logs.

## Lignes techniques masquées (`logNoise.ts`, `LOG_NOISE` de `src/main/games/registry.ts`)

- Règles par jeu (aujourd'hui Enshrouded seul) : lignes isolées (`lines`) et blocs (`blocks` : `start` puis `end` inclus ou `body` tant que ça correspond, `maxLines` en garde-fou). Filtre à état, un par session (`createNoiseFilter`). Horodatage `[HH:mm:ss]` et `\r` final ignorés.
- Le fichier reçoit **tout** ; seul l'envoi au renderer est filtré, **dans le main** (sinon un bloc répété remplit le tampon). `logs:readSession` applique le même filtre ; l'export lit le fichier brut.
- `benignStderr` : messages stderr connus qui ne sont pas des erreurs (Steam d'un serveur dédié) → écrits **sans** `[ERR]`, fichier compris.
- `Arguments :` n'est écrit que s'il y a des arguments ; `redactArgs` → `-password [hidden]`.

## Affichage (renderer)

- Tampon : toute la session par serveur (`ADD_LOGS` dans `ServerContext`), garde-fou `MAX_LIVE_LINES` (100 000, sorties par paquets de 10 000). Lignes regroupées toutes les 100 ms (`LOG_FLUSH_MS`) : une copie du tableau par ligne serait quadratique. Les lignes en attente passent avant le `CLEAR_LOGS` d'une nouvelle session. Les consommateurs qui parcourent `state.logs` (`JoinServerCard`, `useValheimPlayerCount`) le font depuis la fin.
- Liste virtualisée `LogLines` (`react-virtuoso`) : `followOutput` seulement en bas (`atBottomThreshold` 24 px), `initialTopMostItemIndex` ouvre en bas, `Logs` remonte `LogLines` (`key` = session) à chaque changement de session. « Nouvelles lignes — revenir au direct » = `scrollToIndex("LAST")`.
- Dashboard : aperçu seul (`LatestLogsCard`, 5 dernières lignes, couleurs de `logLineColor`). La lecture complète, l'export et les sessions restent sur la page Logs.
- Sessions passées : `LogSessionPicker` (⚠ = plantée), `hooks/useLogSessions` (session vidée avant chaque lecture pour s'ouvrir en bas).
- Hors page Logs : `hooks/useStickToBottom.ts` (agit sur `scrollTop` du conteneur). ⚠️ Jamais `scrollIntoView` : il fait défiler **tous les parents**. La zone de log doit avoir une **hauteur contrainte** (wrapper `height: 100%` d'`App.tsx`).

## Export pour les rapports de bug (`LogExportButtons.tsx`, `redactLog.ts`)

- **Copier** et **Enregistrer en .txt** (`dialog.showSaveDialog`, Documents par défaut, puis « Afficher dans le dossier » via `shell:showItemInFolder`). Toujours **tout** le fichier, jamais les N dernières lignes : la cause d'un arrêt est au début. 1re ligne `Nexum <version> · <jeu> · <date ISO>`.
- Masquage : IPv4 publiques → `[IP]` (port gardé ; boucle locale, `0.0.0.0` et plages privées conservées), SteamID64 (`7656119` + 10 chiffres) → `[SteamID]`, `Server SteamId: <n>` (Enshrouded), `join code X` → `join code [hidden]`. Dragonwilds : mot de passe du monde (`Dedicated Server WorldPassword: x`, `Password[x]`), paramètre `?p=…` (base64, dans `Login request` **et** `Join request` : motif `?p=` sans préfixe), `["PasswordHash"]`, `["JoinCode"]` → `[hidden]` ; identifiants hexadécimaux de 32 caractères (EOS ID, GUID) → `[ID]`.
- Marqueurs entre crochets, jamais `***` (Discord le lit comme du gras et casse les blocs de code). Noms de joueurs non masqués ; une version en 4 parties (`1.0.0.0`) est masquée comme une IP (faux positif accepté). L'affichage à l'écran n'est pas modifié.
- Tout nouveau secret écrit par un jeu dans son log → motif dans `redactLog.ts`.
