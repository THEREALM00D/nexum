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

## How it works

The main-process scheduler:

1. Checks the current time every 30 seconds
2. When the time matches, triggers the restart process **once per day** at that time

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
