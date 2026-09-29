# Dashboard

🇬🇧 English | 🇫🇷 [Français](dashboard.fr.md)

Nexum's main view — server status, statistics, controls, and connected players.

## Server status

Shown at the top as a colored chip:

| Status          | Color  | Description                                       |
| --------------- | ------ | ------------------------------------------------- |
| **Online**      | Green  | The server is started and accepting connections   |
| **Starting...** | Orange | The process is launching                          |
| **Stopping...** | Orange | Shutdown in progress (announce + save + shutdown) |
| **Stopped**     | Gray   | The server is not running                         |
| **Crashed**     | Red    | The process exited with an error                  |

## Controls

- **Start**: launches the `PalServer.exe` process
- **Restart**: stops then relaunches
- **Stop**: attempts a graceful shutdown via the REST API (announce + save + shutdown), then force-stops via `taskkill` if needed

> Graceful shutdown is only possible if **REST API** is enabled in the configuration. Otherwise the server is killed abruptly and recent changes may be lost.

## System statistics

Four cards showing real-time data (refreshed every 2 seconds):

- **CPU**: processor usage in %
- **RAM**: memory usage in %
- **RAM used**: memory consumed in GB
- **Uptime**: time elapsed since the machine started

Progress bars change color:

- Green: < 65%
- Orange: 65-85%
- Red: > 85%

## Server information

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

## Connected players

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

## Limitations

- Player management features require the **REST API to be enabled**
- If the API is not reachable (REST disabled, wrong password, etc.), no information is shown — check your configuration
