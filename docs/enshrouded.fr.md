# Enshrouded

🇬🇧 [English](enshrouded.md) | 🇫🇷 Français

Nexum fait tourner le serveur officiel **Enshrouded Dedicated Server** (gratuit, application Steam 2278520). Cette page décrit ce qui est propre à Enshrouded ; les autres pages ([installation](installation.fr.md), [réseau](network.fr.md), [sauvegardes](backups.fr.md)…) s'appliquent comme d'habitude.

## Installation

Passez par l'assistant de démarrage (ou **Serveurs → Ajouter un serveur**) et choisissez **Enshrouded** :

- **Installer un nouveau serveur** : Nexum télécharge le serveur avec SteamCMD (environ 8 Go).
- **J'ai déjà un serveur** : choisissez le dossier qui contient `enshrouded_server.exe` (le dossier « Enshrouded Dedicated Server » des **Outils** Steam convient aussi).

Configuration requise : Windows 64 bits et un PC costaud. Le serveur utilise environ **4,5 Go de RAM** à lui seul, plus environ 100 Mo par joueur (6 Go au total au maximum) ; prévoyez **30 Go** d'espace disque libre. Jusqu'à 16 joueurs.

Le fichier de configuration `enshrouded_server.json` est créé par le serveur **à son premier démarrage** : démarrez-le une fois, arrêtez-le, puis réglez-le.

## Configuration

La page **Configuration** modifie `enshrouded_server.json` (à côté de `enshrouded_server.exe`). Elle a la même présentation que celle de Valheim :

| Section                  | Contenu                                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Général                  | Nom du serveur (celui que les joueurs cherchent), joueurs maximum (1 à 16), chat écrit, chat vocal et son mode (proximité ou tout le serveur) |
| Réseau                   | Port (UDP 15637 par défaut) et adresse d'écoute (laissez `0.0.0.0`)                                                                           |
| Difficulté               | Les presets du jeu : Normal, Détente, Difficile, Survie ou Personnalisé                                                                       |
| Réglages de partie       | Une quarantaine de réglages rangés par thème (joueurs, survie, monde, progression, ennemis, boss, jour et nuit)                               |
| Avancé                   | Dossier des sauvegardes, dossier des logs du jeu, arguments de lancement supplémentaires                                                      |
| Groupes et mots de passe | Les groupes d'utilisateurs, enregistrés avec leur propre bouton (voir plus bas)                                                               |

**Presets et réglages de partie** : le serveur ne lit les réglages de partie qu'avec le preset **Personnalisé**. En modifier un passe automatiquement le preset en Personnalisé. Les durées du jour, de la nuit et de la faim sont affichées en minutes (le fichier les stocke en nanosecondes, Nexum convertit). Une valeur hors limites est ramenée à la limite par le serveur.

**Arrêtez le serveur avant de modifier la configuration** : le serveur réécrit `enshrouded_server.json` à chaque démarrage. Nexum bloque les boutons **Enregistrer** tant que le serveur tourne et relit le fichier à l'arrêt. Avant chaque enregistrement, l'ancien fichier est gardé en `enshrouded_server.json.backup`. Les clés que Nexum ne gère pas (tags, bannissements…) ne sont pas touchées.

## Groupes et mots de passe

Enshrouded n'a pas un mot de passe unique : chaque **groupe** a le sien, et le mot de passe saisi par un joueur en rejoignant lui donne les droits de ce groupe.

Au premier démarrage, le serveur crée 4 groupes avec des mots de passe au hasard :

| Groupe  | Expulser et bannir | Coffres des bases | Modifier le monde | Construire dans les bases | Autels de Flamme |
| ------- | ------------------ | ----------------- | ----------------- | ------------------------- | ---------------- |
| Admin   | ✅                 | ✅                | ✅                | ✅                        | ✅               |
| Friend  |                    | ✅                | ✅                | ✅                        |                  |
| Guest   |                    |                   | ✅                |                           |                  |
| Visitor |                    |                   |                   |                           |                  |

Dans **Configuration → Groupes et mots de passe**, vous pouvez afficher, changer ou générer chaque mot de passe, modifier les droits, réserver des **places** (gardées libres pour ce groupe quand le serveur est plein), ajouter ou supprimer des groupes. Cliquez ensuite sur **Enregistrer les groupes**.

Un groupe **sans mot de passe** laisse entrer tout le monde avec ses droits : le Dashboard vous le signale.

## Rejoindre le serveur

La carte **Rejoindre le serveur** du Dashboard donne tout ce qu'il faut transmettre à vos amis :

- **Nom à chercher dans le jeu** : le nom du serveur. Dans le jeu, **Rejoindre**, puis activez l'affichage des serveurs dédiés dans les filtres de la liste.
- **Même réseau** : `IP:15637`.
- **Depuis Internet** : redirigez le port **UDP 15637** de votre box vers ce PC et appliquez la règle de pare-feu de la page **Réseau**. Si le serveur n'apparaît pas dans la liste, ajoutez-le aux favoris Steam : dans Steam, menu **Affichage**, **Serveurs de jeux**, onglet **Favoris**, bouton **+**, puis `IP publique:15637`.

Seul le port du serveur est à ouvrir : les autres ports qu'il utilise sont temporaires et choisis par Steam.

## Deuxième serveur sur le même PC

Utilisez un autre port (par exemple 15638). Nexum refuse de démarrer un serveur dont le port est déjà utilisé par un autre serveur lancé (tous jeux confondus) et vous dit lequel.

## Arrêt et sauvegardes

L'arrêt est **propre** : Nexum envoie au serveur un signal CTRL+Pause, le serveur sauvegarde le monde et s'éteint en une ou deux secondes (CTRL+C est ignoré par Enshrouded, testé). Le [redémarrage planifié](scheduling.fr.md) fonctionne de la même façon, mais les joueurs ne peuvent pas être prévenus en jeu (pas d'API d'administration).

Les sauvegardes du monde sont dans le dossier `savegame` du serveur (`world0.ksd`, plus les copies que le jeu garde dans `savegame/backup`). Les [sauvegardes](backups.fr.md) de Nexum zippent ce dossier et suivent le dossier choisi dans **Avancé**.

Bon à savoir : **quitter Nexum** (menu de l'icône, **Quitter Nexum**) arrête aussi un serveur qu'il a lancé, sans sauvegarde propre. Fermer la fenêtre ne pose pas de problème (Nexum reste dans la zone de notification, par défaut) ; pour quitter Nexum, arrêtez d'abord le serveur.

## Logs

La sortie du serveur s'affiche en entier dans la page **Logs**. Quand vous copiez ou enregistrez un log pour un rapport de bug, l'IP publique et l'identifiant Steam du serveur sont masqués.

## Joueurs

Pas de liste des joueurs dans Nexum pour Enshrouded (pas d'API). L'expulsion et le bannissement se font en jeu, par un joueur dont le groupe a le droit **Expulser et bannir**.
