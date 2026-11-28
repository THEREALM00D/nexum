# Dashboard

🇬🇧 English | 🇫🇷 [Français](dashboard.fr.md)

Nexum's main view — server status, statistics, controls, and how to join. Palworld also shows server information and connected players, read from its REST API.

## Server status

The top card shows the server's name, game and folder, with its status next to the actions (and how long it has been online):

| Status          | Color  | Description                                     |
| --------------- | ------ | ----------------------------------------------- |
| **Online**      | Green  | The server is started and accepting connections |
| **Starting...** | Orange | The process is launching                        |
| **Stopping...** | Orange | Shutdown in progress                            |
| **Stopped**     | Gray   | The server is not running                       |
| **Crashed**     | Red    | The process exited with an error                |

## Controls

Only the actions that make sense for the current status are shown:

- **Start** (stopped or crashed): launches the game's server. After a crash, **View logs** opens the Logs page to help you understand what happened.
- **Restart** (online): stops then relaunches
- **Stop** (online or starting): stops the server as cleanly as the game allows, then force-stops it with `taskkill` if needed

| Game                   | How the server stops                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| Palworld               | REST API: announcement, save, shutdown                                                                  |
| Valheim                | CTRL+Break: the game saves the world before closing                                                     |
| Enshrouded             | CTRL+Break: the game saves the world before closing                                                     |
| ARK: Survival Ascended | RCON: announcement, save, `DoExit` (the game saves the world again before closing)                      |
| Astroneer              | Immediate stop with `taskkill`                                                                          |
| RuneScape: Dragonwilds | Immediate stop with `taskkill`: the game has no clean stop on Windows, but it autosaves every 5 minutes |

> On Palworld, a clean stop is only possible if **REST API** is enabled in the configuration. Otherwise the server is killed abruptly and recent changes may be lost.

### More actions (⋯)

While the server runs (or is starting or stopping), the **⋯** button after **Stop** opens:

- **Save the world now**: ARK with RCON (`SaveWorld`), Palworld with the REST API. A line in the logs confirms it.
- **Send a message to players**: shown in the game chat (ARK with RCON, Palworld with the REST API). ARK can't display accents: Nexum removes them and shows what will be sent. The window also says how many players are online.
- **Kill the process**: stops the server right away with `taskkill`, without warning players or saving; everything since the game's last save is lost. Use it only when **Stop** no longer responds. A confirmation is asked first. A killed server is not treated as a crash: it is not relaunched, even with **Restart automatically after a crash**. A restart already in progress (button, schedule, all servers) carries on: Kill only unblocks its stop.

When the game has no command for it, or RCON / the REST API is off, the entry is greyed out and says why.

### Watch warning

When Nexum restarted the server by itself because of a [watch option](servers.md#watch-options-add-and-edit-dialogs) (startup not finished, RAM above the limit), a warning under the header says what happened and when, with **View logs**. It stays until you dismiss it, or until Nexum quits.

## Statistics

Real-time data, refreshed every 2 seconds. The server comes first:

- **Players online** (Palworld and Valheim, when Nexum can read the number)
- **Server RAM**: memory used by the game server (while it is running)
- **Online for**: time elapsed since the game server started, with the next scheduled restart if one is set

A strip below shows the state of the PC:

- **CPU**: processor usage in %
- **RAM**: memory usage in % and in GB
- **Up for**: time elapsed since the machine started

The bars stay neutral, then turn orange above 65% and red above 85%.

## Join the server

The **Join the server** card (all games) gives the address to share with your friends once the server is online, each with a copy button:

- **From the Internet**: click **Show my public IP** to get the address for friends outside your network. Nexum asks the ipify.org service for it, **only when you click**.
- **Same network**: this PC's local address and the game port (e.g. `192.168.1.30:2456`), for players on the same Wi-Fi / router.
- **Crossplay join code** (Valheim with Crossplay on): the code from the server log, once the server has started.

The note below reminds you which UDP ports to forward on your router (e.g. `2456-2458` for Valheim) and to which PC. Most routers don't let you join your own public IP from inside your network: ask a friend outside to test it.

## Latest logs

The **Latest logs** card, next to **Join the server**, shows the last 5 lines of the current session with the same colors as the Logs page. **View all** opens the [Logs page](logs.md).

## Server information (Palworld)

Shown only when the server is **Online** and the REST API is reachable:

- Server name
- Palworld version
- Description
- World GUID (unique world identifier)
- Online players (current / max)
- In-game day (in-game counter)
- Server FPS
- Number of base camps

Data is refreshed every 10 seconds.

## Connected players (Palworld)

Real-time list of players with:

- **Name** and **level**
- **Ping** (latency in ms)
- **Kick button** (orange icon): disconnects the player without banning them
- **Ban button** (red icon): disconnects and prevents any reconnection

### Unbanning a player

At the bottom of the players panel:

- Enter the banned player's **User ID** (Steam ID)
- Click **Unban**

> The User ID is visible in the logs or via Palworld's ban list (`Pal/Saved/SaveGames/{GUID}/banlist.txt`).

Valheim shows a player count instead, see [Valheim player tracking](valheim-players.md). ARK: Survival Ascended has the Players page when RCON is on. Astroneer, Dragonwilds and Enshrouded have no player list in Nexum.

## Limitations (Palworld)

- Player management features require the **REST API to be enabled**
- If the API is not reachable (REST disabled, wrong password, etc.), no information is shown — check your configuration
