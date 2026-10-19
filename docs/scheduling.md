# Scheduling

🇬🇧 English | 🇫🇷 [Français](scheduling.fr.md)

Automatic daily server restart at a fixed time.

## What is it for?

Palworld servers can suffer from memory leaks or slowdowns after several days of uptime. A regular restart:

- Frees up memory and improves performance
- Applies any pending configuration changes
- Forces a clean save point to be created
- Reduces the odds of a crash mid-session

## Configuration

### Enable scheduled restart

Toggle at the top of the page. When disabled, no automatic restart occurs.

### Time (24h)

Time picker in `HH:MM` format. The restart triggers **every day** at that time.

> Pick an off-peak hour (e.g. 4:00 AM) to minimize impact on players.

### Warning (minutes before)

Delay between the announcement sent to players and the actual shutdown. Default: **5 minutes**.

- `0`: immediate shutdown with no warning
- `5`: announcement sent, then shutdown 5 minutes later
- `15`: announcement sent, then shutdown 15 minutes later

### Announcement message

Text sent to all players via the REST API. The `{minutes}` placeholder is replaced with the warning delay.

Example: `"The server will restart in {minutes} minutes"` becomes `"The server will restart in 5 minutes"`.

### Update the game at restart time

Off by default. At restart time, Nexum checks whether a server update is available on Steam:

- **Update available**: server shutdown (with the announcement and delay above), [world backup](backups.md#backup-before-every-update), update with SteamCMD, then start. The result (installed build, backup name) is written in the log of the new session.
- **Server up to date**, or Steam doesn't answer: plain restart, as without the option.
- If the backup or the update fails, the server restarts on the version already installed and the log says why.

Handy to keep the server in step with game patches without doing anything: a server that is one version behind refuses players who updated their game. No effect for a server installed through the **Steam library** (Steam updates it) or if SteamCMD isn't installed. Valheim mods are not updated automatically.

## How it works

Each server has its own schedule: every running server with the restart enabled is restarted at its own time, whether or not it is selected in Nexum (up to 0.14, only the selected server was).

The main-process scheduler:

1. Checks the current time every 30 seconds
2. When the time matches, triggers the restart process **once per day** at that time (only if the server is running)

The restart process:

1. **Announcement** sent via `/v1/api/announce` (if the message isn't empty)
2. **World save** via `/v1/api/save`
3. **Graceful shutdown** via `/v1/api/shutdown` with a wait time
4. Short pause
5. **Restart** of the server process

## Requirements

> ⚠️ **The REST API must be enabled** in `PalWorldSettings.ini` (`RESTAPIEnabled=True`) for the scheduled restart to work correctly.

If the API is disabled, Nexum shows a warning with an **Enable** button that updates the configuration in one click.

> Without the REST API, the shutdown happens via `taskkill /F` with no save — you risk losing recent data.

**RuneScape: Dragonwilds** has no API and can't shut down cleanly on Windows: the restart stops it immediately, with no in-game warning. The server saves the world by itself every 5 minutes, so at most the last 5 minutes are lost.

## Use cases

### Nightly restart (recommended)

```
Time: 04:00
Warning: 5 minutes
Message: "Daily maintenance in {minutes} min"
```

### Quick restart during maintenance

```
Time: 12:00
Warning: 1 minute
Message: "Technical restart in {minutes} min"
```

## Interaction with automatic backups

Scheduled restart and automatic backups are **independent**. You can enable both:

- Auto backups every hour (continuous safety net)
- Scheduled restart at 4 AM (daily maintenance)

> Graceful shutdown makes its own save via the API, independently of the ZIP backup scheduler.

## Current limitations

- **A single time** per day (no multiple schedules)
- **Every day** (no selectable days)
- No notification when the restart fails (check the logs)
