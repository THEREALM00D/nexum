# Installation

🇬🇧 [English](installation.md) | 🇫🇷 Français

## Prérequis

- **Windows 10 ou 11** (64 bits)
- Pas besoin des droits administrateur : Windows demande seulement une confirmation (UAC) quand vous modifiez les règles du pare-feu
- **~10 GB d'espace disque** pour SteamCMD + le serveur Palworld
- Connexion Internet pour le téléchargement initial

## Installer Nexum

1. Téléchargez `nexum-{version}-setup.exe` depuis la page [Releases](https://github.com/THEREALM00D/nexum/releases)
2. Lancez l'installateur. Si Windows SmartScreen affiche « Windows a protégé votre ordinateur », cliquez sur **Informations complémentaires → Exécuter quand même** (l'installeur n'est pas encore signé ; vous pouvez vérifier son empreinte SHA256, indiquée dans les notes de release)
3. Un raccourci est créé sur le bureau

> ⚠️ **Ne rangez pas vos serveurs ni vos sauvegardes dans le dossier d'installation de Nexum** (par exemple `H:\Nexum`). Jusqu'à la version 0.12.3, chaque mise à jour de Nexum vidait entièrement ce dossier, y compris les fichiers que vous y aviez ajoutés (des mondes Valheim ont été perdus ainsi). Les versions suivantes ne suppriment plus que leurs propres fichiers, mais choisissez quand même un dossier à part, par exemple `H:\ValheimSaves`. Nexum affiche un avertissement sous les champs de dossier (serveur, sauvegardes Valheim, backups) qui pointent dans son dossier d'installation.

> **« Nexum cannot be closed » pendant une mise à jour depuis la 0.12.4 ou la 0.12.5**, alors que Nexum est fermé : cela arrive quand Nexum est installé sur un autre lecteur que `C:` (par exemple `H:\Nexum`). Cliquez sur **Cancel** : la version installée reste intacte. Installez plutôt la 0.12.6 ou une version plus récente, qui corrige le problème. Si vous restez bloqué avec un ancien installeur, désinstallez Nexum depuis les Paramètres de Windows (vos serveurs et réglages sont conservés), puis installez la nouvelle version.

## Mettre à jour Nexum

Nexum vérifie au démarrage s'il existe une nouvelle version (en bas de la barre latérale, ou **Paramètres → Mises à jour**). Le téléchargement et l'installation se font seulement quand vous cliquez.

### Versions bêta

Pour tester les nouveautés avant leur sortie, activez **Paramètres → Mises à jour → Recevoir les versions bêta** (désactivé par défaut). Nexum vous propose alors aussi les versions bêta (`0.17.0-beta.1`, par exemple), puis la version stable quand elle sort.

- Une bêta peut contenir des bugs : sauvegardez vos mondes avant de l'installer, et signalez les problèmes sur [Discord](https://discord.gg/DbJ3WkK5QU) en précisant le numéro de version.
- Si vous désactivez l'option alors qu'une bêta est installée, vous la gardez jusqu'à la prochaine version stable, que Nexum vous proposera normalement.
- Les bêtas sont aussi sur la page [Releases](https://github.com/THEREALM00D/nexum/releases), marquées **Pre-release**.

## Première utilisation

### Assistant de démarrage

Au premier lancement (aucun serveur), Nexum ouvre un **assistant de démarrage** qui vous guide dans tout ce qui suit, dans l'ordre :

1. **Jeu** : choisissez Palworld, Valheim, Astroneer ou RuneScape: Dragonwilds, puis **Installer un nouveau serveur** (choisissez le dossier d'installation) ou **J'ai déjà un serveur** (choisissez son dossier : Nexum détecte le jeu).
2. **Installation** (nouveau serveur seulement) : installez SteamCMD, puis le serveur.
3. **Configuration** : nom du serveur, mot de passe, paramètres du monde. Enregistrez avant de continuer.
4. **Pare-feu** : appliquez les règles du pare-feu Windows.
5. **Démarrage** : démarrez le serveur et copiez l'adresse à donner à vos amis.

**Passer** ferme l'assistant à tout moment ; tout reste accessible depuis le menu de gauche. Pour configurer un autre serveur plus tard : **Serveurs → Assistant de démarrage**. Les étapes ci-dessous décrivent la même chose à la main.

### 1. Installer SteamCMD

SteamCMD est l'utilitaire officiel de Valve pour télécharger les serveurs Steam.

- Ouvrez Nexum
- Allez dans **Installation** dans la barre latérale
- Cliquez sur **Installer SteamCMD**
- Nexum télécharge et configure SteamCMD automatiquement (logs visibles en bas)

### 2. Installer le serveur Palworld

- Choisissez un dossier de destination (par défaut `C:\PalworldServer`)
  - Évitez les dossiers protégés (`Program Files`, `Windows`) qui peuvent poser des problèmes de permissions
  - Préférez un dossier dédié sur un disque rapide (SSD recommandé)
- Cliquez sur **Installer Palworld**
- Le téléchargement prend environ 5-15 minutes selon votre connexion (~3 GB)

### 3. Configuration initiale (optionnel mais recommandé)

Avant de démarrer le serveur la première fois :

- Allez dans **Configuration**
- Définissez :
  - **Nom du serveur** (`ServerName`)
  - **Mot de passe administrateur** (`AdminPassword`) — important pour l'API REST
  - **Mot de passe serveur** (`ServerPassword`) — optionnel, pour serveur privé
- Activez **API REST** (`RESTAPIEnabled`) pour bénéficier de l'arrêt gracieux et de la gestion des joueurs

> Voir [configuration.fr.md](configuration.fr.md) pour le détail des options.

### 4. Activer le firewall

- Allez dans **Réseau**
- Cliquez sur **Tout activer** pour créer les règles firewall (Game UDP, RCON, REST API)

### 5. Premier démarrage

- Allez dans **Dashboard**
- Cliquez sur **Démarrer**
- Le statut passe à **En ligne** quand le serveur est prêt

## Ajouter un serveur déjà installé

Si un serveur dédié est déjà installé sur votre machine (à la main, avec SteamCMD ou avec un autre outil), inutile de le réinstaller :

- Allez dans **Serveurs** et cliquez sur **Ajouter un serveur**
- Cliquez sur l'icône de dossier et choisissez le dossier du serveur (celui qui contient `PalServer.exe`, `valheim_server.exe`, `AstroServer.exe` ou `RSDragonwildsServer.exe`)
- Le jeu est détecté automatiquement, et une indication sous le chemin confirme que l'exécutable du serveur a été trouvé (ou prévient s'il est absent — vérifiez le dossier ou le jeu)
- Palworld, Astroneer et Dragonwilds : vos réglages `.ini` existants sont relus tels quels (Dragonwilds : voir [sa page](dragonwilds.fr.md) pour le Player ID et les mondes)
- Valheim : les mondes existants sont détectés. S'il n'y en a qu'un, il est sélectionné automatiquement ; sinon choisissez-le parmi les suggestions du champ **Nom du monde** dans **Configuration** — le nom doit correspondre exactement, sinon Valheim crée un nouveau monde vide

## Démarrage automatique

Pour que vos serveurs repartent tout seuls après un redémarrage du PC :

1. Dans **Serveurs**, modifiez un serveur et cochez **Démarrer automatiquement à l'ouverture de Nexum**. Répétez pour chaque serveur à démarrer.
2. Dans **Paramètres**, activez **Lancer Nexum au démarrage de Windows** (disponible seulement dans l'application installée).

À l'ouverture de votre session Windows, Nexum démarre en arrière-plan (son icône près de l'horloge, voir plus bas) et démarre les serveurs cochés, à quelques secondes d'intervalle. Un serveur déjà en cours est laissé tel quel. Les mêmes vérifications qu'un démarrage manuel s'appliquent (conflits de ports, règles du mot de passe Valheim, Player ID Dragonwilds) : si un serveur ne peut pas démarrer, la raison est écrite dans ses logs.

## Relance après un plantage

Dans **Serveurs**, modifiez un serveur et cochez **Relancer automatiquement après un plantage** : quand le serveur s'arrête seul avec une erreur, Nexum le redémarre 10 secondes plus tard, avec les mêmes vérifications qu'un démarrage manuel. Un serveur qui s'arrête normalement, ou que vous arrêtez vous-même, n'est pas relancé.

Pour ne pas boucler sur un serveur qui plante dès le démarrage (monde corrompu, mod cassé), Nexum abandonne après 3 plantages en 30 minutes et l'écrit dans les logs. Cherchez la cause (voir [Logs → Diagnostic](logs.fr.md#diagnostic)), puis démarrez le serveur vous-même.

Le monde repart de la dernière sauvegarde faite par le jeu : Nexum ne peut pas sauvegarder un monde pendant que le jeu plante.

## Fonctionnement en arrière-plan (icône près de l'horloge)

Fermer la fenêtre de Nexum ne le quitte pas : Nexum continue de tourner dans la **zone de notification** de Windows, près de l'horloge, pour que les sauvegardes automatiques, les redémarrages planifiés et les logs des serveurs continuent. La première fois, une notification Windows vous le rappelle.

- **Clic** sur l'icône : la fenêtre revient.
- **Clic droit** : l'état de chaque serveur, avec **Démarrer**, **Arrêter** ou **Redémarrer**, et **Quitter Nexum**.
- Si l'icône n'est pas visible, cliquez sur la flèche **^** à côté de l'horloge : Windows y range certaines icônes. Vous pouvez la glisser près de l'horloge pour la garder visible.
- Rouvrir Nexum (raccourci, menu Démarrer) ramène la fenêtre déjà ouverte au lieu de lancer une deuxième copie.

Pour que fermer la fenêtre quitte Nexum, désactivez **Paramètres → Garder Nexum dans la zone de notification à la fermeture**. Dans ce cas, Nexum lancé avec Windows démarre réduit dans la barre des tâches.

## Mise à jour du serveur

Un serveur en retard d'une version refuse les joueurs qui ont mis leur jeu à jour. À chaque démarrage d'un serveur (bouton **Démarrer** ou démarrage automatique), Nexum vérifie donc en arrière-plan s'il est à jour :

- Le démarrage n'attend pas cette vérification : si Steam ne répond pas, le serveur démarre normalement et rien n'est signalé.
- Si une mise à jour existe, une notification l'indique, avec un bouton **Mettre à jour** qui ouvre la page **Installation** de ce serveur. Le résultat est aussi écrit dans ses logs (pratique après un démarrage avec Windows, quand personne ne regarde l'écran).
- Serveur installé via la **bibliothèque Steam** (dans `steamapps\common`) : c'est Steam qui le met à jour, la notification vous le rappelle. Si vous le mettez plutôt à jour depuis la page **Installation** de Nexum, Nexum le détecte aussi (jusqu'à la 0.12.4, il continuait d'annoncer la mise à jour). La vérification nécessite que SteamCMD soit installé (page **Installation**).

Pour mettre à jour (le serveur doit être arrêté) :

- Allez dans **Installation**
- Cliquez sur **Vérifier** pour comparer la version installée et la version Steam
- Si une mise à jour est disponible, cliquez sur **Mettre à jour**

Avant de lancer SteamCMD, Nexum sauvegarde le monde (option **Sauvegarder le monde avant chaque mise à jour** de la page **Sauvegardes**, activée par défaut, voir [Sauvegardes](backups.fr.md#sauvegarde-avant-chaque-mise-à-jour)). Pour que le serveur se mette à jour tout seul, activez **Mettre à jour le jeu au moment du redémarrage** dans la page [Planification](scheduling.fr.md).

## Dépannage

### Le serveur Valheim s'arrête quelques secondes après le démarrage

- **Mot de passe** : Valheim refuse de démarrer si le mot de passe fait moins de 5 caractères ou s'il apparaît dans le nom du serveur. Nexum bloque alors le démarrage et indique lequel des deux. Attention : Nexum lance le serveur avec les réglages de sa page **Configuration**, pas avec ceux de votre propre script `.bat` : après l'import d'un serveur existant, vérifiez-y le nom du serveur, le monde et le mot de passe.
- **Identifiant Steam** : Nexum définit `SteamAppId=892970` au lancement du serveur, comme le script officiel `start_headless_server.bat` (depuis la 0.4.3). Avec une version plus ancienne, mettez Nexum à jour.
- **Les lignes `[ERR]`** `Setting breakpad minidump AppID` et `SteamInternal_SetMinidumpSteamID … [API loaded no]` sont des messages de démarrage normaux de Valheim, pas la cause : regardez les dernières lignes avant l'arrêt du serveur.

## Désinstallation

Utilisez le panneau de configuration Windows ou exécutez `Uninstall Nexum.exe` dans le dossier d'installation.

> Les fichiers des serveurs et les sauvegardes ne sont **pas** supprimés automatiquement. Le désinstalleur ne retire que les fichiers de Nexum : ce que vous avez ajouté dans son dossier d'installation reste en place (depuis la version qui suit la 0.12.3).
