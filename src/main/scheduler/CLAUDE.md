# Planification

Sauvegarde auto (`BackupScheduler`) : voir `src/main/backup/CLAUDE.md`.

## Redémarrage planifié (`RestartScheduler`, `scheduledRestart.ts`)

- Une heure quotidienne `HH:MM` (pas de multi-horaires), **par serveur** : `RestartScheduler` reçoit `{ serverId, config }` de tous les serveurs (`lastRunKeys` par serveur), vérification toutes les 30 s. Instancié dans `registerIpcHandlers`.
- `runScheduledRestart` : config d'arrêt avec annonce + délai (`warningMinutes`), puis `restartServer` (`src/main/server/startServer.ts`), même chemin que le bouton Redémarrer.
- Palworld : annonce (`/v1/api/announce`) → attente → save → shutdown API. **Requiert l'API REST** (sinon `taskkill` sans save). Autres jeux : leur `getStopConfig` (signal ou `taskkill`), voir `src/main/server/CLAUDE.md`.
- **Mise à jour du jeu** (`RestartConfig.updateGame`, défaut false) : `checkForUpdate` d'abord ; MàJ disponible → `stop` → `backupBeforeUpdate` → `steamcmd.installGame` → `startServer`. Simple redémarrage pour une install de la bibliothèque Steam, sans SteamCMD, ou si `requiredBuild` est null (jamais lu comme « pas à jour »). Échec de la sauvegarde ou de SteamCMD → démarrage sur la version installée. Compte rendu écrit **après** `startServer` (pas de session serveur arrêté).
- **Message d'annonce** (`RestartConfig.message`) : vide = `restartAnnounceDefault` (`src/main/i18n/logStrings.ts`) dans la langue de Nexum **au moment de l'envoi** (`stopConfigForRestart`), affiché en placeholder (`schedule.messageDefault`). `ServerConfigStore.get` relit l'ancienne phrase française enregistrée par défaut (`LEGACY_RESTART_MESSAGE`) comme vide ; un message personnalisé reste tel quel.
- UI : `components/schedule/RestartSchedulePage` pour tous les jeux (`infoKey`, `notice` : Palworld y met l'avertissement « Activer l'API REST »).
