# Installation

🇬🇧 English | 🇫🇷 [Français](installation.fr.md)

## Requirements

- **Windows 10 or 11** (64-bit)
- No administrator rights needed: Windows only asks for confirmation (UAC) when you change firewall rules
- **~10 GB of disk space** for SteamCMD + the Palworld server
- Internet connection for the initial download

## Installing Nexum

1. Download `nexum-{version}-setup.exe` from the [Releases](https://github.com/THEREALM00D/nexum/releases) page
2. Run the installer. If Windows SmartScreen shows "Windows protected your PC", click **More info → Run anyway** (the installer is not code-signed yet; you can check its SHA256, listed in the release notes)
3. A shortcut is created on the desktop

> ⚠️ **Don't keep your servers or saves inside Nexum's install folder** (for example `H:\Nexum`). Up to version 0.12.3, every Nexum update emptied that whole folder, including files you had added to it (Valheim worlds were lost this way). Later versions only remove their own files, but still pick a separate folder, for example `H:\ValheimSaves`. Nexum shows a warning under folder fields (server, Valheim saves, backups) that point inside its install folder.

> **"Nexum cannot be closed" while updating from 0.12.4 or 0.12.5**, although Nexum is closed: this happens when Nexum is installed on another drive than `C:` (for example `H:\Nexum`). Click **Cancel**: your installed version stays intact. Install 0.12.6 or later instead, which fixes it. If you're stuck on an older installer, uninstall Nexum from Windows Settings (your servers and settings are kept), then install the new version.

## Updating Nexum

Nexum checks for a new version at startup (at the bottom of the sidebar, or **Settings → Updates**). It only downloads and installs it when you click.

### Beta versions

To try new features before they are released, turn on **Settings → Updates → Get beta versions** (off by default). Nexum then also offers beta versions (`0.17.0-beta.1`, for example), then the stable version once it is out.

- A beta may contain bugs: back up your worlds before installing it, and report issues on [Discord](https://discord.gg/DbJ3WkK5QU) with the version number.
- If you turn the option off while a beta is installed, you keep it until the next stable version, which Nexum will offer as usual.
- Betas are also on the [Releases](https://github.com/THEREALM00D/nexum/releases) page, marked **Pre-release**.

## First use

### Setup wizard

On first launch (no server yet), Nexum opens a **setup wizard** that walks you through everything below, in order:

1. **Game**: pick Palworld, Valheim, Astroneer, RuneScape: Dragonwilds or Enshrouded, then **Install a new server** (choose the install folder) or **I already have a server** (choose its folder: Nexum detects the game).
2. **Installation** (new server only): install SteamCMD, then the server.
3. **Configuration**: server name, password, world settings. Save before moving on.
4. **Firewall**: apply the Windows firewall rules.
5. **Start**: start the server and copy the address to give your friends.

**Skip** closes the wizard at any time; everything stays available from the menu on the left. To set up another server later, use **Servers → Setup wizard**. The steps below describe the same thing by hand.

### 1. Install SteamCMD

SteamCMD is Valve's official utility for downloading Steam servers.

- Open Nexum
- Go to **Install** in the sidebar
- Click **Install SteamCMD**
- Nexum downloads and configures SteamCMD automatically (logs visible at the bottom)

### 2. Install the Palworld server

- Choose a destination folder (default `C:\PalworldServer`)
  - Avoid protected folders (`Program Files`, `Windows`) which can cause permission issues
  - Prefer a dedicated folder on a fast drive (SSD recommended)
- Click **Install Palworld**
- The download takes about 5-15 minutes depending on your connection (~3 GB)

### 3. Initial configuration (optional but recommended)

Before starting the server for the first time:

- Go to **Configuration**
- Set:
  - **Server name** (`ServerName`)
  - **Admin password** (`AdminPassword`) — important for the REST API
  - **Server password** (`ServerPassword`) — optional, for a private server
- Enable **REST API** (`RESTAPIEnabled`) to get graceful shutdown and player management

> See [configuration.md](configuration.md) for the full list of options.

### 4. Enable the firewall

- Go to **Network**
- Click **Enable all** to create the firewall rules (Game UDP, RCON, REST API)

### 5. First start

- Go to **Dashboard**
- Click **Start**
- The status switches to **Online** once the server is ready

## Adding a server that is already installed

If a dedicated server is already installed on your machine (installed by hand, with SteamCMD, or with another tool), you don't need to reinstall it:

- Go to **Servers** and click **Add server**
- Click the folder icon and pick the server folder (the one containing `PalServer.exe`, `valheim_server.exe`, `AstroServer.exe`, `RSDragonwildsServer.exe` or `enshrouded_server.exe`)
- The game is detected automatically, and a hint under the path confirms that the server executable was found (or warns if it wasn't — check the folder or the game)
- Palworld, Astroneer and Dragonwilds: your existing `.ini` settings are read as they are (Dragonwilds: see [its page](dragonwilds.md) for the Player ID and worlds)
- Enshrouded: `enshrouded_server.json` is read as it is, groups and passwords included (see [its page](enshrouded.md))
- Valheim: existing worlds are detected. If there is only one, it is selected automatically; otherwise pick it from the suggestions in the **World name** field of **Configuration** — the name must match exactly, or Valheim creates a new empty world

## Starting automatically

To have your servers come back on their own after a PC restart:

1. In **Servers**, edit a server and check **Start automatically when Nexum opens**. Repeat for each server you want started.
2. In **Settings**, turn on **Launch Nexum when Windows starts** (only available in the installed app).

When you log in to Windows, Nexum starts in the background (its icon near the clock, see below) and starts the checked servers, a few seconds apart. A server that is already running is left as is. The same checks as a manual start apply (port conflicts, Valheim password rules, Dragonwilds Player ID): if a server can't start, the reason is written in its log.

## Restarting after a crash

In **Servers**, edit a server and check **Restart automatically after a crash**: when the server stops on its own with an error, Nexum starts it again 10 seconds later, with the same checks as a manual start. A server that stops cleanly, or that you stop yourself, is not restarted.

To avoid an endless loop with a server that crashes as soon as it starts (corrupted world, broken mod), Nexum gives up after 3 crashes within 30 minutes and says so in the log. Find out what's wrong (see [Logs → Diagnostics](logs.md#diagnostics)), then start the server yourself.

The world is only as recent as the game's last save: Nexum can't save a world while the game is crashing.

## Running in the background (icon near the clock)

Closing the Nexum window doesn't quit it: Nexum keeps running in the Windows **notification area**, near the clock, so automatic backups, scheduled restarts and server logs keep working. The first time, a Windows notification tells you so.

- **Click** the icon to bring the window back.
- **Right-click** it to see each server's status and **Start**, **Stop** or **Restart** it, or to **Quit Nexum**.
- If the icon isn't visible, click the **^** arrow next to the clock: Windows hides some icons there. You can drag it next to the clock to keep it visible.
- Opening Nexum again (shortcut, Start menu) brings back the window that's already running instead of starting a second copy.

To make closing the window quit Nexum instead, turn off **Settings → Keep Nexum running in the notification area when closed**. With this setting off, Nexum launched with Windows starts minimized in the taskbar instead.

## Updating the server

A server that is one version behind refuses players who updated their game. So every time a server starts (**Start** button or automatic start), Nexum checks in the background whether it is up to date:

- The start doesn't wait for this check: if Steam doesn't answer, the server starts normally and nothing is reported.
- If an update exists, a notification says so, with an **Update** button that opens the **Install** page of that server. The result is also written in its log (handy after a start with Windows, when nobody is watching the screen).
- Server installed through the **Steam library** (in `steamapps\common`): Steam updates it, and the notification reminds you of that. If you update it from Nexum's **Install** page instead, Nexum detects that too (up to 0.12.4, it kept announcing the update). The check needs SteamCMD to be installed (**Install** page).

To update (the server must be stopped):

- Go to **Install**
- Click **Check** to compare the installed version against the Steam version
- If an update is available, click **Update**

Before running SteamCMD, Nexum backs up the world (**Back up the world before every update** option on the **Backups** page, on by default, see [Backups](backups.md#backup-before-every-update)). To have the server update itself, turn on **Update the game at restart time** on the [Schedule](scheduling.md) page.

## Troubleshooting

### The Valheim server stops a few seconds after starting

- **Password**: Valheim refuses to start if the password is shorter than 5 characters or appears in the server name. Nexum blocks the start and tells you which one. Note that Nexum starts the server with the settings of its **Configuration** page, not the ones from your own `.bat` script: check the server name, world and password there after importing an existing server.
- **Steam app ID**: Nexum sets `SteamAppId=892970` when starting the server, like the official `start_headless_server.bat` script (since 0.4.3). If you are on an older version, update Nexum.
- **The `[ERR]` lines** `Setting breakpad minidump AppID` and `SteamInternal_SetMinidumpSteamID … [API loaded no]` are normal startup messages from Valheim, not the cause: look at the last lines before the server stops.

## Uninstalling

Use the Windows Control Panel or run `Uninstall Nexum.exe` from the installation folder.

> Server files and backups are **not** removed automatically. The uninstaller only removes Nexum's own files: anything you added to its install folder stays (since the version after 0.12.3).
