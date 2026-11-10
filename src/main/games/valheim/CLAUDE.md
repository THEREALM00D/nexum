# Valheim

Jeu le plus testé : **modèle principal** pour un nouveau jeu. Mods côté UI : `src/renderer/src/games/valheim/pages/Mods/CLAUDE.md`.

## Lancement (`serverConfig.ts`, `valheimConfig: ValheimLaunchConfig`)

- Config passée en **arguments CLI** (rien à relire sur disque). Nexum lance avec **sa** config (page Config), pas avec le `.bat` de l'utilisateur : un serveur importé peut avoir un nom/monde/mot de passe différents.
- **`SteamAppId=892970`** dans `env`, comme `start_headless_server.bat` : sans elle ni `steam_appid.txt` (absent de certaines installs de la bibliothèque Steam), le serveur s'arrête quelques secondes après le démarrage.
- Validations dans `startServer` : mot de passe < 5 caractères, mot de passe contenu dans le nom du serveur → démarrage bloqué avec un message (Valheim quitterait en silence).
- `logFile` rempli → Valheim n'écrit plus sur stdout : avertissement orange sur le champ.
- Arrêt : CTRL+Pause (`gracefulSignal: "ctrlBreak"`, voir `src/main/server/CLAUDE.md`).

## Mondes

- Sauvegardes hors `serverPath` : `%LOCALAPPDATA_LOW%/IronGate/Valheim/worlds_local` ou `savedir` custom.
- Le nom du monde doit correspondre exactement. `valheim:listExistingWorlds` scanne `worlds_local` (ancien format `<nom>.fwl` à plat **et** dossier `<nom>/`, sans `*_backup*` ni `.old`). Un seul monde à la création d'un serveur → pré-rempli (`importValheimWorld`, `pages/Servers/utils/`) ; sinon `Autocomplete` freeSolo (`useExistingWorlds`).

## Odin-Eye (suivi des joueurs, `OdinEyeApiClient.ts`)

- Plugin BepInEx tiers ([doc](https://sparcopt.github.io/odin-eye/)). ⚠️ La doc (`GET /v1/players` → `{ entries }`) ne correspond pas au plugin v1.0.0.0, qui expose `GET /players` (tableau) et répond **200 au corps vide** sur tout chemin inconnu (un 200 ne prouve rien) : le client essaie les deux et échoue si aucun ne renvoie du JSON. `steamId`→`userId`, `id`→`playerId`, pas d'IP.
- `odinEyeUrl` dans `ValheimLaunchConfig` (section Réseau de la page Config), vide = désactivé. `parseOdinEyeUrl` ajoute `http://` s'il manque. ⚠️ Pas d'authentification : ne jamais exposer ce port.
- Installation manuelle par l'utilisateur : BepInEx, `.dll` dans `Valheim/BepInEx/plugins/`, 1er démarrage, `HttpServerAddress` (port ≠ 2456/2457) dans `org.bepinex.plugins.odineye.cfg`, redémarrage.
- Erreurs : `AppError` `ODIN_EYE_NO_URL` / `INVALID_URL` / `UNREACHABLE` / `TIMEOUT` / `HTTP` / `NO_ENDPOINT`. IPC `valheim:testOdinEye(url?)` → nombre de joueurs. UI : `OdinEyeTestButton` (teste le champ même non enregistré), `OdinEyeStatusAlert` (désactivé / attente `waiting` / connecté / injoignable + raison). `/v1/serverInfo` ne donne que `maxNumberOfPlayers` / `gameVersion` / `steamAppId`.
- Le plugin ne démarre qu'après le chargement du monde : pendant 3 min (`BOOT_GRACE_MS`) et jusqu'au 1er succès, un échec affiche « En attente » ; pas de délai accordé à un serveur lancé depuis plus longtemps (`stats.serverUptime`).
- ⚠️ `localhost` se résout en `::1` d'abord ; le Node d'Electron retombe sur IPv4, pas le Node 22 du système : tester sous `ELECTRON_RUN_AS_NODE=1 electron.exe`, pas `node`.
- Carte « Joueurs connectés » du Dashboard (`ServerStats`). `useValheimPlayerCount` : Odin-Eye s'il répond (`useOdinEyeStatus`, toutes les 10 s), sinon regex `now N player(s)` sur les logs, ⚠️ lignes PlayFab qui **n'existent qu'avec `-crossplay`** (sinon « — »). Code de connexion et IP volontairement non affichés (seulement dans les logs crossplay).

## Mods : registres (`ModRegistryClient.ts`, `registries.ts`)

- **Thunderstore** et **Hexium** : Hexium expose une API **volontairement compatible** (mêmes endpoints `/c/{communauté}/api/v1/package/` et `/api/experimental/package/{namespace}/{name}/`, même schéma, communauté `"valheim"`), vérifié dans son OpenAPI live (`hexium.gg/api/openapi.json`). `ModRegistry = "thunderstore" | "hexium"` (`shared/types.ts`).
- Liste v1 de la communauté, cache 5 min **par registre**. ⚠️ Ce endpoint **n'a pas de champ `namespace`** (sur les deux registres) : toujours matcher avec `p.owner`, jamais `p.namespace` (`undefined` → `.find()` échoue en silence).
- `REGISTRY_API_BASE` / `REGISTRY_LABEL` / `modPageUrl()` dans `registries.ts`. ⚠️ Pages publiques différentes : `https://thunderstore.io/c/valheim/p/{owner}/{name}/` et `https://valheim.hexium.gg/mods/{owner}/{name}`. Helper dupliqué volontairement côté renderer (`pages/Mods/utils/modPageUrl.ts`). `USER_AGENT` = `Nexum/<version>`.
- **CSP** (`src/main/index.ts`, appliquée **uniquement en build packagé**) : `img-src` autorise `https://*.thunderstore.io https://*.hexium.gg` (Thunderstore a déjà changé de CDN sans prévenir). Nouveau registre = ajouter son domaine.
- **Pagination** (vérifié 2026-10-18) : rien d'utilisable. La liste v1 renvoie tout d'un bloc (Nexum découpe localement : 20 par onglet, 50 en recherche) ; `/api/experimental/package/?cursor` mélange toutes les communautés ; `/api/experimental/frontend/…?page` est bloqué (403) sur Thunderstore, `q`/`ordering` ignorés sur Hexium. Paginer côté main sur le cache.
- **Fraîcheur** : la liste v1 de Thunderstore est regénérée ~toutes les heures (Hexium à jour), alors que les joueurs ont déjà la nouvelle version → « version mismatch » Jötunn/ServerSync. `getFreshLatest` lit `/api/experimental/package/{ns}/{name}/` (à jour en minutes) pour le registre d'origine (`mapLimit`, 6 en parallèle, `src/main/utils/mapLimit.ts`). Parcourir reste sur la liste (retard accepté).

## Mods : installation et mises à jour (`ValheimModsManager.ts`)

- ⚠️ `installBepInEx` remplace chaque dossier du pack, donc tout `BepInEx/` : `BepInEx/config` (réglages des mods, ceux d'un serveur importé compris) est mis de côté puis remis, même en cas d'échec.
- Dossier `BepInEx/plugins/<namespace>_<nomSafe>/`, métadonnées dans `{dataDir}/mods.json`. Mods installés à la main détectés par scan, `source: "manual"` (pas de MàJ possible, pas de code).
- `thunderstoreCode` (nom historique, persisté, vaut pour les deux registres) : son segment « auteur » est `owner`. Registre d'origine : `source`.
- `installMod(registry, code, onProgress)` : `download_url` de l'API pour la **version demandée** (repli sur `getFreshLatest`, puis URL de convention `{base}/package/download/{ns}/{name}/{version}/`). ⚠️ Ne jamais retomber sur `versions[0]` : l'ancienne version était enregistrée sous le nouveau numéro.
- **Dépendances** (`getMissingDeps`) et **mises à jour** (`checkUpdates({code, registry}[])`) : registre d'origine d'abord, puis les autres (`getPackageAnyRegistry`), pour les mods gelés sur un registre et maintenus sur l'autre. `ModUpdate.sourceChanged` signale un changement de registre (chip + tooltip avant d'installer). Seulement des versions **strictement plus récentes** (`compareVersions`, `versionCompare.ts`), comparées à `pkg.versions[0].version_number` (trié du plus récent au plus ancien).
- **Dépréciés** (`is_deprecated`) : gardés dans le cache ; exclus des tendances/récents (`active()`), gardés en recherche, après les mods maintenus **à pertinence égale**. `checkUpdates` → `ModUpdateCheck = { updates, deprecatedCodes }` ; un package déprécié ne propose jamais de MàJ ; `getPackageAnyRegistry` préfère une version maintenue ailleurs.
- Dates : `updated_timestamp` = `date_updated` du package (liste v1) ; `publishedAt` d'un mod installé = `date_created` de sa version, lue à l'install.
- **Recherche** (`search` + `searchRank`) : nom identique (0), commence par (1), contient (2), auteur / `full_name` (3), description (4), tous les mots présents (5) ; puis non déprécié, puis `rating_score`. Noms comparés sans espaces/tirets/soulignés.
- **Vérification au démarrage** (`modUpdateCheck.ts`, `checkModUpdatesOnStart`) : lancée par `startServer`, non attendue, sur les mods **actifs** avec registre ; résultat dans la session de log et `valheim:modUpdatesAvailable` (`ModUpdateNotice`) → `hooks/useServerNotices`.

## Mods : partage et import de profils

- **Partage** (`modpackExport.ts`) : `export.r2x` (même YAML que `extractModRefsFromR2x`) avec les mods **actifs** qui ont un code (+ `denikson-BepInExPack_Valheim` en dernière version, installé à part), zippé, envoyé à `POST https://thunderstore.io/api/experimental/legacyprofile/create/` (corps `#r2modman\n` + base64(zip), `application/octet-stream`) → `{ key }` à coller dans Gale / r2modman. Toujours Thunderstore (service interrogé par défaut par ces gestionnaires). Mods manuels ignorés (`skippedManual`), avertissement si mods Hexium (r2modman ne sait pas les installer). Envoi vers un tiers : déclaré dans `docs/code-signing*.md`.
- **Import** (`parseThunderstoreProfile`) : code opaque (pas forcément un UUID), résolu par `GET {base}/api/experimental/legacyprofile/get/<code>/` (⚠️ `/get/` obligatoire, absent de l'OpenAPI) en essayant chaque registre (`resolveProfileCodeViaApi`, `REGISTRIES`). Réponse en **texte brut** `#r2modman\n` + base64(zip) ; `export.r2x` extrait avec `extract-zip` puis parsé par regex (pas de dépendance YAML). Le r2x ne dit pas d'où vient un mod : `installCodes` (`installCodes.ts`) essaie chaque registre (le registre connu d'abord quand il y en a un).
- **Serveur importé d'un autre PC** (`pendingMods.ts`, `src/main/transfer/CLAUDE.md`) : `{userData}/servers/<id>/pending-mods.json` (code, registre, actif), réinstallés par `valheim:mods:installPending` (BepInEx si absent, mods désactivés remis désactivés, échecs gardés). Mods manuels jamais exportés (pas de code).
