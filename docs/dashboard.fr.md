# Dashboard

🇬🇧 [English](dashboard.md) | 🇫🇷 Français

Vue principale de Nexum — statut du serveur, statistiques, contrôles et joueurs connectés.

## Statut du serveur

Affiché en haut sous forme de chip coloré :

| Statut           | Couleur | Description                                      |
| ---------------- | ------- | ------------------------------------------------ |
| **En ligne**     | Vert    | Le serveur est démarré et accepte les connexions |
| **Démarrage...** | Orange  | Le processus est en cours de lancement           |
| **Arrêt...**     | Orange  | Arrêt en cours (annonce + sauvegarde + shutdown) |
| **Arrêté**       | Gris    | Le serveur n'est pas en cours d'exécution        |
| **Planté**       | Rouge   | Le processus s'est arrêté avec une erreur        |

## Contrôles

- **Démarrer** : lance le processus `PalServer.exe`
- **Redémarrer** : arrête puis relance
- **Arrêter** : tente un arrêt gracieux via l'API REST (annonce + save + shutdown), puis force l'arrêt via `taskkill` si nécessaire

> L'arrêt gracieux n'est possible que si **API REST** est activée dans la configuration. Sinon, le serveur est tué brutalement et les modifications récentes peuvent être perdues.

## Statistiques système

Quatre cartes affichant en temps réel (rafraîchies toutes les 2 secondes) :

- **CPU** : utilisation du processeur en %
- **RAM** : utilisation mémoire en %
- **RAM utilisée** : mémoire consommée en GB
- **Uptime** : temps écoulé depuis le démarrage de la machine

Les barres de progression changent de couleur :

- Vert : < 65%
- Orange : 65-85%
- Rouge : > 85%

## Informations du serveur

Affichées uniquement quand le serveur est **En ligne** et que l'API REST est accessible :

- Nom du serveur
- Version Palworld
- Description
- World GUID (identifiant unique du monde)
- Joueurs en ligne (actuels / max)
- Jour en jeu (compteur in-game)
- FPS serveur
- Nombre de camps de base

Les données sont rafraîchies toutes les 10 secondes.

## Joueurs connectés

Liste en temps réel des joueurs avec :

- **Nom** et **niveau**
- **Ping** (latence en ms)
- **Bouton Expulser** (icône orange) : déconnecte le joueur sans le bannir
- **Bouton Bannir** (icône rouge) : déconnecte et empêche toute reconnexion

### Débannir un joueur

En bas du panel des joueurs :

- Entrez le **User ID** (Steam ID) du joueur banni
- Cliquez sur **Débannir**

> Le User ID est visible dans les logs ou via la liste des bans Palworld (`Pal/Saved/SaveGames/{GUID}/banlist.txt`).

## Limitations

- Les fonctions de gestion des joueurs nécessitent l'**API REST activée**
- Si l'API n'est pas accessible (REST désactivé, mauvais mot de passe, etc.), aucune information n'est affichée — vérifiez la configuration
