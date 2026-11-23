# ARK: Survival Ascended

🇬🇧 [English](ark.md) | 🇫🇷 Français

Nexum fait tourner le serveur officiel **ARK: Survival Ascended Dedicated Server** (gratuit, application Steam 2430930). Cette page décrit ce qui est propre à ARK ; les autres pages ([installation](installation.fr.md), [réseau](network.fr.md), [sauvegardes](backups.fr.md)…) s'appliquent comme d'habitude.

## Installation

Passez par l'assistant de démarrage (ou **Serveurs → Ajouter un serveur**) et choisissez **ARK: Survival Ascended** :

- **Installer un nouveau serveur** : Nexum télécharge le serveur avec SteamCMD (environ 13 Go).
- **J'ai déjà un serveur** : choisissez le dossier qui contient `ShooterGame` (Nexum cherche `ShooterGame\Binaries\Win64\ArkAscendedServer.exe`).

Configuration requise : Windows 64 bits et un PC puissant. Le serveur prend environ **10 Go de RAM** à lui seul une fois démarré, sans joueur connecté ; prévoyez **20 Go** d'espace disque libre.

Après **Démarrer**, le serveur met une à deux minutes à être prêt : attendez la ligne `Server has completed startup and is now advertising for join` dans la page **Logs**.

## Configuration

La page **Configuration** regroupe deux endroits :

| Section                 | Contenu                                                                    | Où c'est écrit                   |
| ----------------------- | -------------------------------------------------------------------------- | -------------------------------- |
| Serveur                 | Nom de session, carte, joueurs max, mode PvE                               | Fichier INI et ligne de commande |
| Accès et administration | Mot de passe du serveur, mot de passe admin, RCON                          | `GameUserSettings.ini`           |
| Réseau                  | Port de jeu (UDP 7777), port de requête (UDP 27015), port RCON (TCP 27020) | Ligne de commande                |
| Avancé                  | BattlEye, arguments de lancement supplémentaires                           | Ligne de commande                |

`GameUserSettings.ini` se trouve dans `ShooterGame\Saved\Config\WindowsServer`. Le nom de session, les mots de passe, le mode PvE et RCON y sont écrits ; la carte, les joueurs max, les ports et BattlEye passent par la ligne de commande. Les joueurs max ne fonctionnent que sur la ligne de commande : le serveur ignore et réécrit la valeur du fichier INI.

**Cartes** : The Island, The Center, Scorched Earth, Aberration, Extinction, Ragnarok, Valguero, Lost Colony et Astraeos. Chaque carte a son propre monde : changer de carte ne supprime pas le précédent. Certaines cartes sont payantes : les joueurs doivent les posséder.

**Arrêtez le serveur avant de changer la configuration** : le serveur réécrit `GameUserSettings.ini` quand il s'arrête, avec les valeurs lues au démarrage. Nexum bloque le bouton **Sauvegarder** tant que le serveur tourne. Avant chaque enregistrement, le fichier précédent est gardé en `GameUserSettings.ini.backup`. Les autres réglages du fichier INI (et `Game.ini`) ne sont pas touchés : modifiez-les à la main, serveur arrêté.

**Ne mettez jamais de mot de passe dans les arguments supplémentaires** : le serveur recopie toute sa ligne de commande dans son journal.

## RCON

RCON est la console d'administration à distance du serveur. Nexum en a besoin pour :

- arrêter le serveur proprement : le monde est sauvegardé avant que le serveur ne quitte ;
- sauvegarder le monde juste avant une [sauvegarde](backups.fr.md) d'un serveur lancé ;
- prévenir les joueurs dans le chat du jeu avant un [redémarrage planifié](scheduling.fr.md) (le message est envoyé sans accents : le jeu ne sait pas les afficher) ;
- lister les joueurs connectés dans la page **Joueurs**.

Nexum active RCON de lui-même pour un nouveau serveur, et crée un mot de passe admin s'il n'y en a pas (vous pouvez le voir et le changer dans **Configuration**). Si vous désactivez RCON, Nexum le respecte, mais l'arrêt du serveur fait alors perdre jusqu'à 15 minutes de progression (le jeu sauvegarde toutes les 15 minutes).

Le port RCON n'est jamais ouvert dans le pare-feu : Nexum ne s'y connecte que depuis ce PC.

## Rejoindre le serveur

La carte **Rejoindre le serveur** du Dashboard affiche tout ce qu'il faut donner à vos amis :

- **Nom à chercher dans le jeu** : le nom de session, dans la liste des serveurs non officiels.
- **Même réseau** : `IP:7777`.
- **Depuis Internet** : redirigez **UDP 7777** (le port de jeu) sur votre box vers ce PC, et appliquez la règle de pare-feu de la page **Réseau**.

## Deuxième serveur sur le même PC

Utilisez un autre port de jeu **et** un autre port de requête (par exemple 7787 et 27016), ainsi qu'un autre port RCON. Nexum refuse de démarrer un serveur dont les ports sont déjà utilisés par un autre serveur lancé (tous jeux confondus) et vous dit lequel.

## Arrêt et sauvegardes

L'arrêt passe par RCON : Nexum demande au serveur de sauvegarder, puis envoie `DoExit` ; le serveur sauvegarde à nouveau le monde et quitte en 20 secondes environ. Sans RCON, le serveur ne peut pas être arrêté proprement (il ignore CTRL+Pause, testé) : Nexum l'arrête directement.

Le monde est dans `ShooterGame\Saved\SavedArks\<carte>` (par exemple `TheIsland_WP\TheIsland_WP.ark`). Le jeu y garde aussi jusqu'à 4 copies complètes du monde (fichiers `.arkrbf`) et une copie anti-corruption (`.bak`). Les [sauvegardes](backups.fr.md) de Nexum laissent ces copies de côté : une sauvegarde ne contient que le monde lui-même, environ 6 fois plus petite.

Bon à savoir : un serveur démarré par Nexum s'arrête quand Nexum se ferme. Nexum vous le demande d'abord et l'arrête proprement (voir [Quitter Nexum avec des serveurs en ligne](installation.fr.md#quitter-nexum-avec-des-serveurs-en-ligne)).

## Logs

Nexum suit le journal du jeu lui-même (`ShooterGame\Saved\Logs\ShooterGame.log`) : le serveur n'écrit rien d'utile dans sa console. Les lignes de débogage du module de statistiques du jeu sont masquées à l'écran, et les messages Steam habituels d'un serveur dédié ne sont pas affichés comme des erreurs. Le fichier de la session et l'export (**Copier**, **Enregistrer**) contiennent tout. Quand vous copiez ou enregistrez un log pour un rapport de bug, les IP publiques, les identifiants des joueurs et les mots de passe trouvés dans la ligne de commande sont masqués.

## Joueurs

Avec RCON activé, la page **Joueurs** liste les joueurs connectés et garde leur historique (première et dernière connexion, temps de jeu), comme pour Palworld, et le Dashboard affiche le nombre de joueurs connectés. Avec RCON désactivé, le Dashboard et la page **Planification** vous préviennent et proposent de l'activer (serveur arrêté).
