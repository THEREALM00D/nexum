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

## First use

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
- Click the folder icon and pick the server folder (the one containing `PalServer.exe`, `valheim_server.exe` or `AstroServer.exe`)
- The game is detected automatically, and a hint under the path confirms that the server executable was found (or warns if it wasn't — check the folder or the game)
- Palworld and Astroneer: your existing `.ini` settings are read as they are
- Valheim: existing worlds are detected. If there is only one, it is selected automatically; otherwise pick it from the suggestions in the **World name** field of **Configuration** — the name must match exactly, or Valheim creates a new empty world

## Updating the Palworld server

When a Palworld update is available:

- Go to **Install**
- Click **Check** to compare the installed version against the Steam version
- If an update is available, click **Update Palworld**

## Uninstalling

Use the Windows Control Panel or run `Uninstall Nexum.exe` from the installation folder.

> Palworld server files and backups are **not** removed automatically.
