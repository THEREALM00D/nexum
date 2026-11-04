# Planification

🇬🇧 [English](scheduling.md) | 🇫🇷 Français

Redémarrage automatique quotidien du serveur à une heure fixe.

## À quoi ça sert ?

Les serveurs Palworld peuvent souffrir de fuites mémoire ou de ralentissements après plusieurs jours d'uptime. Un redémarrage régulier :

- Libère la mémoire et améliore les performances
- Permet d'appliquer les modifications de configuration en attente
- Force la création d'un point de sauvegarde propre
- Réduit les chances de plantage en pleine session

## Configuration

### Activer le redémarrage planifié

Toggle en haut de la page. Quand désactivé, aucun redémarrage automatique n'a lieu.

### Heure (24h)

Sélecteur d'heure au format `HH:MM`. Le redémarrage se déclenche **chaque jour** à cette heure.

> Choisissez une heure creuse (ex: 04:00 du matin) pour minimiser l'impact sur les joueurs.

### Avertissement (minutes avant)

Délai entre l'annonce envoyée aux joueurs et l'arrêt effectif. Par défaut : **5 minutes**.

- `0` : arrêt immédiat sans avertissement
- `5` : annonce envoyée, puis arrêt 5 minutes plus tard
- `15` : annonce envoyée, puis arrêt 15 minutes plus tard

### Message d'annonce

Texte envoyé à tous les joueurs via l'API REST. Le placeholder `{minutes}` est remplacé par le délai d'avertissement.

Exemple : `"Le serveur va redémarrer dans {minutes} minutes"` devient `"Le serveur va redémarrer dans 5 minutes"`.

### Mettre à jour le jeu au moment du redémarrage

Option désactivée par défaut. Au moment du redémarrage, Nexum vérifie si une mise à jour du serveur est disponible sur Steam :

- **Mise à jour disponible** : arrêt du serveur (avec l'annonce et le délai ci-dessus), [sauvegarde du monde](backups.fr.md#sauvegarde-avant-chaque-mise-à-jour), mise à jour avec SteamCMD, puis démarrage. Le résultat (build installé, nom de la sauvegarde) est écrit dans les logs de la nouvelle session.
- **Serveur à jour**, ou Steam ne répond pas : simple redémarrage, comme sans l'option.
- Si la sauvegarde ou la mise à jour échoue, le serveur redémarre sur la version déjà installée et les logs disent pourquoi.

Utile pour que le serveur suive les patchs du jeu sans intervention : un serveur en retard d'une version refuse les joueurs qui ont mis leur jeu à jour. Sans effet pour un serveur installé via la **bibliothèque Steam** (c'est Steam qui le met à jour) ou si SteamCMD n'est pas installé. Les mods Valheim ne sont pas mis à jour automatiquement.

## Comment ça fonctionne

Chaque serveur a sa propre planification : tous les serveurs lancés dont le redémarrage est activé sont redémarrés à leur heure, qu'ils soient sélectionnés dans Nexum ou non (jusqu'à la 0.14, seul le serveur sélectionné l'était).

Le scheduler côté main :

1. Vérifie l'heure actuelle toutes les 30 secondes
2. Quand l'heure correspond, déclenche le processus de redémarrage **une seule fois par jour** à cette heure (uniquement si le serveur est lancé)

Le processus de redémarrage :

1. **Annonce** envoyée via `/v1/api/announce` (si message non vide)
2. **Sauvegarde** du monde via `/v1/api/save`
3. **Arrêt gracieux** via `/v1/api/shutdown` avec délai d'attente
4. Attente courte
5. **Redémarrage** du processus serveur

## Prérequis

> ⚠️ **L'API REST doit être activée** dans `PalWorldSettings.ini` (`RESTAPIEnabled=True`) pour que le redémarrage planifié fonctionne correctement.

Si l'API est désactivée, Nexum affiche un avertissement avec un bouton **Activer** qui modifie la configuration en un clic.

> Sans API REST, l'arrêt se fait avec `taskkill /F` sans sauvegarde — vous risquez de perdre des données récentes.

**RuneScape: Dragonwilds** n'a pas d'API et ne sait pas s'arrêter proprement sous Windows : le redémarrage l'arrête immédiatement, sans avertir les joueurs en jeu. Le serveur sauvegarde le monde de lui-même toutes les 5 minutes : au pire, les 5 dernières minutes sont perdues.

**Enshrouded** n'a pas d'API non plus, donc pas d'avertissement en jeu, mais il s'arrête proprement : Nexum lui envoie CTRL+Pause, le serveur sauvegarde le monde puis redémarre.

## Cas d'usage

### Redémarrage de nuit (recommandé)

```
Heure: 04:00
Avertissement: 5 minutes
Message: "Maintenance quotidienne dans {minutes} min"
```

### Redémarrage rapide pendant maintenance

```
Heure: 12:00
Avertissement: 1 minute
Message: "Redémarrage technique dans {minutes} min"
```

## Interaction avec les sauvegardes auto

Le redémarrage planifié et les sauvegardes automatiques sont **indépendants**. Vous pouvez activer les deux :

- Sauvegardes auto toutes les heures (sécurité continue)
- Redémarrage planifié à 4h du matin (maintenance quotidienne)

> Le shutdown gracieux fait sa propre sauvegarde via l'API, indépendamment du scheduler de backups ZIP.

## Limitations actuelles

- **Une seule heure** par jour (pas de multiples horaires)
- **Tous les jours** (pas de jours sélectionnables)
- Pas de notification quand le redémarrage échoue (vérifier les logs)
