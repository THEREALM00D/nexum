# ServerForge

🇬🇧 English | 🇫🇷 [Français](README.fr.md)

> ⚠️ **The current name and logo are temporary.** The project's final branding has not been decided yet.

Desktop manager for dedicated game servers. Compatible with **Palworld**, **Valheim**, and **Astroneer**.

![Platform](https://img.shields.io/badge/platform-Windows-blue)
![License](https://img.shields.io/badge/license-proprietary-red)

## Features

- **Automatic installation** of SteamCMD and the game server
- **Start / stop / restart** with graceful shutdown via the REST API
- **Real-time monitoring**: CPU, RAM, uptime, server FPS, online players
- **INI configuration editor** with difficulty presets (Casual / Normal / Hard)
- **Player management**: kick, ban, unban directly from the dashboard
- **Windows firewall management** (automatic + custom rules)
- **Scheduled automatic backups** with rotation
- **Daily scheduled restart** with in-game announcement and save
- **Update checking** via SteamCMD
- **Real-time logs** of the server process

## Screenshots

<table>
  <tr>
    <td><img src="docs/images/dashboard.png" alt="Dashboard" width="420"/><br/><sub>Dashboard</sub></td>
    <td><img src="docs/images/mods.png" alt="Mods" width="420"/><br/><sub>Mods (Thunderstore & Hexium)</sub></td>
  </tr>
  <tr>
    <td><img src="docs/images/configuration.png" alt="Server configuration" width="420"/><br/><sub>Server configuration</sub></td>
    <td><img src="docs/images/network.png" alt="Firewall rules" width="420"/><br/><sub>Firewall rules</sub></td>
  </tr>
  <tr>
    <td><img src="docs/images/players.png" alt="Player history" width="420"/><br/><sub>Player history</sub></td>
    <td></td>
  </tr>
</table>

## Installation

Download the latest version from [Releases](https://github.com/THEREALM00D/server-forge/releases):

- **Installer**: `server-forge-{version}-setup.exe`
- **Portable**: `server-forge-{version}-portable.exe`

> The application requires **administrator rights** to manage Windows firewall rules.

## Quick start

1. Launch **ServerForge**
2. Go to **Install**
3. Click **Install SteamCMD** (automatic download)
4. Choose a destination folder and install the server for your game — or, if it is already installed, go to **Servers → Add server** and pick its folder
5. Go to **Dashboard** and click **Start**

See [docs/installation.md](docs/installation.md) for the full guide.

## Documentation

- [Installation](docs/installation.md)
- [Dashboard](docs/dashboard.md)
- [Server configuration](docs/configuration.md)
- [Network & firewall](docs/network.md)
- [Backups](docs/backups.md)
- [Scheduling](docs/scheduling.md)
- [Logs](docs/logs.md)
- [Valheim player tracking (Odin-Eye)](docs/valheim-players.md)
- [Technical architecture](CLAUDE.md)

## Tech stack

- Electron 44, React 19, MUI 9, TypeScript 6, Vite 5

## License

Proprietary — all rights reserved. See [LICENSE](LICENSE). This code is not open-source: making it publicly visible during the alpha does not grant any right to use, copy, or redistribute it.

## Contributing

The `main` branch is protected: all contributions go through a Pull Request, and only the project maintainer can merge it.

PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat: …`, `fix: …`, `chore: …`), which is checked in CI. Versions and the [CHANGELOG](CHANGELOG.md) are generated from these titles by [release-please](https://github.com/googleapis/release-please-action): `fix` bumps the patch version, `feat` bumps the minor version, and releases are published by merging the release PR it opens.
