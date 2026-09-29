# ServerForge

🇬🇧 [English](README.md) | 🇫🇷 Français

> ⚠️ **Le nom et le logo actuels sont temporaires.** Le branding définitif du projet n'est pas encore arrêté.

Gestionnaire de bureau pour serveurs dédiés de jeux vidéo. Compatible avec **Palworld**, **Valheim** et **Astroneer**.

![Plateforme](https://img.shields.io/badge/platform-Windows-blue)
![Licence](https://img.shields.io/badge/license-GPL--3.0-blue)

## Fonctionnalités

- **Installation automatique** de SteamCMD et du serveur Palworld
- **Démarrage / arrêt / redémarrage** avec sauvegarde gracieuse via l'API REST
- **Surveillance temps réel** : CPU, RAM, uptime, FPS serveur, joueurs en ligne
- **Éditeur de configuration** INI avec presets de difficulté (Casual / Normal / Hard)
- **Gestion des joueurs** : kick, ban, unban directement depuis le dashboard
- **Gestion du firewall Windows** (règles automatiques + personnalisées)
- **Sauvegardes** automatiques planifiables avec rotation
- **Redémarrage planifié** quotidien avec annonce et sauvegarde
- **Vérification des mises à jour** Palworld via SteamCMD
- **Logs en temps réel** du processus serveur

## Captures d'écran

<table>
  <tr>
    <td><img src="docs/images/dashboard.png" alt="Dashboard" width="420"/><br/><sub>Dashboard</sub></td>
    <td><img src="docs/images/mods.png" alt="Mods" width="420"/><br/><sub>Mods (Thunderstore & Hexium)</sub></td>
  </tr>
  <tr>
    <td><img src="docs/images/configuration.png" alt="Configuration du serveur" width="420"/><br/><sub>Configuration du serveur</sub></td>
    <td><img src="docs/images/network.png" alt="Règles de pare-feu" width="420"/><br/><sub>Règles de pare-feu</sub></td>
  </tr>
  <tr>
    <td><img src="docs/images/players.png" alt="Historique des joueurs" width="420"/><br/><sub>Historique des joueurs</sub></td>
    <td></td>
  </tr>
</table>

## Installation

Téléchargez la dernière version depuis [Releases](https://github.com/THEREALM00D/server-forge/releases) :

- **Installateur** : `server-forge-{version}-setup.exe`
- **Portable** : `server-forge-{version}-portable.exe`

> L'application requiert les **droits administrateur** pour gérer les règles du firewall Windows.

## Démarrage rapide

1. Lancez **ServerForge**
2. Allez dans **Installation**
3. Cliquez sur **Installer SteamCMD** (téléchargement automatique)
4. Choisissez un dossier de destination et installez le serveur du jeu souhaité
5. Allez dans **Dashboard** et cliquez sur **Démarrer**

Voir [docs/installation.fr.md](docs/installation.fr.md) pour le guide complet.

## Documentation

- [Installation](docs/installation.fr.md)
- [Dashboard](docs/dashboard.fr.md)
- [Configuration du serveur](docs/configuration.fr.md)
- [Réseau et firewall](docs/network.fr.md)
- [Sauvegardes](docs/backups.fr.md)
- [Planification](docs/scheduling.fr.md)
- [Logs](docs/logs.fr.md)
- [Suivi des joueurs Valheim (Odin-Eye)](docs/valheim-players.fr.md)
- [Architecture technique](CLAUDE.md)

## Stack technique

- Electron 31, React 19, MUI 9, TypeScript 6, Vite 5

## Licence

Open source sous licence [GNU General Public License v3.0 ou ultérieure](LICENSE). Vous êtes libre d'utiliser, étudier, modifier et partager le logiciel ; toute version modifiée que vous distribuez doit rester open source sous la même licence.

## Contribuer

La branche `main` est protégée : toute contribution passe par une Pull Request, et seul le mainteneur du projet peut la merger.

Les titres de PR doivent suivre [Conventional Commits](https://www.conventionalcommits.org/) (`feat: …`, `fix: …`, `chore: …`), ce qui est vérifié en CI. Les versions et le [CHANGELOG](CHANGELOG.md) sont générés à partir de ces titres par [release-please](https://github.com/googleapis/release-please-action) : `fix` fait monter la version patch, `feat` la version mineure, et une release est publiée en mergeant la PR de release qu'il ouvre.
