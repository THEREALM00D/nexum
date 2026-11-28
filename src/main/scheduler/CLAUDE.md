# Planification

Tout est démarré par `startSchedulers` (`startSchedulers.ts`, appelé par `registerIpcHandlers` une fois `ctx` construit) : redémarrage planifié, et quatre `IntervalScheduler` (sauvegarde auto : voir `src/main/backup/CLAUDE.md` ; vérification des mises à jour ; créatures sauvages d'ARK ; profils des joueurs d'ARK : voir `src/main/games/ark/CLAUDE.md`). Chaque tick (30 s) relit la config : rien à réarmer après un enregistrement.

## Config (`RestartConfig`, `src/shared/types.ts`)

- Calculs d'heures dans `src/shared/restartSchedule.ts`, partagé avec le renderer (« Prochain redémarrage », Dashboard) : `restartTimesOfDay`, `nextRestartAt`, `warningsUpTo`, `DEFAULT_RESTART` (seule copie des défauts).
- Mode `times` (heures + `weekdays`, 0 = dimanche comme `Date.getDay`) ou `interval` (départ + k × X heures **dans la journée**, tous les jours : 5 h depuis 04:00 → 04, 09, 14, 19, et rien à minuit).
- ⚠️ Jusqu'à la 0.25, `time` + `warningMinutes` : `withRestartDefaults` (`src/main/servers/restartDefaults.ts`) les convertit **à la lecture et à l'écriture** (`update` y passe le patch : une archive de serveur ou un export de réglages d'une ancienne version arrive dans l'ancienne forme) et ramène chaque valeur dans ses bornes (type faux → valeur de `base`). Ancien message français par défaut (`LEGACY_RESTART_MESSAGE`) relu comme vide. ⚠️ Avant, `time` était l'heure de la **1re annonce** (arrêt à `time + warningMinutes`) : l'heure est reprise telle quelle (choix produit), l'arrêt avance donc de `warningMinutes`. Les imports passent aussi par là (`parseServerEntry`, `src/main/transfer/CLAUDE.md`).

## Redémarrage planifié (`RestartScheduler`, `restartCountdown.ts`, `scheduledRestart.ts`)

- ⚠️ **L'heure planifiée est celle de l'arrêt**, pas celle de la 1re annonce : le planificateur déclenche quand `nextRestartAt - maintenant ≤ plus grande annonce + 30 s` (une fois par arrêt, `lastStopAt`). Une heure juste après minuit fait commencer les annonces la veille.
- `runCountdown` : annonces par le client de `createGracefulShutdown` (`src/main/server/shutdownClient.ts`), paliers déjà passés sautés (serveur démarré en cours de route, 30 s de tolérance). Le **dernier palier** part par `manager.stop` avec `shutdownWaittime` = ce délai : annonce, sauvegarde, attente ARK / `/shutdown` Palworld, comme avant ; `ServerManager` ne connaît pas les paliers. Sans client (Valheim, Astroneer, Dragonwilds, Enshrouded, Palworld sans REST, ARK sans RCON) : aucune annonce, arrêt à l'heure par `getStopConfig` (signal ou `taskkill`, voir `src/main/server/CLAUDE.md`).
- Annulé (ligne `restartCancelled`, vérifiée toutes les 5 s) si le serveur n'est plus `running`, si son PID a changé (arrêt ou relance à la main) ou si `stillWanted()` est faux (planifié : l'heure n'est plus un arrêt prévu ; MàJ : option décochée). Serveur arrêté à la main : la ligne n'a plus de session, elle est perdue (normal).
- **Un seul compte à rebours par serveur** (`withRestartLock`, verrou partagé avec les actions groupées : `src/main/servers/bulk/CLAUDE.md`) : un redémarrage planifié et une mise à jour trouvée ne se chevauchent pas, le second est ignoré. Accepté : un arrêt annulé (ou ignoré) n'est pas redéclenché (`lastStopAt`), le suivant l'est.
- Statut et PID revérifiés après `findPendingUpdate` (jusqu'à 30 s) : sinon un serveur arrêté à la main entre-temps était **démarré** par `restartServer` (`mgr.restart` saute l'arrêt sans PID).
- Ensuite `runScheduledRestart` : `restartServer` (`src/main/server/startServer.ts`, même chemin que le bouton Redémarrer), ou le chemin mise à jour ci-dessous.
- **Message** : personnalisé avec `{minutes}` remplacé partout, sinon `lt().restartAnnounce(n)` / `updateAnnounce(n)` (singulier pour 1) dans la langue de Nexum **au moment de l'envoi**. Placeholder du renderer : `schedule.messageDefault`.
- Palworld : **requiert l'API REST** (sinon `taskkill` sans save). ARK : RCON `ServerChat` (`Broadcast` n'affiche rien), accents retirés.

## Mises à jour du jeu

- `findPendingUpdate` / `updateStoppedServer` sont dans `src/main/server/serverUpdate.ts` (partagés avec les actions groupées).
- **Au redémarrage** (`updateGame`, dépend de `enabled`) : `findPendingUpdate` au dernier moment (après les annonces, jusqu'à 30 s de SteamCMD) ; MàJ → `stop` → `backupBeforeUpdate` → `steamcmd.installGame` → `startServer`. Simple redémarrage pour une install de la bibliothèque Steam, sans SteamCMD, ou si `requiredBuild` est null (jamais lu comme « pas à jour »). Échec de la sauvegarde ou de SteamCMD → démarrage sur la version installée. Compte rendu écrit **après** `startServer` (pas de session serveur arrêté).
- **Pendant que le serveur tourne** (`checkUpdates`, indépendant de `enabled`, `updateWatch.ts`) : toutes les `checkUpdatesHours` depuis le démarrage, **silencieux** si à jour ou non vérifiable (sinon une ligne par vérification). MàJ → ligne `updateFoundWhileRunning`, puis `runScheduledRestart` avec la MàJ déjà trouvée, arrêt dans `updateWarningMinutes` et `warningsUpTo(warnings, n)`. Non attendu par la file : elle ne doit pas rester bloquée pendant le compte à rebours d'un serveur. ⚠️ Installation ratée (sauvegarde, SteamCMD) → build gardé dans `failedBuilds`, plus de nouvel essai automatique pour lui (ligne `updateRetryPaused`) : sinon chaque vérification relançait annonces, arrêt et redémarrage sur l'ancienne version.
- Pas de toast `server:gameUpdateAvailable` ici : son bouton envoie vers Installation alors que Nexum s'en charge.

## Créatures sauvages d'ARK (`src/main/games/ark/wildDinos.ts`)

- `DestroyWildDinos` par RCON. Après chaque démarrage : `runAfterStartTask` (`src/main/games/afterStart.ts`, `Record<GameType, …>`), appelé par `startServer` **et** `restartServer` (qui ne passe pas par `startServer`). RCON ne répond qu'une fois le monde chargé (1 à 2 min) : nouvel essai toutes les 20 s, 15 min max, abandon si le PID change. À intervalle : `IntervalScheduler` filtré sur `gameType === "ark"`.

## UI

`components/schedule/RestartSchedulePage` pour tous les jeux : quatre cartes (`RestartTimesSection`, `WarningsSection`, `GameUpdatesSection`, plus `extraSections` du jeu : ARK y met `WildDinosSection`), un seul Enregistrer. `infoKey` et `notice` (Palworld et ARK : `RemoteAdminNotice`). La carte des annonces est active si le redémarrage **ou** la vérification des MàJ l'est. Heures fixes activées sans heure ou sans jour : enregistrement refusé (`isScheduleInvalid`).
