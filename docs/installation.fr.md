# Installation

🇬🇧 [English](installation.md) | 🇫🇷 Français

## Prérequis

- **Windows 10 ou 11** (64 bits)
- **Droits administrateur** (requis pour la gestion du firewall et l'exécution du serveur)
- **~10 GB d'espace disque** pour SteamCMD + le serveur Palworld
- Connexion Internet pour le téléchargement initial

## Installer ServerForge

1. Téléchargez `server-forge-{version}-setup.exe` depuis la page [Releases](https://github.com/THEREALM00D/server-forge/releases)
2. Lancez l'installateur (acceptez l'élévation administrateur)
3. Un raccourci est créé sur le bureau

## Première utilisation

### 1. Installer SteamCMD

SteamCMD est l'utilitaire officiel de Valve pour télécharger les serveurs Steam.

- Ouvrez ServerForge
- Allez dans **Installation** dans la barre latérale
- Cliquez sur **Installer SteamCMD**
- ServerForge télécharge et configure SteamCMD automatiquement (logs visibles en bas)

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

## Désinstallation

Utilisez le panneau de configuration Windows ou exécutez `Uninstall ServerForge.exe` dans le dossier d'installation.

> Les fichiers du serveur Palworld et les sauvegardes ne sont **pas** supprimés automatiquement.
