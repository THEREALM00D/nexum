# Logs

🇬🇧 English | 🇫🇷 [Français](logs.fr.md)

Real-time display of the `PalServer.exe` process output and Nexum's internal messages.

## Log sources

Three sources are merged into the same view:

| Prefix      | Origin                                             |
| ----------- | -------------------------------------------------- |
| `[Manager]` | Nexum's internal messages (start, stop, API, etc.) |
| `[ERR]`     | Error output (stderr) from the server process      |
| _(none)_    | Standard output (stdout) from the server process   |

`[Manager]` messages are written in the app's language (French or English) at the time they're logged: a session saved before you switch languages keeps the previous one.

## Colors

- **Red**: lines starting with `[ERR]`
- **Blue**: lines starting with `[Manager]`
- **Gray**: everything else (the server's standard output)

## Known limitations

### PalServer.exe is quiet

Unlike many game servers, **PalServer.exe writes very little to stdout/stderr**. Most Palworld logs are written to internal files instead:

```
{serverPath}/Pal/Saved/Logs/
```

For detailed server logs (player connections, Unreal Engine errors, etc.), check these files directly.

### On-screen view

The live view shows the **last 500 lines** of the current session. The full session is in its file (see below).

### Servers started before Nexum

If a server was already running when Nexum opened (Nexum "adopts" it), its output can't be read: only Nexum's own `[Manager]` lines are shown and saved for that session. Restart the server from Nexum to get its full log again.

Exception: **RuneScape: Dragonwilds**. Its standard output only carries warnings and errors, so Nexum reads the game's own log file instead (`RSDragonwilds/Saved/Logs/RSDragonwilds.log`, the engine timestamp is removed). This works for an adopted server too: the log picks up from where it was when Nexum opened.

### Valheim "Log file" field

In Valheim's **Configuration → Advanced**, leave **Log file** empty. When it's set, Valheim writes its output to that file instead of sending it to Nexum, so the Logs page, the Dashboard console and the saved sessions stay empty.

## Sessions (logs saved on disk)

Every server start opens a **new session**: the view starts empty, and everything is also written to a file that survives closing Nexum. A manual restart, the daily scheduled restart and an automatic restart after a crash each start a new session.

- **Session picker** (next to the buttons): **Current session (live)**, or any previous session to read it again. Sessions marked ⚠ **crashed** are the ones where the server stopped on its own with an error: that's the file to share in a bug report.
- **Folder button**: opens the folder with the log files, `%APPDATA%\Nexum\servers\<server id>\logs\` (`%APPDATA%\server-forge\…` for installs that started as ServerForge).
- Each line in the file starts with the time, e.g. `[14:32:07]`.
- Nexum keeps the **last 20 sessions** per server and deletes older ones. A session file is capped at **20 MB**: a longer session (a busy Dragonwilds server writes that much in about 11 hours) continues in a new file, which appears as a separate entry in the session list. A line at the end of one file and the start of the next links the two. Disk use stays bounded, even for a server stuck in an error loop.
- Files keep the raw log (IPs, Steam IDs): they stay on your PC. Personal data is only hidden when you **Copy** or **Save as .txt** (see below).

## Actions

### Auto-scroll

The view automatically scrolls down as new lines arrive. Scroll up to **pause** it: the view stays exactly where you are, even while the server keeps writing. A **New lines — back to live** button then appears; click it (or scroll back to the bottom) to resume.

### Copy / Save as .txt

To share the log (Discord, GitHub issue):

- **Copy**: copies the **whole** log of the selected session (the full file, not just the 500 lines on screen) to the clipboard, with a first line giving your Nexum version, the game and the date. Paste it directly: on Discord, a long paste is automatically turned into a `message.txt` file.
- **Save as .txt**: opens the Windows "Save as" dialog (Documents folder by default). Once saved, a **Show in folder** button opens the folder in Explorer, ready to attach the file.

The whole log is exported, not just the last lines: when a server stops on its own, the cause is usually near the **start** of the log, while the last lines only show the shutdown.

**Personal data is hidden automatically** in the copied or saved log (not in the on-screen view):

| Data                                                   | Becomes                                     |
| ------------------------------------------------------ | ------------------------------------------- |
| Public IP addresses                                    | `[IP]` (the port is kept, e.g. `[IP]:2456`) |
| Steam IDs (every player who joined)                    | `[SteamID]`                                 |
| Valheim crossplay join codes                           | `join code [hidden]`                        |
| Server password (in the `[Manager] Args:` line)        | `[hidden]`                                  |
| Dragonwilds world password, its hash and the join code | `[hidden]`                                  |
| 32-character IDs (Dragonwilds player IDs, world GUIDs) | `[ID]`                                      |

Local addresses (`127.0.0.1`, `0.0.0.0`, `192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`) are kept: they don't identify anyone and help diagnose network issues. **Player names are kept**: remove them yourself if needed. A version number with 4 parts (e.g. `1.0.0.0`) can look like an IP address and be hidden too.

### Clear

**Clear** button: empties the live view. It does **not** delete the session file nor stop future log capture. Disabled while you're reading a previous session.

## What you'll typically see

### On startup

```
[Manager] Starting server (PalServer.exe)...
[Manager] Args: -port=8211 -players=32
[Manager] Process started.
LogPalNetServer: Server starting on port 8211
LogWorld: Bringing World up for play
```

### While running

Very little output as long as there's no connection or error.

### On graceful shutdown (with API)

```
[Manager] Announcement sent: The server will restart in 5 minutes
[Manager] Saving...
[Manager] Save complete.
[Manager] Shutdown requested through the API (waiting 0 s).
[Manager] Server exited with code 0.
```

### On forced shutdown (without API)

```
[Manager] API unavailable: PAL_API_TIMEOUT
[Manager] Forcing the stop (taskkill)...
[Manager] Server exited with code 1.
```

## Diagnostics

To investigate a crash or unexpected behavior:

1. **Nexum logs**: look for `[ERR]` or `[Manager]` in the view. A line like `[Manager] The game server crashed (0xC0000005, access violation)` means the game itself crashed, not Nexum: the lines just above show what it was doing. If it happens again, report it to the game's developer with the log of that session. To have Nexum restart the server on its own, see [Restarting after a crash](installation.md#restarting-after-a-crash).
2. **Palworld logs**: open the latest file in `{serverPath}/Pal/Saved/Logs/`
3. **Windows Event Viewer**: Application → errors related to `PalServer.exe`

When reporting a bug to the Palworld team, attaching files from `Pal/Saved/Logs/` is more useful than Nexum's own log.
