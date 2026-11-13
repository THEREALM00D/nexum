# Sauvegardes

- **Point d'entrée unique** : `backupServer(ctx, serverId, { beforeUpdate?, log? })` (`serverBackup.ts`) : dossier des mondes (`getGameSavePath`, `src/main/games/registry.ts`, toujours un chemin) + rotation + ligne `[Manager]` « Sauvegarde créée ». Utilisé par le bouton, la sauvegarde auto et celle d'avant mise à jour. **Ne pas appeler `BackupManager.create` directement.**
- Format : ZIP niveau 9, `backup-YYYY-MM-DD_HH-MM-SS.zip` (`…-before-update.zip` avant une mise à jour). `archiver` est ESM pur : `await import()` dans `BackupManager.create()`.
- Dossier cible configurable : `ctx.getBackupDir(serverId?)` (défaut `{userData}/servers/<id>/backups`, `{userData}/backups` sans serveur actif). `backupDir` vide = défaut. ⚠️ `backup:getConfig` renvoie le dossier **effectif** et la page renvoie toute la config à chaque changement : `backup:setConfig` remet à vide un dossier égal au défaut (`isDefaultBackupDir`, `defaultBackupDir.ts`, sans casse), sinon changer la rotation figeait le défaut en chemin absolu. `clearSavedDefaultBackupDirs` nettoie au démarrage les configs déjà touchées.
- Rotation : N dernières (0 = infini), **comptées séparément** pour les sauvegardes normales et d'avant mise à jour (`BackupEntry.beforeUpdate`, d'après le suffixe) : une série de sauvegardes auto ne doit pas effacer la copie d'avant un patch.

## Serveur lancé (`backupRunningServer`, issue #194)

1. Sauvegarde demandée au jeu si `getGameSaveRequest` (`src/main/games/saveRequests.ts`, `Record<GameType, …>` : tout jeu doit dire s'il sait sauvegarder sur commande) renvoie `run` : Palworld `POST /v1/api/save` si l'API REST est activée (`restApiDisabled` sinon), `noCommand` pour les autres.
2. `waitForStableSave` (`saveFiles.ts`) : aucun fichier modifié depuis 5 s (30 s max) et, après une demande, au moins un fichier écrit depuis la demande.
3. ZIP, refait **une** fois si `newestMtime` a bougé pendant la création.

Sans sauvegarde forcée : ligne « contient la dernière sauvegarde écrite par le jeu (HH:mm:ss) » (+ conseil d'activer l'API REST pour Palworld). Serveur arrêté : ZIP immédiat. Palworld 1.0.5 vérifié : `/v1/api/save` est **synchrone** (~70 ms) et crée aussi `backup/world/<date>`.

## Sauvegarde auto (`src/main/scheduler/BackupScheduler`)

Intervalle 0 à 1440 min **par serveur**, active seulement serveur lancé. Tick de 30 s qui relit la config de chaque serveur (rien à réarmer), décompte depuis le 1er tick où le serveur est vu lancé (adoption comprise), remis à zéro à l'arrêt. Sauvegardes dues en **file**, une à la fois (plusieurs ZIP niveau 9 en parallèle feraient ramer les serveurs). Échec → logs du serveur (`autoBackupFailed`). Ne jamais revenir à un minuteur unique sur le serveur actif (les autres serveurs n'avaient jamais de sauvegarde, issue #195).

## Avant mise à jour (`backupBeforeUpdate(ctx, id, log)`, `BackupConfig.backupBeforeUpdate`, défaut true)

- Appelée par `steamcmd:updateGame` / `steamcmd:installGame` (`ipc/handlers/steam.ts`), le redémarrage planifié avec mise à jour, et l'IPC `backup:beforeUpdate` que le renderer appelle avant **Mettre à jour** / **Tout mettre à jour** des mods Valheim (`hooks/useBackupBeforeUpdate`, une sauvegarde pour la série : le main ne distingue pas une installation d'une mise à jour de mod).
- Renvoie null si l'option est désactivée, si l'exe est absent (1re installation) ou si le dossier des mondes n'existe pas.
- Échec → `AppError("BACKUP_BEFORE_UPDATE_FAILED")` et **la mise à jour n'est pas lancée**.

## UI

Page partagée `components/backup/BackupPage` : `autoNoteKey` **obligatoire** (ce que contient une sauvegarde serveur lancé pour ce jeu), bouton optionnel « ouvrir le dossier des mondes », `renderExtra(refresh)` pour un bloc du jeu (carte Mondes de Dragonwilds).
