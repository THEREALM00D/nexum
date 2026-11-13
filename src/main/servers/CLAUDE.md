# Serveurs : registre, adoption, conflits de ports, import

## Serveur actif (`ServerRegistry`)

Beaucoup d'IPC prennent un `serverId?` et retombent sur `ctx.getActiveServer()`. Le serveur actif est gardé **en mémoire** (lu au démarrage, persisté à chaque changement) : ⚠️ electron-store relit `config.json` à chaque `get`, et une 2e instance sur le même dossier de données changeait la cible de nos handlers (Arrêter visait un autre serveur, issue #144). Les actions sur un serveur (`useServerControls`) passent en plus **explicitement** le `serverId` affiché. Arrêt refusé (`SERVER_NOT_RUNNING`) → ligne `[Manager]` `stopRefused` avec statut et PID connus.

## Couleur d'un serveur

Palette dans `src/shared/serverColors.ts` (le main s'en sert pour la couleur par défaut et la migration). `migrateColors()` remplace au démarrage toute couleur enregistrée hors palette par la plus proche, sans prévenir ; `null` est conservé. ⚠️ Toute couleur retirée de `SERVER_COLORS` sera donc réécrite chez les utilisateurs.

## Adoption d'un processus existant

- ⚠️ **Pas d'adoption en dev sur le dossier partagé** : sans `NEXUM_USER_DATA_DIR`, `yarn dev` partage le dossier de données de l'app installée et adoptait ses vrais serveurs (deux Nexum sur le même processus, issue #144). `tryAdoptAll` est sauté sauf `NEXUM_DEV_ADOPT=1`. Avec `NEXUM_USER_DATA_DIR`, l'adoption reste active.
- `ServerManagerRegistry.tryAdoptAll()` : un seul `si.processes()`, puis `findServerProcess` (`processMatch.ts`) par serveur : nom commençant par `PROCESS_NAME_PREFIXES` (préfixe du **serveur**, pas du client du jeu : `palserver`, `valheim_server`, `astroserver`, `rsdragonwildsserver`, `enshrouded_server`) **et** exécutable dans le dossier du serveur (séparateur final compris : `E:\RSDW` ≠ `E:\RSDW2`), processus racine préféré (lanceur plutôt que `…-Shipping.exe`). Chemin illisible (processus admin) : accepté seulement s'il n'y a qu'un serveur de ce jeu. Puis `ServerManager.adopt(pid, onLog, logFile?)`. Ne jamais revenir à une recherche par nom seul (adoptait le client du jeu ou le serveur d'un autre dossier).
- Statut `running`, stop/restart via l'API (Palworld) ou signal / `taskkill`. **stdout/stderr non récupérables** (le pipe appartenait à l'ancien parent), sauf pour les jeux dont Nexum suit le fichier de log (Dragonwilds).
- ⚠️ Un serveur à **processus unique** lancé par Nexum (Valheim, Enshrouded vérifiés) **meurt avec Nexum**, sans sauvegarde : libuv place les enfants de `spawn` dans un job Windows fermé avec le parent (les processus qu'_ils_ lancent en sortent : le `…-Shipping.exe` de Dragonwilds survit et est adopté au lancement suivant). L'adoption ne concerne donc que les serveurs lancés hors de Nexum ou par une ancienne version. D'où la garde de fermeture (`src/main/tray/CLAUDE.md`).
- Un serveur lancé par une ancienne version **admin** puis adopté par une version sans droits ne peut pas être tué par `taskkill` (accès refusé) : le relancer une fois.
- Démarrage automatique après l'adoption : voir `src/main/server/CLAUDE.md`.

## Conflits de ports (`portConflicts.ts`)

Ports de chaque jeu via `getGamePorts` (`getPorts()` de chaque `serverConfig.ts`, type `GamePort` de `src/main/games/ports.ts`). Conflit = même numéro **et** même protocole qu'un serveur lancé, **tous jeux confondus** (le beacon 8888 de Dragonwilds contre le 8888 d'un autre serveur compte). Message `GAME 7777/UDP (déjà utilisé par « X »)`.

## Import d'un serveur déjà installé

Pas de flow dédié : `ServerDialog` accepte un dossier existant. `servers:detectGameType` devine le jeu d'après l'exe à la racine (`detectGameType.ts`, qui lit `exeName` de chaque `serverConfig.ts`), `useExeDetection` + `ExeStatusHint` confirment en direct (`servers:hasExpectedExe`). Palworld/Astroneer/Dragonwilds/Enshrouded : config relue depuis leurs fichiers sous `serverPath`. Valheim : voir `src/main/games/valheim/CLAUDE.md` (nom du monde).

## Config persistée (`ServerConfigStore.ts`)

Valeurs par défaut de chaque jeu + fusion dans `get` / `update` / `migrateLegacy`. Une valeur par défaut qui change doit rester compatible avec les configs déjà enregistrées (ex. `LEGACY_RESTART_MESSAGE`, `src/main/scheduler/CLAUDE.md`).

⚠️ `update()` réécrit **toute** la config du serveur : une valeur par défaut fusionnée par `get()` finit enregistrée au premier réglage changé, même sans rapport. Un défaut qui doit suivre la langue est donc stocké vide et résolu à la lecture. Nom Valheim : `""` en stockage, `lt().valheimDefaultServerName` à la lecture ; `storedValheimConfig` remet `""` pour tout nom par défaut (FR, EN ou l'ancien `LEGACY_VALHEIM_NAME`), sinon il se figerait dans la langue du moment.
