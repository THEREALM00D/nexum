# Code signing policy and privacy

🇬🇧 English | 🇫🇷 [Français](code-signing.fr.md)

## Code signing policy

Free code signing provided by [SignPath.io](https://signpath.io), certificate by [SignPath Foundation](https://signpath.org).

> **Status:** application in progress. Until it is approved, Windows binaries are **not signed** and Windows SmartScreen may warn about them. Each release lists the SHA256 of its files (and, when available, VirusTotal analysis links) so you can check your download.

- Only binaries built by this repository's GitHub Actions workflow (`.github/workflows/release.yml`), from the source code of this repository, are signed.
- Every release is approved manually before it is signed.
- Signed binaries carry the product name (Nexum) and version in their file metadata.

### Team roles

| Role                     | Members                                       |
| ------------------------ | --------------------------------------------- |
| Committers and reviewers | [THEREALM00D](https://github.com/THEREALM00D) |
| Approvers                | [THEREALM00D](https://github.com/THEREALM00D) |

All accounts use multi-factor authentication on GitHub and SignPath.

## Privacy

Nexum has **no telemetry, no analytics and no account**. It does not collect or send any personal data.

It only connects to the following services, to provide the feature named next to each:

| Service                                                               | When                                                                | Why                                                                                 |
| --------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| GitHub (`github.com`)                                                 | At startup, and when you click "Check for updates"                  | Check for a new Nexum version. Downloading and installing it is always your choice. |
| Steam (`steamcdn-a.akamaihd.net` and Steam servers, through SteamCMD) | When you install or update SteamCMD or a game server                | Download SteamCMD and the dedicated server files.                                   |
| Thunderstore (`thunderstore.io`) and Hexium (`hexium.gg`)             | When you open the Valheim Mods page, browse, install or update mods | List, download and check mods, and show their icons.                                |

Connections to `127.0.0.1` (the Palworld REST API, the Odin-Eye plugin) stay on your computer.

The game servers that Nexum starts are separate programs: their own network traffic is governed by each game's publisher.
