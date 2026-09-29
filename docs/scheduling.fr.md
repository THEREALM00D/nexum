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

## Comment ça fonctionne

Le scheduler côté main :

1. Vérifie l'heure actuelle toutes les 30 secondes
2. Quand l'heure correspond, déclenche le processus de redémarrage **une seule fois par jour** à cette heure

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
