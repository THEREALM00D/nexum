# Sauvegardes

🇬🇧 [English](backups.md) | 🇫🇷 Français

Sauvegardes ZIP des mondes de chaque serveur.

## Que sauvegarde-t-on ?

**Palworld** : Nexum zippe le dossier suivant :

```
{serverPath}/Pal/Saved/SaveGames/
```

Ce dossier contient :

- L'état du monde (terrain, structures, Pals)
- Les inventaires et progressions des joueurs
- La liste des bans
- Les paramètres de la sauvegarde

> Le fichier `PalWorldSettings.ini` n'est **pas** inclus dans la sauvegarde — il est dans `Pal/Saved/Config/WindowsServer/`.

**Valheim** : Nexum zippe le dossier `worlds_local` (dans `%USERPROFILE%\AppData\LocalLow\IronGate\Valheim`, ou dans le **Dossier de sauvegardes** choisi dans **Configuration**).

**Astroneer** : Nexum zippe `{serverPath}/Astro/Saved/SaveGames/`.

**RuneScape: Dragonwilds** : Nexum zippe `{serverPath}/RSDragonwilds/Saved/SaveGames/` (tous les mondes du serveur, un fichier `.sav` chacun). La même page contient une carte **Mondes** pour choisir le monde chargé au démarrage et importer un monde solo, voir [RuneScape: Dragonwilds](dragonwilds.fr.md).

**Enshrouded** : Nexum zippe le dossier des sauvegardes du serveur (`savegame` par défaut, ou le dossier choisi dans **Configuration → Avancé**) : le monde `world0.ksd` et les copies que le jeu garde dans `savegame/backup`. Voir [Enshrouded](enshrouded.fr.md).

## Configuration

### Dossier de sauvegarde

Par défaut : `{userData}/servers/<id du serveur>/backups` (typiquement `%APPDATA%\Nexum\servers\<id du serveur>\backups` ; `%APPDATA%\server-forge\…` pour les installations d'origine ServerForge).

Vous pouvez choisir un autre dossier (disque externe, NAS) via le bouton **dossier**.

### Rotation

Le champ **Sauvegardes à conserver** définit combien de backups sont gardés. Quand le nombre est dépassé, les plus anciennes sont supprimées automatiquement.

- `0` : pas de rotation, tout est conservé
- `10` (défaut) : garde les 10 plus récentes

Les sauvegardes faites **avant une mise à jour** (voir plus bas) sont comptées à part : avec `10`, Nexum garde les 10 dernières sauvegardes normales **et** les 10 dernières d'avant mise à jour. Une série de sauvegardes automatiques ne fait donc jamais disparaître la copie du monde d'avant le patch.

### Sauvegarde automatique

Sélecteur d'intervalle :

| Option     | Fréquence              |
| ---------- | ---------------------- |
| Désactivée | Pas de sauvegarde auto |
| 15 min     | Toutes les 15 minutes  |
| 30 min     | Toutes les 30 minutes  |
| 1 h        | Chaque heure           |
| 3 h        | Toutes les 3 heures    |
| 6 h        | Toutes les 6 heures    |
| 12 h       | Toutes les 12 heures   |
| 1 jour     | Une fois par jour      |

> La sauvegarde automatique tourne **uniquement quand le serveur est en cours d'exécution**.

Chaque serveur lancé est sauvegardé à son propre intervalle, qu'il soit sélectionné dans Nexum ou non. La première sauvegarde a lieu un intervalle après le démarrage du serveur, et le décompte repart de zéro à son arrêt. Quand plusieurs serveurs sont dus en même temps, leurs sauvegardes passent l'une après l'autre : les serveurs lancés ne se disputent pas le disque et le processeur.

### Sauvegarde d'un serveur lancé

Une sauvegarde faite serveur lancé (sauvegarde automatique, bouton **Créer une sauvegarde**, sauvegarde avant une mise à jour de mods) suit ces étapes :

1. **Palworld** : Nexum demande d'abord au serveur de sauvegarder via l'API REST (`/v1/api/save`) ; la sauvegarde contient donc le monde tel qu'il est à cet instant. L'API REST doit être activée dans **Configuration**. Sans elle (ou si le serveur ne répond pas), la sauvegarde contient la dernière sauvegarde automatique du jeu (réglage `AutoSaveSpan`).
2. **Autres jeux** : ils ne savent pas sauvegarder sur commande, la sauvegarde contient donc le dernier enregistrement écrit par le jeu :

   | Jeu                    | Sauvegarde automatique du jeu                                |
   | ---------------------- | ------------------------------------------------------------ |
   | Valheim                | Toutes les 30 min par défaut, et à l'arrêt                   |
   | Astroneer              | `AutoSaveGameInterval` (900 s par défaut, **Configuration**) |
   | RuneScape: Dragonwilds | Toutes les 5 min                                             |
   | Enshrouded             | Environ toutes les 5 min, et à l'arrêt                       |

3. Nexum attend que le jeu ait fini d'écrire ses fichiers de sauvegarde (aucun fichier modifié depuis 5 s, 30 s au plus) avant de zipper : un fichier n'est jamais pris à moitié écrit. Si le jeu écrit de nouveau pendant la création du ZIP, le ZIP est refait une fois.

Les logs du serveur disent ce qui s'est passé, par exemple `Sauvegarde créée : backup-….zip` suivi de `La sauvegarde contient la dernière sauvegarde écrite par le jeu (14:32:05).` Pour avoir la toute dernière progression d'un jeu sans commande de sauvegarde, arrêtez le serveur (il sauvegarde à l'arrêt) puis sauvegardez.

### Sauvegarde avant chaque mise à jour

Option **Sauvegarder le monde avant chaque mise à jour**, activée par défaut. Un patch du jeu ou d'un mod qui casse le monde ne fait plus perdre de progression. Nexum sauvegarde le monde :

- avant chaque mise à jour du jeu depuis la page **Installation** (et l'assistant de démarrage) ;
- avant la mise à jour du jeu faite par le [redémarrage planifié](scheduling.fr.md) ;
- avant **Mettre à jour** et **Tout mettre à jour** sur la page Mods (Valheim), une seule sauvegarde pour toute la série.

Ces sauvegardes s'appellent `backup-YYYY-MM-DD_HH-MM-SS-before-update.zip` et portent la mention **Avant mise à jour** dans la liste. Pour revenir en arrière, restaurez-la serveur arrêté (et réinstallez l'ancienne version des mods si besoin).

- Rien n'est sauvegardé pour une **première installation** (pas encore de monde) ni si le dossier des mondes n'existe pas encore.
- Si la sauvegarde **échoue** (dossier de sauvegarde inaccessible, disque plein…), la mise à jour **n'est pas lancée** et un message l'explique. Corrigez le dossier, ou désactivez l'option pour mettre à jour quand même.

## Actions

### Créer manuellement

Bouton **Créer une sauvegarde** :

1. Zippe le dossier des sauvegardes du jeu (compression niveau 9 = max)
2. Nomme le fichier `backup-YYYY-MM-DD_HH-MM-SS.zip`
3. Applique la rotation si nécessaire
4. Notification de succès

La création peut prendre de quelques secondes à plusieurs minutes selon la taille du monde.

### Restaurer

Bouton **Restaurer** sur chaque sauvegarde :

1. Confirmation requise
2. **Le serveur doit être arrêté** (le bouton est désactivé sinon)
3. Le dossier des sauvegardes actuel est supprimé
4. Le contenu du ZIP est extrait à sa place

> ⚠️ La restauration **écrase** la sauvegarde actuelle. Faites une sauvegarde manuelle avant de restaurer si vous voulez pouvoir revenir en arrière.

### Supprimer

Bouton **Supprimer** sur chaque sauvegarde — confirmation requise.

## Bonnes pratiques

- **Activez la sauvegarde auto** dès le départ (toutes les heures par exemple)
- **Vérifiez périodiquement** que les sauvegardes se créent correctement (regardez les logs et les dates)
- **Stockez les sauvegardes sur un autre disque** que celui du serveur (en cas de panne disque)
- **Testez la restauration** au moins une fois pour vérifier que le processus fonctionne
- Laissez **Sauvegarder le monde avant chaque mise à jour** activé : vous pourrez revenir en arrière si une mise à jour du jeu ou d'un mod casse le monde

## Récupération en cas de problème

Si le serveur ne démarre plus après corruption :

1. Arrêtez le serveur dans le Dashboard (s'il est en zombie)
2. Allez dans **Sauvegardes**
3. Restaurez la sauvegarde la plus récente fonctionnelle
4. Redémarrez le serveur

### Valheim : fichiers `.old` intégrés

Valheim garde lui-même une copie de l'état de sauvegarde précédent à côté du fichier actif (`worldname.db.old` / `worldname.fwl.old`), rafraîchie à chaque cycle de sauvegarde. Comme le backup ZIP de Nexum zippe tout le dossier de sauvegarde, ces fichiers `.old` sont déjà inclus automatiquement dans chaque backup. En dépannage rapide, sans même passer par Nexum, vous pouvez en restaurer un manuellement en retirant l'extension `.old` — utile si une corruption est survenue entre deux backups planifiés.
