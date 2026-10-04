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

## Première utilisation

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
- Cliquez sur l'icône de dossier et choisissez le dossier du serveur (celui qui contient `PalServer.exe`, `valheim_server.exe` ou `AstroServer.exe`)
- Le jeu est détecté automatiquement, et une indication sous le chemin confirme que l'exécutable du serveur a été trouvé (ou prévient s'il est absent — vérifiez le dossier ou le jeu)
- Palworld et Astroneer : vos réglages `.ini` existants sont relus tels quels
- Valheim : les mondes existants sont détectés. S'il n'y en a qu'un, il est sélectionné automatiquement ; sinon choisissez-le parmi les suggestions du champ **Nom du monde** dans **Configuration** — le nom doit correspondre exactement, sinon Valheim crée un nouveau monde vide

## Mise à jour du serveur Palworld

Quand une mise à jour Palworld est disponible :

- Allez dans **Installation**
- Cliquez sur **Vérifier** pour comparer la version installée et la version Steam
- Si une mise à jour est disponible, cliquez sur **Mettre à jour Palworld**

## Dépannage

### Le serveur Valheim s'arrête quelques secondes après le démarrage

- **Mot de passe** : Valheim refuse de démarrer si le mot de passe fait moins de 5 caractères ou s'il apparaît dans le nom du serveur. Nexum bloque alors le démarrage et indique lequel des deux. Attention : Nexum lance le serveur avec les réglages de sa page **Configuration**, pas avec ceux de votre propre script `.bat` : après l'import d'un serveur existant, vérifiez-y le nom du serveur, le monde et le mot de passe.
- **Identifiant Steam** : Nexum définit `SteamAppId=892970` au lancement du serveur, comme le script officiel `start_headless_server.bat` (depuis la 0.4.3). Avec une version plus ancienne, mettez Nexum à jour.
- **Les lignes `[ERR]`** `Setting breakpad minidump AppID` et `SteamInternal_SetMinidumpSteamID … [API loaded no]` sont des messages de démarrage normaux de Valheim, pas la cause : regardez les dernières lignes avant l'arrêt du serveur.

## Désinstallation

Utilisez le panneau de configuration Windows ou exécutez `Uninstall Nexum.exe` dans le dossier d'installation.

> Les fichiers du serveur Palworld et les sauvegardes ne sont **pas** supprimés automatiquement.
