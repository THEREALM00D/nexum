# Sauvegardes

🇬🇧 [English](backups.md) | 🇫🇷 Français

Système de sauvegardes ZIP du dossier `SaveGames` du serveur Palworld.

## Que sauvegarde-t-on ?

Nexum zippe le dossier suivant :

```
{serverPath}/Pal/Saved/SaveGames/
```

Ce dossier contient :

- L'état du monde (terrain, structures, Pals)
- Les inventaires et progressions des joueurs
- La liste des bans
- Les paramètres de la sauvegarde

> Le fichier `PalWorldSettings.ini` n'est **pas** inclus dans la sauvegarde — il est dans `Pal/Saved/Config/WindowsServer/`.

## Configuration

### Dossier de sauvegarde

Par défaut : `{userData}/backups` (typiquement `C:\Users\{user}\AppData\Roaming\server-forge\backups`).

Vous pouvez choisir un autre dossier (disque externe, NAS) via le bouton **dossier**.

### Rotation

Le champ **Sauvegardes à conserver** définit combien de backups sont gardés. Quand le nombre est dépassé, les plus anciennes sont supprimées automatiquement.

- `0` : pas de rotation, tout est conservé
- `10` (défaut) : garde les 10 plus récentes

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

## Actions

### Créer manuellement

Bouton **Créer une sauvegarde** :

1. Zippe le dossier SaveGames (compression niveau 9 = max)
2. Nomme le fichier `backup-YYYY-MM-DD_HH-MM-SS.zip`
3. Applique la rotation si nécessaire
4. Notification de succès

La création peut prendre de quelques secondes à plusieurs minutes selon la taille du monde.

### Restaurer

Bouton **Restaurer** sur chaque sauvegarde :

1. Confirmation requise
2. **Le serveur doit être arrêté** (le bouton est désactivé sinon)
3. Le dossier SaveGames actuel est supprimé
4. Le contenu du ZIP est extrait à sa place

> ⚠️ La restauration **écrase** la sauvegarde actuelle. Faites une sauvegarde manuelle avant de restaurer si vous voulez pouvoir revenir en arrière.

### Supprimer

Bouton **Supprimer** sur chaque sauvegarde — confirmation requise.

## Bonnes pratiques

- **Activez la sauvegarde auto** dès le départ (toutes les heures par exemple)
- **Vérifiez périodiquement** que les sauvegardes se créent correctement (regardez les logs et les dates)
- **Stockez les sauvegardes sur un autre disque** que celui du serveur (en cas de panne disque)
- **Testez la restauration** au moins une fois pour vérifier que le processus fonctionne
- Avant une **mise à jour majeure** de Palworld, faites une sauvegarde manuelle pour pouvoir rollback

## Récupération en cas de problème

Si le serveur ne démarre plus après corruption :

1. Arrêtez le serveur dans le Dashboard (s'il est en zombie)
2. Allez dans **Sauvegardes**
3. Restaurez la sauvegarde la plus récente fonctionnelle
4. Redémarrez le serveur

### Valheim : fichiers `.old` intégrés

Valheim garde lui-même une copie de l'état de sauvegarde précédent à côté du fichier actif (`worldname.db.old` / `worldname.fwl.old`), rafraîchie à chaque cycle de sauvegarde. Comme le backup ZIP de Nexum zippe tout le dossier de sauvegarde, ces fichiers `.old` sont déjà inclus automatiquement dans chaque backup. En dépannage rapide, sans même passer par Nexum, vous pouvez en restaurer un manuellement en retirant l'extension `.old` — utile si une corruption est survenue entre deux backups planifiés.
