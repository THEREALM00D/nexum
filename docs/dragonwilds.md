# RuneScape: Dragonwilds

🇬🇧 English | 🇫🇷 [Français](dragonwilds.fr.md)

Nexum runs the official **RuneScape: Dragonwilds - Dedicated Servers** tool (free, Steam app 4019830). This page covers what is specific to Dragonwilds; the other pages ([installation](installation.md), [network](network.md), [backups](backups.md)…) apply as usual.

## Before you start: your Player ID

The server **won't start without the owner's Player ID**. In the game, open **Settings**: your Player ID is shown at the bottom of the menu. Copy it into **Configuration → Owner and administration → Owner Player ID**.

The owner can ban and unban anyone. Nexum refuses to start the server while this field is empty, with a message explaining why: without it, the server would stay "running" without doing anything.

## Install

Use the setup wizard (or **Servers → Add server**) and pick **RuneScape: Dragonwilds**:

- **Install a new server**: Nexum downloads the server with SteamCMD (about 5 GB).
- **I already have a server**: choose the folder that contains `RSDragonwildsServer.exe` (the Steam tool folder works too). The game's own folder, with `RSDragonwilds.exe`, is not a server.

Requirements: 64-bit Windows, about 2 GB of RAM + 1 GB per player. Up to 6 players.

## Configuration

The **Configuration** page edits `RSDragonwilds/Saved/Config/WindowsServer/DedicatedServer.ini` plus the launch settings:

| Field                   | What it does                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Server name             | Shown in the "Created By" column of the worlds list. Random if empty.                                                                  |
| World name              | The world loaded at startup, created if it doesn't exist. It's also the name players search for (case-sensitive).                      |
| World password          | Asked of players to join. Empty = open to everyone.                                                                                    |
| Owner Player ID         | Your Player ID (required).                                                                                                             |
| Admin password          | Entered in game (Pause → Settings → Server Management) by players who should be able to ban online players. The owner doesn't need it. |
| Game port / Beacon port | UDP 7777 and 8888 by default. Changing the game port moves the beacon port along (game port + 1111).                                   |
| Allowed platforms       | Crossplay (PC and consoles) or PC only.                                                                                                |

**Stop the server before changing the configuration**: the server rewrites this file while it runs, so a change made at that moment would be lost. Nexum locks the **Save** button while the server is running.

The server removes the admin password from its file after reading it: Nexum keeps it and writes it back before every start.

## Joining the server

The **Join the server** card on the Dashboard shows everything to give to your friends:

- **Name to search for in game** (the world name): in the game, **Worlds → Public**, search for this exact name (case-sensitive). Appearing in the list can take a minute or two after startup.
- **Same network**: players on your local network can connect directly to `IP:port`.
- **From the Internet**: forward **UDP 7777 and 8888** on your router to this PC, and apply the firewall rules on the **Network** page.

The server and the game must be on **the same version**: after a game update, update the server too (**Installation → Update**), otherwise the world doesn't show up in the list. Nexum checks at every start and tells you when an update is available.

Known issue (Jagex): Steam invites to a dedicated server don't work.

## Second server on the same PC

Each server needs its own ports: for example 7778 / 8889 for the second one. Nexum refuses to start a server whose ports are already used by another running server (any game) and tells you which one.

## Worlds and single-player saves

The **Backups** page has a **Worlds** card:

- the world loaded at startup and the other worlds of the server, with a **Load at startup** button;
- **Import a single-player world**: Nexum lists the worlds of the game on this PC (`%LOCALAPPDATA%\RSDragonwilds\Saved\SaveGames`), or lets you pick a `.sav` file from another PC. The server's worlds are backed up as a ZIP first, then the world is copied and selected.

Good to know: the server picks a world by the **name stored inside the save**, not by its file name. Renaming a `.sav` file is harmless; a server world with the same name as an imported one is moved to `Saved/SaveGames-replaced` so the imported one is loaded.

The server must be stopped to switch worlds or import one.

## Stopping and saves

Dragonwilds has no admin API or console, and **can't shut down cleanly on Windows** (tested: the server stops immediately without saving, whatever signal it receives). Nexum therefore stops it immediately. The server **saves the world by itself every 5 minutes** and keeps the previous save as `.sav.backup`: at worst, the last 5 minutes are lost. Stop the server at a quiet moment, or enable [automatic backups](backups.md).

The [scheduled restart](scheduling.md) can't warn players in game for the same reason.

## Logs

Nexum reads the server's full log (`RSDragonwilds/Saved/Logs/RSDragonwilds.log`): world loaded, ports, players joining… even for a server started before Nexum was opened. When you copy or save a log for a bug report, passwords, player IDs and join codes are hidden.

## Players

There is no player list in Nexum for Dragonwilds (no API). Moderation (ban, unban) happens in game, from **Pause → Settings → Server Management**.
