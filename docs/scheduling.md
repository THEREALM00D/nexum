# Scheduling

🇬🇧 English | 🇫🇷 [Français](scheduling.fr.md)

Automatic server restarts at fixed times or every few hours, staged warnings to players, and game update checks while the server runs.

## What is it for?

Game servers can suffer from memory leaks or slowdowns after several days of uptime. A regular restart:

- Frees up memory and improves performance
- Applies any pending configuration changes
- Forces a clean save point to be created
- Reduces the odds of a crash mid-session

The page has one card per topic (**Restarts**, **Warn players**, **Game updates**, and **Wild creatures** for ARK) and a single **Save** button at the bottom.

## Restarts

### Enable scheduled restart

Toggle at the top of the card. When disabled, no automatic restart occurs.

### Fixed times

- **Shutdown times (24h)**: one chip per time. **Add a time** opens a time picker (type the time, or click the clock icon to pick hours and minutes); the cross on a chip removes it.
- **Days**: the days of the week the times apply to (all by default). Click a day to turn it off.

Example: `04:00` and `16:00`, Monday to Friday.

### Every X hours

- **Every (hours)**: from 1 to 24.
- **Starting at (24h)**: the first time of the day; the others follow every X hours until midnight. Every 6 hours from 04:00 gives 04:00, 10:00, 16:00 and 22:00, every day.

### The time is the shutdown time

The scheduled time is when the server **stops**: with warnings at 30, 15… 1 minutes, the first announcement goes out 30 minutes before. A time just after midnight starts the warnings the evening before.

The line **Next restart** under the card shows the next shutdown (e.g. "today at 16:00"); the server Dashboard shows it too, under "Online for".

> Pick off-peak hours (e.g. 4:00 AM) to minimize impact on players.

> Up to version 0.25, the time was when the announcement went out and the server stopped after the warning delay. A restart set up before keeps its time: the server now stops at that time, so a few minutes earlier than before.

## Warn players

### Announcements before the stop (minutes)

One announcement per delay, from the longest to the shortest. Default for a new server: **30, 15, 10, 5, 4, 3, 2, 1**. **Add** opens a field for a new delay (1 to 120 minutes); the cross on a chip removes it. With no delay, the server stops without warning.

The world is saved just before the stop. If the server is started less than 30 minutes before a restart, only the announcements still to come are sent.

### Announcement message

Text sent to all players. `{minutes}` is replaced with each delay: `"Maintenance in {minutes} min"` becomes `"Maintenance in 30 min"`, then `"Maintenance in 15 min"`…

Leave the field **empty** to send the default message, in Nexum's language (English or French, as set in **Settings**) at the time of the announcement ("The server will restart in 1 minute" for the last one).

## Game updates

### Update the game at restart time

Off by default, and only active with the scheduled restart. Right before the shutdown, Nexum checks whether a server update is available on Steam:

- **Update available**: shutdown, [world backup](backups.md#backup-before-every-update), update with SteamCMD, then start. The result (installed build, backup name) is written in the log of the new session.
- **Server up to date**, or Steam doesn't answer: plain restart.
- If the backup or the update fails, the server restarts on the version already installed and the log says why.

### Check for updates while the server runs

Off by default, and independent of the scheduled restart. Nexum asks Steam whether a server update is out every **1, 2, 4, 6 or 12 hours** (counted from the server start). When one is found:

1. A line in the server's logs gives the installed and the new build.
2. Players are warned for **Warn players (minutes before)** (10 by default): an announcement at that delay, then at each shorter delay of the **Warn players** card. The default message says it's a game update.
3. Shutdown, world backup, update with SteamCMD, then start.

Up to date: nothing is written in the logs. If a scheduled restart is already counting down, the check waits for the next one. If the backup or the update fails, the server restarts on the installed version and Nexum doesn't try that same update again while it runs (it tries again for a newer build, at the scheduled restart if **Update the game at restart time** is on, or the next time Nexum starts).

Both options keep the server in step with game patches without doing anything: a server that is one version behind refuses players who updated their game. No effect for a server installed through the **Steam library** (Steam updates it) or if SteamCMD isn't installed. Valheim mods are not updated automatically.

## Wild creatures (ARK)

On an ARK: Survival Ascended server, the page has a **Wild creatures** card. Both options send the RCON command `DestroyWildDinos`: wild creatures disappear and respawn with the current settings (handy after changing mods or creature levels). Tamed creatures are not affected.

- **Renew wild creatures after each start**: after every start (button, automatic start, restart, relaunch after a crash). Nexum waits until RCON answers (the server takes 1 to 2 minutes to load), and gives up after 15 minutes.
- **And while the server runs, at regular intervals**: every N hours (12 by default), counted from the server start.

The result is written in the server's logs. RCON must be enabled.

## How it works

Each server has its own schedule: every running server is handled at its own times, whether or not it is selected in Nexum.

1. Every 30 seconds, Nexum looks for the next shutdown of each running server.
2. When the first announcement is due, the countdown starts: one announcement per delay.
3. At the last delay, the stop starts: last announcement, world save, then shutdown when the delay is over.
4. Short pause, then the server starts again.

The countdown is cancelled if the server is stopped or restarted by hand in the meantime, or if the time is removed from the schedule (a line in the logs says so).

## Requirements

> ⚠️ **Palworld: the REST API must be enabled** in `PalWorldSettings.ini` (`RESTAPIEnabled=True`) for the announcements and the save. If it is disabled, Nexum shows a warning with an **Enable** button. Without it, the server stops at the scheduled time via `taskkill /F`, with no warning or save: you risk losing recent data.

**ARK: Survival Ascended** uses RCON: Nexum sends the announcements in game, saves the world, then stops the server with `DoExit` (the world is saved again) and restarts it. Without RCON, the restart stops it at the scheduled time with no warning or save (the game saves every 15 minutes by default); the **Scheduling** page offers to turn RCON on.

**Valheim** has no API, so players can't be warned in game, but it shuts down cleanly at the scheduled time: Nexum sends it CTRL+Break and the server saves the world before closing. A forced stop only happens as a last resort, if the server doesn't respond.

**Enshrouded** has no API either, so players can't be warned in game, but it shuts down cleanly: Nexum sends it CTRL+Break, the server saves the world, then restarts.

**Astroneer**: Nexum doesn't use its admin console, so the restart stops it at the scheduled time, with no in-game warning or save beforehand.

**RuneScape: Dragonwilds** has no API and can't shut down cleanly on Windows: the restart stops it at the scheduled time, with no in-game warning. The server saves the world by itself every 5 minutes, so at most the last 5 minutes are lost.

## Use cases

### Nightly restart (recommended)

```
Fixed times: 04:00, every day
Announcements: 30 15 10 5 4 3 2 1
Message: "Daily maintenance in {minutes} min"
```

### Two restarts on weekdays

```
Fixed times: 06:00 and 18:00, Monday to Friday
Announcements: 15 5 1
```

### Busy server

```
Every 6 hours starting at 04:00
Check for updates while the server runs: every 2 hours, warn 10 minutes before
```

## Interaction with automatic backups

Scheduled restart and automatic backups are **independent**. You can enable both:

- Auto backups every hour (continuous safety net)
- Scheduled restart at 4 AM (daily maintenance)

> Graceful shutdown makes its own save via the API, independently of the ZIP backup scheduler.

## Current limitations

- Every X hours runs every day (days of the week only apply to fixed times)
- No notification when the restart fails (check the logs)
