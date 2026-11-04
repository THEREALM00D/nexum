# Enshrouded

🇬🇧 English | 🇫🇷 [Français](enshrouded.fr.md)

Nexum runs the official **Enshrouded Dedicated Server** (free, Steam app 2278520). This page covers what is specific to Enshrouded; the other pages ([installation](installation.md), [network](network.md), [backups](backups.md)…) apply as usual.

## Install

Use the setup wizard (or **Servers → Add server**) and pick **Enshrouded**:

- **Install a new server**: Nexum downloads the server with SteamCMD (about 8 GB).
- **I already have a server**: choose the folder that contains `enshrouded_server.exe` (the "Enshrouded Dedicated Server" folder of the Steam **Tools** works too).

Requirements: 64-bit Windows and a solid PC. The server uses about **4.5 GB of RAM** on its own, plus about 100 MB per player (6 GB in total at most); keep **30 GB** of free disk space. Up to 16 players.

The configuration file `enshrouded_server.json` is created by the server the **first time it starts**: start it once, stop it, then adjust its settings.

## Configuration

The **Configuration** page edits `enshrouded_server.json` (next to `enshrouded_server.exe`). It has the same layout as Valheim's page:

| Section              | What it contains                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| General              | Server name (the name players search for), max players (1 to 16), text chat, voice chat and its mode (proximity or whole server) |
| Network              | Port (UDP 15637 by default) and listen address (leave `0.0.0.0`)                                                                 |
| Difficulty           | The game's presets: Default, Relaxed, Hard, Survival or Custom                                                                   |
| Gameplay settings    | About 40 settings grouped by theme (players, survival, world, progression, enemies, bosses, day and night)                       |
| Advanced             | Save folder, game log folder, extra launch arguments                                                                             |
| Groups and passwords | The user groups, saved with their own button (see below)                                                                         |

**Presets and gameplay settings**: the server only reads the gameplay settings when the preset is **Custom**. Changing one of them switches the preset to Custom automatically. Day, night and hunger durations are shown in minutes (the file stores them in nanoseconds, Nexum converts). A value outside the allowed range is brought back to the limit by the server.

**Stop the server before changing the configuration**: the server rewrites `enshrouded_server.json` every time it starts. Nexum locks the **Save** buttons while the server is running and reads the file again once it stops. Before every save, the previous file is kept as `enshrouded_server.json.backup`. Keys Nexum doesn't manage (tags, bans…) are left untouched.

## Groups and passwords

Enshrouded has no single server password: each **group** has its own password, and the password a player types when joining gives them that group's permissions.

On first start, the server creates 4 groups with random passwords:

| Group   | Kick and ban | Base chests | Edit the world | Build in bases | Flame Altars |
| ------- | ------------ | ----------- | -------------- | -------------- | ------------ |
| Admin   | ✅           | ✅          | ✅             | ✅             | ✅           |
| Friend  |              | ✅          | ✅             | ✅             |              |
| Guest   |              |             | ✅             |                |              |
| Visitor |              |             |                |                |              |

In **Configuration → Groups and passwords** you can show, change or generate each password, change the permissions, set **reserved slots** (places kept free for that group when the server is full), add or remove groups. Then click **Save groups**.

A group **without a password** lets anyone join with its permissions: the Dashboard warns you about it.

## Joining the server

The **Join the server** card on the Dashboard shows everything to give to your friends:

- **Name to search for in game**: the server name. In the game, **Join**, then enable "Show dedicated servers" in the filters.
- **Same network**: `IP:15637`.
- **From the Internet**: forward **UDP 15637** on your router to this PC, and apply the firewall rule on the **Network** page. If the server doesn't show up in the list, add it to the Steam favorites: Steam → **View → Game Servers → Favorites → +**, then `public IP:15637`.

Only the server port needs to be opened: the other ports the server uses are temporary ones chosen by Steam.

## Second server on the same PC

Use another port (for example 15638). Nexum refuses to start a server whose port is already used by another running server (any game) and tells you which one.

## Stopping and saves

Stopping is **clean**: Nexum sends the server a CTRL+Break signal, the server saves the world and shuts down within a second or two (CTRL+C is ignored by Enshrouded, tested). The [scheduled restart](scheduling.md) works the same way, but players can't be warned in game (no admin API).

World saves are in the `savegame` folder of the server (`world0.ksd`, plus the copies the game keeps in `savegame/backup`). Nexum's [backups](backups.md) zip this folder, and follow the save folder set in **Advanced**.

Good to know: **quitting Nexum** (tray menu **Quit Nexum**) also stops a server it started, without a clean save. Closing the window is fine (Nexum stays in the notification area, the default); to quit Nexum, stop the server first.

## Logs

The server's output is shown in full on the **Logs** page. When you copy or save a log for a bug report, the public IP and the server's Steam ID are hidden.

## Players

There is no player list in Nexum for Enshrouded (no API). Kicking and banning happen in game, by a player whose group has the **Kick and ban** permission.
