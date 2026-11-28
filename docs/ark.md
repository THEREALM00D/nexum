# ARK: Survival Ascended

🇬🇧 English | 🇫🇷 [Français](ark.fr.md)

Nexum runs the official **ARK: Survival Ascended Dedicated Server** (free, Steam app 2430930). This page covers what is specific to ARK; the other pages ([installation](installation.md), [network](network.md), [backups](backups.md)…) apply as usual.

## Install

Use the setup wizard (or **Servers → Add server**) and pick **ARK: Survival Ascended**:

- **Install a new server**: Nexum downloads the server with SteamCMD (about 13 GB).
- **I already have a server**: choose the folder that contains `ShooterGame` (Nexum looks for `ShooterGame\Binaries\Win64\ArkAscendedServer.exe`). Nexum takes over the map, ports, mods and options from the old launch line: see [Moving an existing ARK server to Nexum](ark-import.md).

Requirements: 64-bit Windows and a powerful PC. The server uses about **10 GB of RAM** on its own once started, with no player connected; keep **20 GB** of free disk space.

After **Start**, the server takes one to two minutes to be ready: wait for the line `Server has completed startup and is now advertising for join` on the **Logs** page.

## Configuration

The **Configuration** page has four tabs: **General**, **Game settings**, **Lists** and **Raw files**.

### General

The essential settings, from two places:

| Section                   | What it contains                                                        | Where it goes             |
| ------------------------- | ----------------------------------------------------------------------- | ------------------------- |
| Server                    | Session name, map, max players, PvE mode                                | INI file and command line |
| Access and administration | Server password, admin password, RCON                                   | `GameUserSettings.ini`    |
| Network                   | Game port (UDP 7777), query port (UDP 27015), RCON port (TCP 27020)     | Command line              |
| Advanced                  | BattlEye, world folder (`AltSaveDirectoryName`), extra launch arguments | Command line              |

`GameUserSettings.ini` is in `ShooterGame\Saved\Config\WindowsServer`. The session name, passwords, PvE mode and RCON are written there; the map, max players, ports and BattlEye go on the command line. Max players only works on the command line: the server ignores and overwrites the value in the INI file.

**Maps**: The Island, The Center, Scorched Earth, Aberration, Extinction, Ragnarok, Valguero, Lost Colony, Astraeos and Genesis: Part 1. Each map has its own world: switching maps doesn't delete the previous one. Some maps are paid: players need to own them.

**Modded map** (for example Svartalfheim): type its exact name in the **Map** field (`Svartalfheim_WP`; the map's CurseForge description usually gives it) and add the map's mod on the [**Mods**](#mods) page. Letters, digits and `_` only.

**Never put a password in the extra arguments**: the server copies its whole command line into its log.

### Game settings

All the ARK: Survival Ascended settings (about 380), grouped by theme: rates and difficulty, players, creatures, breeding, structures, PvP and PvE, tribes, world and day/night, crafting, transfers, cryopods and bunkers, administration, interface, and launch options. Search by name, description or key; hover the ⓘ icon for the description and the game's default value.

- A setting left **empty** keeps the game's default value and is **not written** to the files. A green dot marks a written setting; the ↺ button puts it back to the default (the line is removed).
- Only the settings you change are written: the rest of the files (unknown keys, mod sections) stays as it is.
- **Launch options** (`-ServerPlatform`, `-clusterid`…) are added to the command line. If the same option is already in the extra launch arguments (General tab), that one wins. Their values can't contain spaces or quotes.
- **Other settings**: settings found in the files that Nexum doesn't know yet (added by a game update or by hand). You can change their value.
- **Mod: [Section]**: one group per mod section of `GameUserSettings.ini` and `Game.ini` (`[ArkadeEssentials]`, `[Shiny]`…), with its settings one by one. Nexum doesn't check these values: the mod's documentation says what each key expects. Lists (keys written several times) stay in **Raw files**.

### Lists

The lists of `Game.ini`, each saved on its own:

- **Stats per level**: the multiplier of each stat point, for players, wild creatures and tamed creatures. Don't use 0 (the game replaces it with 1): 0.01 almost turns the gain off.
- **Stack sizes**: stack size per item class (`PrimalItemResource_Stone_C`…), with or without the global multiplier.
- **Engrams**: hide an engram, change its cost or level, remove its prerequisite; automatic unlocks; engram points per level; "only engrams in the list".
- **Spawns**: add, remove or replace the creatures of a spawn area (`DinoSpawnEntriesBeach_C`…), spawn weight per creature, replace one creature with another.

Saving a list rewrites its entries: the fields Nexum doesn't edit (spawn chances, colors…) are kept, only the layout may change (`true` becomes `True`). An entry Nexum can't read is kept as it is and stays editable in **Raw files**.

### Raw files

`GameUserSettings.ini` or `Game.ini` as they are, for everything the other tabs don't cover (other `Game.ini` lists, mod sections).

### Before saving

**Stop the server before changing the configuration**: the server rewrites `GameUserSettings.ini` and `Game.ini` when it stops, with the values it read at startup (tested). Nexum locks every tab while the server is running, and changes apply at the next start. Before every save, the previous file is kept as `.backup` (`GameUserSettings.ini.backup`, `Game.ini.backup`).

Nexum reads keys without case sensitivity, like the game: `serverPVE=True` written by hand is the same setting as `ServerPVE`.

## Mods

The **Mods** page manages the server's [CurseForge](https://www.curseforge.com/ark-survival-ascended) mods:

- **Browse CurseForge** tab: search mods by name, sort them (popularity, recently updated, downloads, name), filter by category (Maps, Creatures, Structures…) and click **Add**. Mods marked **Cosmetic** are for players only: they don't install on a server and prevent it from starting (tested), so they can't be added. Mods marked **PC only** aren't cross-platform: a server is cross-platform by default and doesn't start with them (tested); they only work with **Accepted platforms** set to `PC` (Configuration page, **Game settings** tab, launch options), and console players then can't join.
- **Add** a mod with its **Project ID**: the number shown on the mod's CurseForge page, under _About Project_ (the page address doesn't contain it).
- The **order** of the list is the load order (arrows). A **disabled** mod stays in the list but isn't loaded.
- **Search** the list by name, author or ID; the count shows how many mods match. While searching, the arrows still move a mod within the full list.
- Nexum only writes the list on the command line (`-mods=`): **the server downloads the mods and updates them itself at every start**, in a few seconds for small mods. Changes made while the server runs apply at the next start.
- Players don't install anything: the game downloads the server's mods when they join.
- Once the server has downloaded a mod, the page shows its name, logo, author and installed file. Before that, Nexum asks CurseForge for its name and logo, and checks that an added ID exists.

⚠️ An unknown mod ID **prevents the server from starting** (`Mods not installed` in the logs). Removing a mod also removes what it added to the world (creatures, structures, items): make a [backup](backups.md) first.

The server keeps the files of a mod removed from the list: it's listed under **Downloaded by the server, not in the list**, at the bottom of the list, where you can add it back. This is also where the mods of an existing server show up after its first start in Nexum. Mods already written in the extra launch arguments (`-mods=…`) are flagged with a button to move them to the list.

## RCON

RCON is the server's remote admin console. Nexum needs it to:

- stop the server cleanly: the world is saved before the server quits;
- save the world right before a [backup](backups.md) of a running server;
- warn players in the game chat before a [scheduled restart](scheduling.md) (the message is sent without accents: the game can't display them);
- list connected players on the **Players** page;
- renew wild creatures after each start or every few hours (`DestroyWildDinos`, [Scheduling](scheduling.md#wild-creatures-ark) page).

Nexum turns RCON on by itself for a new server, and creates an admin password if there is none (you can see and change it in **Configuration**). If you turn RCON off, Nexum respects it, but stopping the server then loses up to 15 minutes of progress (the game saves every 15 minutes).

The RCON port is never opened in the firewall: Nexum only connects to it from this PC.

## Joining the server

The **Join the server** card on the Dashboard shows everything to give to your friends:

- **Name to search for in game**: the session name, in the list of unofficial servers.
- **Same network**: `IP:7777`.
- **From the Internet**: forward **UDP 7777** (the game port) on your router to this PC, and apply the firewall rule on the **Network** page.

## Second server on the same PC

Use another game port **and** another query port (for example 7787 and 27016), plus another RCON port. Nexum refuses to start a server whose ports are already used by another running server (any game) and tells you which one.

## Stopping and saves

Stopping goes through RCON: Nexum asks the server to save, then sends `DoExit`; the server saves the world again and quits within about 20 seconds. Without RCON, the server can't be stopped cleanly (it ignores CTRL+Break, tested): Nexum stops it directly.

The world is in `ShooterGame\Saved\SavedArks\<map>` (for example `TheIsland_WP\TheIsland_WP.ark`), or in `ShooterGame\Saved\<world folder>\<map>` when the **World folder** field (Configuration → General, Advanced) is set. The game also keeps there up to 4 full copies of the world (`.arkrbf` files) and an anti-corruption copy (`.bak`). Nexum's [backups](backups.md) leave these copies out: a backup only contains the world itself, about 6 times smaller. Player profiles (`<EOS ID>.arkprofile`) can also be backed up on their own and restored one player at a time: see [ARK: player profiles](backups.md#ark-player-profiles).

Good to know: a server started by Nexum stops when Nexum quits. Nexum asks first and stops it cleanly (see [Quitting Nexum with servers online](installation.md#quitting-nexum-with-servers-online)).

## Logs

Nexum follows the game's own log (`ShooterGame\Saved\Logs\ShooterGame.log`): the server writes nothing useful to its console. The debug lines of the game's analytics module are hidden on screen, and the usual Steam messages of a dedicated server are not shown as errors. The session file and the export (**Copy**, **Save**) contain everything. When you copy or save a log for a bug report, public IPs, player IDs and passwords found in the command line are hidden.

## Players

With RCON on, the **Players** page lists who is connected and keeps the history (first and last connection, play time), like for Palworld, and the Dashboard shows the number of connected players. With RCON off, the Dashboard and the **Scheduling** page warn you and offer to turn it on (server stopped).
