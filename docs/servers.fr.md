# Serveurs

🇬🇧 [English](servers.md) | 🇫🇷 Français

La page **Serveurs** liste tous les serveurs dédiés gérés par Nexum, quel que soit le jeu. Cliquez sur un serveur pour en faire le serveur actif : les pages de la barre latérale (Dashboard, Configuration, Logs…) affichent alors ce serveur.

## Un serveur

Chaque ligne a un bouton **Démarrer** / **Arrêter**, un bouton **Redémarrer** et un menu **⋯** :

- **Modifier** : nom, couleur, démarrage automatique avec Nexum, relance après un plantage, et les options de surveillance ci-dessous.
- **Ouvrir le dossier**.
- **Exporter pour un autre PC** (serveur arrêté) : voir [Changer de PC](moving.fr.md).
- **Supprimer** : retire le serveur de Nexum ; les fichiers du jeu restent sur le disque.

L'en-tête propose **Importer un serveur** (un fichier exporté depuis un autre PC), **Assistant de démarrage** et **Ajouter un serveur** (un nouveau serveur ou un dossier déjà installé).

### Surveillance (dialogue Modifier)

- **Relancer si le démarrage n'est pas fini** (ARK: Survival Ascended et Enshrouded seulement, les jeux qui écrivent une ligne « prêt » dans leur log : `advertising for join` pour ARK, `HostOnline` pour Enshrouded) : si la ligne n'apparaît pas après le nombre de minutes choisi (10 par défaut), Nexum tue le serveur et le redémarre 10 secondes plus tard. Ces relances comptent avec les relances après un plantage : au-delà de 3 en 30 minutes, Nexum laisse le serveur arrêté.
- **Redémarrer quand la RAM dépasse** (tous les jeux) : quand la RAM du serveur reste au-dessus de la limite pendant 5 minutes d'affilée (vérifiée une fois par minute), Nexum le redémarre, en prévenant les joueurs avec les annonces de sa page **Planification** quand le jeu le permet (API REST, RCON). Sinon, il redémarre tout de suite.

À chaque fois, une ligne va dans les logs du serveur et un avertissement s'affiche sous l'en-tête du Dashboard (avec **Voir les logs**) jusqu'à ce que vous le masquiez. Une notification Windows apparaît si la fenêtre de Nexum n'est pas au premier plan.

## Tous les serveurs

Le menu **Tous les serveurs ▾** agit sur tous les serveurs d'un coup. Le nombre à droite de chaque entrée dit combien de serveurs sont concernés ; une entrée sans serveur est grisée.

| Entrée                                        | Serveurs concernés   | Ce qu'elle fait                                                                                         |
| --------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------- |
| **Démarrer tous les serveurs**                | arrêtés (ou plantés) | Les démarre, à 5 secondes d'intervalle                                                                  |
| **Redémarrer les serveurs en ligne**          | en ligne             | Arrête puis démarre chacun                                                                              |
| **Arrêter tous les serveurs**                 | en ligne             | Les arrête, en sauvegardant le monde quand le jeu le permet                                             |
| **Mettre à jour les serveurs arrêtés**        | arrêtés (ou plantés) | Interroge Steam, puis sauvegarde le monde et met à jour avec SteamCMD ; ils restent arrêtés             |
| **Arrêter, mettre à jour et redémarrer tout** | en ligne et arrêtés  | Serveurs en ligne : arrêt, mise à jour s'il y en a une, démarrage. Serveurs arrêtés : mise à jour seule |

Les serveurs sont traités **l'un après l'autre**, chacun avec ses propres réglages : la [sauvegarde avant chaque mise à jour](backups.fr.md#sauvegarde-avant-chaque-mise-à-jour) et l'annonce aux joueurs de sa page [Planification](scheduling.fr.md). L'échec d'un serveur n'arrête pas les autres.

La mise à jour est sautée (la ligne dit pourquoi) pour un serveur installé via la **bibliothèque Steam** (c'est Steam qui le met à jour), quand SteamCMD n'est pas installé, ou quand Steam ne répond pas. Si la sauvegarde ou la mise à jour échoue, le serveur reste arrêté.

### Joueurs connectés

Avant d'arrêter ou de redémarrer des serveurs, Nexum regarde qui est connecté. S'il y a au moins un joueur, une confirmation liste chaque serveur en ligne avec ses joueurs (« joueurs inconnus » pour un jeu où Nexum ne sait pas les compter : Enshrouded, Astroneer, RuneScape: Dragonwilds, Valheim sans [Odin-Eye](valheim-players.fr.md), Palworld sans l'API REST, ARK sans RCON).

**Prévenir les joueurs avant l'arrêt** (coché par défaut) : chaque serveur qui sait parler à ses joueurs (Palworld avec l'API REST, ARK avec RCON) envoie les annonces de sa page **Planification** **en même temps**, 30, 15… 1 minutes avant par défaut. Puis les serveurs sont arrêtés un par un, chacun avec sa dernière annonce juste avant. Les autres jeux s'arrêtent sans prévenir.

Quand personne n'est connecté, il n'y a ni confirmation ni annonce.

### Avancée

Une fenêtre affiche une ligne par serveur : en attente, en cours (étape en cours, avec le pourcentage de SteamCMD pendant une mise à jour), terminé, ou en échec avec **Voir les logs** (le serveur devient le serveur actif et la page Logs s'ouvre).

- **Fermer** : l'action continue. Une barre au-dessus de la liste en donne l'avancée, puis le bilan une fois terminée (elle reste jusqu'à **Masquer**, pour qu'un échec ne passe pas inaperçu) ; **Voir le détail** rouvre la fenêtre.
- **Arrêter après _nom_** : le serveur en cours se termine, les suivants sont passés. Pendant les annonces, le bouton devient **Annuler les annonces et l'action** : les comptes à rebours s'arrêtent aussitôt et aucun serveur n'est arrêté.
- Le menu **Tous les serveurs** reste grisé jusqu'à la fin de l'action. Un serveur occupé par un redémarrage planifié est passé.

Les logs de chaque serveur disent quelle action l'a traité (« Action sur tous les serveurs : … »), avec le compte rendu de la mise à jour ou la cause d'un échec, dans une courte session à part quand le serveur reste arrêté.

Quitter Nexum pendant une action : plus aucun serveur n'est démarré ni relancé. Si une mise à jour est en cours, Nexum demande s'il faut l'attendre (quitter interromprait SteamCMD).
