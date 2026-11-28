# ARK: Survival Ascended

🇬🇧 [English](ark.md) | 🇫🇷 Français

Nexum fait tourner le serveur officiel **ARK: Survival Ascended Dedicated Server** (gratuit, application Steam 2430930). Cette page décrit ce qui est propre à ARK ; les autres pages ([installation](installation.fr.md), [réseau](network.fr.md), [sauvegardes](backups.fr.md)…) s'appliquent comme d'habitude.

## Installation

Passez par l'assistant de démarrage (ou **Serveurs → Ajouter un serveur**) et choisissez **ARK: Survival Ascended** :

- **Installer un nouveau serveur** : Nexum télécharge le serveur avec SteamCMD (environ 13 Go).
- **J'ai déjà un serveur** : choisissez le dossier qui contient `ShooterGame` (Nexum cherche `ShooterGame\Binaries\Win64\ArkAscendedServer.exe`). Nexum reprend la carte, les ports, les mods et les options de l'ancienne ligne de lancement : voir [Passer un serveur ARK existant à Nexum](ark-import.fr.md).

Configuration requise : Windows 64 bits et un PC puissant. Le serveur prend environ **10 Go de RAM** à lui seul une fois démarré, sans joueur connecté ; prévoyez **20 Go** d'espace disque libre.

Après **Démarrer**, le serveur met une à deux minutes à être prêt : attendez la ligne `Server has completed startup and is now advertising for join` dans la page **Logs**.

## Configuration

La page **Configuration** a quatre onglets : **Général**, **Réglages de jeu**, **Listes** et **Fichiers bruts**.

### Général

Les réglages essentiels, venant de deux endroits :

| Section                 | Contenu                                                                                     | Où c'est écrit                   |
| ----------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| Serveur                 | Nom de session, carte, joueurs max, mode PvE                                                | Fichier INI et ligne de commande |
| Accès et administration | Mot de passe du serveur, mot de passe admin, RCON                                           | `GameUserSettings.ini`           |
| Réseau                  | Port de jeu (UDP 7777), port de requête (UDP 27015), port RCON (TCP 27020)                  | Ligne de commande                |
| Avancé                  | BattlEye, dossier du monde (`AltSaveDirectoryName`), arguments de lancement supplémentaires | Ligne de commande                |

`GameUserSettings.ini` se trouve dans `ShooterGame\Saved\Config\WindowsServer`. Le nom de session, les mots de passe, le mode PvE et RCON y sont écrits ; la carte, les joueurs max, les ports et BattlEye passent par la ligne de commande. Les joueurs max ne fonctionnent que sur la ligne de commande : le serveur ignore et réécrit la valeur du fichier INI.

**Cartes** : The Island, The Center, Scorched Earth, Aberration, Extinction, Ragnarok, Valguero, Lost Colony, Astraeos et Genesis: Part 1. Chaque carte a son propre monde : changer de carte ne supprime pas le précédent. Certaines cartes sont payantes : les joueurs doivent les posséder.

**Carte moddée** (par exemple Svartalfheim) : tapez son nom exact dans le champ **Carte** (`Svartalfheim_WP` ; la description CurseForge de la carte le donne en général) et ajoutez le mod de la carte dans la page [**Mods**](#mods). Lettres, chiffres et `_` seulement.

**Ne mettez jamais de mot de passe dans les arguments supplémentaires** : le serveur recopie toute sa ligne de commande dans son journal.

### Réglages de jeu

Tous les réglages d'ARK: Survival Ascended (environ 380), rangés par thème : taux et difficulté, joueurs, créatures, élevage, structures, PvP et PvE, tribus, monde et jour/nuit, fabrication, transferts, cryopods et bunkers, administration, interface, et options de lancement. Recherche par nom, description ou clé ; survolez l'icône ⓘ pour la description et la valeur par défaut du jeu.

- Un réglage laissé **vide** garde la valeur par défaut du jeu et n'est **pas écrit** dans les fichiers. Un point vert signale un réglage écrit ; le bouton ↺ le remet à sa valeur par défaut (la ligne est retirée).
- Seuls les réglages que vous modifiez sont écrits : le reste des fichiers (clés inconnues, sections des mods) ne bouge pas.
- Les **options de lancement** (`-ServerPlatform`, `-clusterid`…) sont ajoutées à la ligne de commande. Si la même option est déjà dans les arguments de lancement supplémentaires (onglet Général), c'est celle-ci qui l'emporte. Leurs valeurs ne peuvent contenir ni espace ni guillemet.
- **Autres réglages** : réglages trouvés dans les fichiers que Nexum ne connaît pas encore (ajoutés par une mise à jour du jeu ou à la main). Vous pouvez changer leur valeur.
- **Mod : [Section]** : un groupe par section de mod de `GameUserSettings.ini` et `Game.ini` (`[ArkadeEssentials]`, `[Shiny]`…), avec ses réglages un par un. Nexum ne vérifie pas ces valeurs : la documentation du mod dit ce que chaque clé attend. Les listes (clés écrites plusieurs fois) restent dans **Fichiers bruts**.

### Listes

Les listes de `Game.ini`, enregistrées chacune à part :

- **Stats par niveau** : multiplicateur de chaque point de stat, pour les joueurs, les créatures sauvages et apprivoisées. Ne mettez pas 0 (le jeu le remplace par 1) : 0,01 désactive presque le gain.
- **Tailles de pile** : taille de pile par classe d'objet (`PrimalItemResource_Stone_C`…), avec ou sans le multiplicateur général.
- **Engrammes** : masquer un engramme, changer son coût ou son niveau, retirer son prérequis ; déblocages automatiques ; points d'engramme par niveau ; « seulement les engrammes de la liste ».
- **Spawns** : ajouter, retirer ou remplacer les créatures d'une zone d'apparition (`DinoSpawnEntriesBeach_C`…), poids d'apparition par créature, remplacer une créature par une autre.

Enregistrer une liste réécrit ses entrées : les champs que Nexum ne modifie pas (chances d'apparition, couleurs…) sont gardés, seule la présentation peut changer (`true` devient `True`). Une entrée que Nexum ne sait pas lire est gardée telle quelle et reste modifiable dans **Fichiers bruts**.

### Fichiers bruts

`GameUserSettings.ini` ou `Game.ini` tels quels, pour tout ce que les autres onglets ne couvrent pas (autres listes de `Game.ini`, sections des mods).

### Avant d'enregistrer

**Arrêtez le serveur avant de changer la configuration** : le serveur réécrit `GameUserSettings.ini` et `Game.ini` quand il s'arrête, avec les valeurs lues au démarrage (testé). Nexum bloque tous les onglets tant que le serveur tourne, et les changements s'appliquent au prochain démarrage. Avant chaque enregistrement, le fichier précédent est gardé en `.backup` (`GameUserSettings.ini.backup`, `Game.ini.backup`).

Nexum lit les clés sans tenir compte de la casse, comme le jeu : `serverPVE=True` écrit à la main est le même réglage que `ServerPVE`.

## Mods

La page **Mods** gère les mods [CurseForge](https://www.curseforge.com/ark-survival-ascended) du serveur :

- Onglet **Parcourir CurseForge** : cherchez des mods par nom, triez-les (popularité, mis à jour récemment, téléchargements, nom), filtrez par catégorie (Cartes, Créatures, Structures…) et cliquez sur **Ajouter**. Les mods marqués **Cosmétique** sont réservés aux joueurs : ils ne s'installent pas sur un serveur et l'empêchent de démarrer (testé), ils ne peuvent donc pas être ajoutés. Les mods marqués **PC seulement** ne sont pas cross-plateforme : un serveur est cross-plateforme par défaut et ne démarre pas avec eux (testé) ; ils ne fonctionnent qu'avec **Plateformes acceptées** sur `PC` (page Configuration, onglet **Réglages de jeu**, options de lancement), et les joueurs sur console ne peuvent alors plus rejoindre.
- **Ajoutez** un mod avec son **Project ID** : le nombre affiché sur la page CurseForge du mod, dans _About Project_ (l'adresse de la page ne le contient pas).
- L'**ordre** de la liste est l'ordre de chargement (flèches). Un mod **désactivé** reste dans la liste mais n'est pas chargé.
- **Recherchez** dans la liste par nom, auteur ou ID ; le compteur indique combien de mods correspondent. Pendant une recherche, les flèches déplacent toujours le mod dans la liste complète.
- Nexum écrit seulement la liste sur la ligne de commande (`-mods=`) : **le serveur télécharge les mods et les met à jour lui-même à chaque démarrage**, en quelques secondes pour de petits mods. Une modification faite serveur lancé s'applique au prochain démarrage.
- Les joueurs n'installent rien : le jeu télécharge les mods du serveur quand ils le rejoignent.
- Une fois un mod téléchargé par le serveur, la page affiche son nom, son logo, son auteur et le fichier installé. Avant, Nexum demande son nom et son logo à CurseForge, et vérifie qu'un ID ajouté existe.

⚠️ Un ID de mod inconnu **empêche le serveur de démarrer** (`Mods not installed` dans les logs). Retirer un mod retire aussi du monde ce qu'il ajoutait (créatures, structures, objets) : faites d'abord une [sauvegarde](backups.fr.md).

Le serveur garde les fichiers d'un mod retiré de la liste : il apparaît dans **Téléchargés par le serveur, pas dans la liste**, en bas de la liste, d'où vous pouvez le rajouter. C'est aussi là qu'apparaissent les mods d'un serveur existant après son premier démarrage dans Nexum. Des mods déjà écrits dans les arguments de lancement supplémentaires (`-mods=…`) sont signalés, avec un bouton pour les déplacer dans la liste.

## RCON

RCON est la console d'administration à distance du serveur. Nexum en a besoin pour :

- arrêter le serveur proprement : le monde est sauvegardé avant que le serveur ne quitte ;
- sauvegarder le monde juste avant une [sauvegarde](backups.fr.md) d'un serveur lancé ;
- prévenir les joueurs dans le chat du jeu avant un [redémarrage planifié](scheduling.fr.md) (le message est envoyé sans accents : le jeu ne sait pas les afficher) ;
- lister les joueurs connectés dans la page **Joueurs** ;
- renouveler les créatures sauvages après chaque démarrage ou toutes les quelques heures (`DestroyWildDinos`, page [Planification](scheduling.fr.md#créatures-sauvages-ark)).

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

Le monde est dans `ShooterGame\Saved\SavedArks\<carte>` (par exemple `TheIsland_WP\TheIsland_WP.ark`), ou dans `ShooterGame\Saved\<dossier du monde>\<carte>` quand le champ **Dossier du monde** (Configuration → Général, Avancé) est rempli. Le jeu y garde aussi jusqu'à 4 copies complètes du monde (fichiers `.arkrbf`) et une copie anti-corruption (`.bak`). Les [sauvegardes](backups.fr.md) de Nexum laissent ces copies de côté : une sauvegarde ne contient que le monde lui-même, environ 6 fois plus petite. Les profils des joueurs (`<EOS ID>.arkprofile`) peuvent aussi être sauvegardés à part et restaurés un joueur à la fois : voir [ARK : profils des joueurs](backups.fr.md#ark--profils-des-joueurs).

Bon à savoir : un serveur démarré par Nexum s'arrête quand Nexum se ferme. Nexum vous le demande d'abord et l'arrête proprement (voir [Quitter Nexum avec des serveurs en ligne](installation.fr.md#quitter-nexum-avec-des-serveurs-en-ligne)).

## Logs

Nexum suit le journal du jeu lui-même (`ShooterGame\Saved\Logs\ShooterGame.log`) : le serveur n'écrit rien d'utile dans sa console. Les lignes de débogage du module de statistiques du jeu sont masquées à l'écran, et les messages Steam habituels d'un serveur dédié ne sont pas affichés comme des erreurs. Le fichier de la session et l'export (**Copier**, **Enregistrer**) contiennent tout. Quand vous copiez ou enregistrez un log pour un rapport de bug, les IP publiques, les identifiants des joueurs et les mots de passe trouvés dans la ligne de commande sont masqués.

## Joueurs

Avec RCON activé, la page **Joueurs** liste les joueurs connectés et garde leur historique (première et dernière connexion, temps de jeu), comme pour Palworld, et le Dashboard affiche le nombre de joueurs connectés. Avec RCON désactivé, le Dashboard et la page **Planification** vous préviennent et proposent de l'activer (serveur arrêté).
