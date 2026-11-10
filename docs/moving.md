# Moving to another PC

🇬🇧 English | 🇫🇷 [Français](moving.fr.md)

Take your servers to a new PC without adding them again by hand. Nexum offers two exports:

|                     | **Settings export** (Settings page)                                          | **Server export** (Servers page)                                             |
| ------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| What                | Every server and its Nexum settings, the app settings, custom firewall rules | One server: its Nexum settings, its world, the game's config files, its mods |
| File                | `nexum-settings-YYYY-MM-DD.json` (a few KB)                                  | `<name>-YYYY-MM-DD.nexum-server.zip` (the size of the world)                 |
| The server works... | once its folder is copied or the game reinstalled, with its world            | as soon as the game is installed on the new PC                               |

Neither file contains the game itself, SteamCMD, backups, session logs or player history.

## Settings export

**Settings → Move to another PC → Export settings.**

The file contains:

- the server list, and for each server: launch settings (Configuration page), backup settings, scheduled restart, auto-start and auto-restart;
- the app settings: language, notification area, beta versions, launch at Windows startup;
- your custom firewall rules (Network page).

Settings stored in the game's own files (`PalWorldSettings.ini`, Astroneer INI files, `DedicatedServer.ini`, `enshrouded_server.json`) live in the server folder: they come along if you copy that folder, or with a server export.

### Import

**Settings → Move to another PC → Import settings**, then pick the file. Nothing is written before you confirm.

- Check the servers to import. Folders from the old PC often don't exist on the new one: change the **server folder**, and the **backup folder** and Valheim **game data folder** if they were set.
- **Game not found in this folder**: the server is imported anyway; install the game from the **Installation** page.
- **Already added**: a Nexum server already uses this folder. Each import adds new servers, it never replaces an existing one.
- **App settings**: language, notification area, beta versions, launch at Windows startup.
- **Custom firewall rules**: added to the Network page list. Check **Also create them in the Windows firewall** to create them right away (Windows asks for permission once); otherwise create them from the Network page. A rule with the same name and protocol as a rule already on this PC but another port is left out: the rule of this PC is kept.

## Server export ("move a server")

On the **Servers** page, **⋯** menu of the server → **Export to another PC**. The server must be stopped: its world must not change during the copy.

The ZIP contains:

- the server's Nexum settings;
- its world (the game's save folder). For Valheim, only the server's world: not the other worlds of the same folder, nor Valheim's automatic backups;
- the game's config files: `PalWorldSettings.ini` and `GameUserSettings.ini` (Palworld, the latter tells the server which world to load), `AstroServerSettings.ini` and `Engine.ini` (Astroneer), `DedicatedServer.ini` (RuneScape: Dragonwilds), `enshrouded_server.json` (Enshrouded), the admin / banned / permitted lists and the mod settings (`BepInEx/config`) for Valheim;
- for Valheim, the list of mods installed from Thunderstore or Hexium (manually installed mods are left out).

### Import

**Servers → Import a server**, then pick the ZIP.

1. Check the name and the folders (server folder, and Valheim game data folder if it was set).
2. If a world with the same name is already in the worlds folder, Nexum doesn't overwrite it unless you check **Replace the world already there**.
3. Existing game config files are listed in the dialog before the import, and kept next to the new ones as `.backup` copies.
4. If a running server uses these folders (same server folder, or for Valheim the same game data folder), the import is refused: stop that server or choose other folders.
5. If a file can't be written (folder without write permission, missing drive), the import stops and no server is added: fix the folder and import again.

Recommended order on the new PC: import the server, install the game from the **Installation** page, then (Valheim) open the **Mods** page and click **Reinstall** in the "mods to reinstall" banner. Nexum installs BepInEx if needed (the imported mod settings in `BepInEx/config` are kept), then each mod from its registry; mods that were disabled stay disabled. A mod that fails stays in the list for another try, or click **Dismiss**.

## Passwords

By default, passwords stored by Nexum (Valheim server password, Dragonwilds admin password) are **not** exported: enter them again on the server's Configuration page after the import. Check **Include passwords** to export them: the file then contains them in plain text, don't share it and delete it after the import.

The game's config files in a server export are copied as they are, with any passwords they contain (Palworld admin password, Enshrouded group passwords…).
