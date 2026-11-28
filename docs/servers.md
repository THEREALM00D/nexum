# Servers

🇬🇧 English | 🇫🇷 [Français](servers.fr.md)

The **Servers** page lists every dedicated server Nexum manages, whatever the game. Click a server to make it the active one: the pages of the sidebar (Dashboard, Configuration, Logs…) then show that server.

## One server

Each row has a **Start** / **Stop** button, a **Restart** button and a **⋯** menu:

- **Edit**: name, color, automatic start with Nexum, relaunch after a crash, and the watch options below.
- **Open folder**.
- **Export for another PC** (server stopped): see [Moving to another PC](moving.md).
- **Delete**: removes the server from Nexum; the game files stay on the disk.

The header has **Import a server** (a file exported from another PC), **Setup wizard** and **Add a server** (a new server or a folder already installed).

### Watch options (Edit dialog)

- **Restart if startup isn't finished** (ARK: Survival Ascended and Enshrouded only, the games that write a "ready" line in their log: `advertising for join` for ARK, `HostOnline` for Enshrouded): if the line doesn't show up after the set number of minutes (10 by default), Nexum kills the server and starts it again 10 seconds later. These restarts count with the restarts after a crash: after 3 in 30 minutes, Nexum leaves the server stopped.
- **Restart when RAM goes above** (all games): when the server's RAM stays above the limit for 5 minutes in a row (checked once a minute), Nexum restarts it, warning players with the announcements of its **Schedule** page when the game can (REST API, RCON). Without them, it restarts right away.

Each time, a line goes to the server's logs and a warning shows under the Dashboard header (with **View logs**) until you dismiss it. A Windows notification appears if Nexum's window isn't in front.

## All servers

The **All servers ▾** menu acts on every server at once. The count on the right of each entry says how many servers it affects; an entry with no server is greyed out.

| Entry                            | Servers affected     | What it does                                                                       |
| -------------------------------- | -------------------- | ---------------------------------------------------------------------------------- |
| **Start all servers**            | stopped (or crashed) | Starts them, 5 seconds apart                                                       |
| **Restart running servers**      | running              | Stops then starts each one                                                         |
| **Stop all servers**             | running              | Stops them, saving the world when the game allows it                               |
| **Update stopped servers**       | stopped (or crashed) | Checks Steam, then backs up the world and updates with SteamCMD; they stay stopped |
| **Stop, update and restart all** | running and stopped  | Running servers: stop, update if one is out, start. Stopped servers: update only   |

Servers are handled **one after another**, each with its own settings: the [backup before every update](backups.md#backup-before-every-update), and the player warning of its [Schedule](scheduling.md) page. A failure on one server doesn't stop the others.

An update is skipped (and the row says why) for a server installed through the **Steam library** (Steam updates it), when SteamCMD isn't installed, or when Steam doesn't answer. If the backup or the update fails, the server stays stopped.

### Players online

Before stopping or restarting servers, Nexum checks who is connected. If at least one player is online, a confirmation lists each running server with its players ("players unknown" for a game where Nexum can't count them: Enshrouded, Astroneer, RuneScape: Dragonwilds, Valheim without [Odin-Eye](valheim-players.md), Palworld without the REST API, ARK without RCON).

**Warn players before stopping** (on by default): every server that can talk to its players (Palworld with the REST API, ARK with RCON) sends the announcements of its **Schedule** page **at the same time**, 30, 15… 1 minutes before by default. Then the servers are stopped one by one, each with its last announcement just before. The other games stop without warning.

When nobody is online, there is no confirmation and no announcement.

### Progress

A window shows one row per server: waiting, in progress (current step, with the SteamCMD percentage during an update), done, or failed with **View logs** (the server becomes the active one and the Logs page opens).

- **Close**: the action keeps going. A bar above the list shows where it is, then the result once it ends (it stays until **Dismiss**, so a failure doesn't go unnoticed); **Show details** opens the window again.
- **Stop after _name_**: the current server finishes, the next ones are skipped. During the announcements, the button reads **Cancel the announcements and the action**: the countdowns stop right away and no server is stopped.
- The **All servers** menu stays greyed out until the action ends. A server busy with a scheduled restart is skipped.

The logs of each server say which action handled it ("Action on all servers: …"), with the update report or the cause of a failure, in a short session of their own when the server stays stopped.

Quitting Nexum during an action: no further server is started or restarted. If an update is running, Nexum asks whether to wait for it (quitting would interrupt SteamCMD).
