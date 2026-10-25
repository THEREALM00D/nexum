# RuneScape: Dragonwilds

🇬🇧 [English](dragonwilds.md) | 🇫🇷 Français

Nexum fait tourner l'outil officiel **RuneScape: Dragonwilds - Dedicated Servers** (gratuit, application Steam 4019830). Cette page couvre ce qui est propre à Dragonwilds ; les autres pages ([installation](installation.fr.md), [réseau](network.fr.md), [sauvegardes](backups.fr.md)…) s'appliquent comme d'habitude.

## Avant de commencer : votre Player ID

Le serveur **ne démarre pas sans le Player ID du propriétaire**. Dans le jeu, ouvrez les **Paramètres** : votre Player ID s'affiche en bas du menu. Copiez-le dans **Configuration → Propriétaire et administration → Player ID du propriétaire**.

Le propriétaire peut bannir et débannir tout le monde. Nexum refuse de démarrer le serveur tant que ce champ est vide, avec un message qui explique pourquoi : sans lui, le serveur resterait « lancé » sans rien faire.

## Installation

Utilisez l'assistant de démarrage (ou **Serveurs → Ajouter un serveur**) et choisissez **RuneScape: Dragonwilds** :

- **Installer un nouveau serveur** : Nexum télécharge le serveur avec SteamCMD (environ 5 Go).
- **J'ai déjà un serveur** : choisissez le dossier qui contient `RSDragonwildsServer.exe` (le dossier de l'outil Steam convient aussi). Le dossier du jeu lui-même, avec `RSDragonwilds.exe`, n'est pas un serveur.

Prérequis : Windows 64 bits, environ 2 Go de RAM + 1 Go par joueur. Jusqu'à 6 joueurs.

## Configuration

La page **Configuration** modifie `RSDragonwilds/Saved/Config/WindowsServer/DedicatedServer.ini` et les réglages de lancement :

| Champ                     | Rôle                                                                                                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nom du serveur            | Affiché dans la colonne « Créé par » de la liste des mondes. Au hasard s'il est vide.                                                                       |
| Nom du monde              | Le monde chargé au démarrage, créé s'il n'existe pas. C'est aussi le nom que les joueurs cherchent (sensible à la casse).                                   |
| Mot de passe du monde     | Demandé aux joueurs pour rejoindre. Vide = ouvert à tous.                                                                                                   |
| Player ID du propriétaire | Votre Player ID (obligatoire).                                                                                                                              |
| Mot de passe admin        | Saisi en jeu (Pause → Paramètres → Gestion du serveur) par les joueurs qui doivent pouvoir bannir les joueurs connectés. Le propriétaire n'en a pas besoin. |
| Port de jeu / Port beacon | UDP 7777 et 8888 par défaut. Changer le port de jeu décale le port beacon (port de jeu + 1111).                                                             |
| Plateformes acceptées     | Crossplay (PC et consoles) ou PC uniquement.                                                                                                                |

**Arrêtez le serveur avant de modifier la configuration** : le serveur réécrit ce fichier pendant qu'il tourne, une modification faite à ce moment-là serait perdue. Nexum bloque le bouton **Sauvegarder** tant que le serveur est lancé.

Le serveur retire le mot de passe admin de son fichier après l'avoir lu : Nexum le garde et le remet avant chaque démarrage.

## Rejoindre le serveur

La carte **Rejoindre le serveur** du Dashboard donne tout ce qu'il faut transmettre à vos amis :

- **Nom à chercher dans le jeu** (le nom du monde) : dans le jeu, **Mondes → Public**, cherchez ce nom exact (sensible à la casse). L'apparition dans la liste peut prendre une à deux minutes après le démarrage.
- **Même réseau** : les joueurs de votre réseau local peuvent se connecter directement à `IP:port`.
- **Depuis Internet** : redirigez **UDP 7777 et 8888** sur votre box vers ce PC, et appliquez les règles de pare-feu de la page **Réseau**.

Le serveur et le jeu doivent avoir **la même version** : après une mise à jour du jeu, mettez aussi le serveur à jour (**Installation → Mettre à jour**), sinon le monde n'apparaît pas dans la liste. Nexum vérifie à chaque démarrage et vous prévient quand une mise à jour est disponible.

Problème connu (Jagex) : les invitations Steam vers un serveur dédié ne fonctionnent pas.

## Deuxième serveur sur le même PC

Chaque serveur a besoin de ses propres ports : par exemple 7778 / 8889 pour le deuxième. Nexum refuse de démarrer un serveur dont les ports sont déjà utilisés par un autre serveur lancé (quel que soit le jeu) et vous dit lequel.

## Mondes et sauvegardes solo

La page **Sauvegardes** contient une carte **Mondes** :

- le monde chargé au démarrage et les autres mondes du serveur, avec un bouton **Charger au démarrage** ;
- **Importer un monde solo** : Nexum liste les mondes du jeu sur ce PC (`%LOCALAPPDATA%\RSDragonwilds\Saved\SaveGames`), ou vous laisse choisir un fichier `.sav` venu d'un autre PC. Les mondes du serveur sont d'abord sauvegardés en ZIP, puis le monde est copié et sélectionné.

Bon à savoir : le serveur choisit un monde d'après le **nom inscrit dans la sauvegarde**, pas d'après le nom du fichier. Renommer un `.sav` est sans conséquence ; un monde du serveur qui porte le même nom qu'un monde importé est déplacé dans `Saved/SaveGames-replaced` pour que ce soit bien le monde importé qui se charge.

Le serveur doit être arrêté pour changer de monde ou en importer un.

## Arrêt et sauvegardes

Dragonwilds n'a ni API ni console d'administration, et **ne sait pas s'arrêter proprement sous Windows** (testé : le serveur s'arrête aussitôt sans sauvegarder, quel que soit le signal reçu). Nexum l'arrête donc immédiatement. Le serveur **sauvegarde le monde de lui-même toutes les 5 minutes** et garde la sauvegarde précédente en `.sav.backup` : au pire, les 5 dernières minutes sont perdues. Arrêtez le serveur à un moment calme, ou activez les [sauvegardes automatiques](backups.fr.md).

Pour la même raison, le [redémarrage planifié](scheduling.fr.md) ne peut pas prévenir les joueurs en jeu.

## Logs

Nexum lit le log complet du serveur (`RSDragonwilds/Saved/Logs/RSDragonwilds.log`) : monde chargé, ports, connexions des joueurs… même pour un serveur lancé avant l'ouverture de Nexum. Quand vous copiez ou enregistrez un log pour un rapport de bug, les mots de passe, identifiants des joueurs et codes de connexion sont masqués.

## Joueurs

Pas de liste des joueurs dans Nexum pour Dragonwilds (pas d'API). La modération (bannir, débannir) se fait en jeu, depuis **Pause → Paramètres → Gestion du serveur**.
