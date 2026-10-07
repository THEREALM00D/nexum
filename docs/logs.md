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

> Note: `[Manager]` messages are currently emitted in French only, regardless of the app's display language (see [CLAUDE.md](../CLAUDE.md)).

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

### Valheim "Log file" field

In Valheim's **Configuration → Advanced**, leave **Log file** empty. When it's set, Valheim writes its output to that file instead of sending it to Nexum, so the Logs page, the Dashboard console and the saved sessions stay empty.

## Sessions (logs saved on disk)

Every server start opens a **new session**: the view starts empty, and everything is also written to a file that survives closing Nexum. A manual restart, the daily scheduled restart and an automatic restart after a crash each start a new session.

- **Session picker** (next to the buttons): **Current session (live)**, or any previous session to read it again. Sessions marked ⚠ **crashed** are the ones where the server stopped on its own with an error: that's the file to share in a bug report.
- **Folder button**: opens the folder with the log files, `%APPDATA%\Nexum\servers\<server id>\logs\` (`%APPDATA%\server-forge\…` for installs that started as ServerForge).
- Each line in the file starts with the time, e.g. `[14:32:07]`.
- Nexum keeps the **last 20 sessions** per server and deletes older ones. A single session file stops at **20 MB** (a note marks where), so a server stuck in an error loop can't fill your disk.
- Files keep the raw log (IPs, Steam IDs): they stay on your PC. Personal data is only hidden when you **Copy** or **Save as .txt** (see below).

## Actions

### Auto-scroll

The view automatically scrolls down as new lines arrive. Click and scroll up to pause auto-scroll, then scroll back down to resume it.

### Copy / Save as .txt

To share the log (Discord, GitHub issue):

- **Copy**: copies the **whole** log of the selected session (the full file, not just the 500 lines on screen) to the clipboard, with a first line giving your Nexum version, the game and the date. Paste it directly: on Discord, a long paste is automatically turned into a `message.txt` file.
- **Save as .txt**: opens the Windows "Save as" dialog (Documents folder by default). Once saved, a **Show in folder** button opens the folder in Explorer, ready to attach the file.

The whole log is exported, not just the last lines: when a server stops on its own, the cause is usually near the **start** of the log, while the last lines only show the shutdown.

**Personal data is hidden automatically** in the copied or saved log (not in the on-screen view):

| Data                                            | Becomes                                     |
| ----------------------------------------------- | ------------------------------------------- |
| Public IP addresses                             | `[IP]` (the port is kept, e.g. `[IP]:2456`) |
| Steam IDs (every player who joined)             | `[SteamID]`                                 |
| Valheim crossplay join codes                    | `join code [hidden]`                        |
| Server password (in the `[Manager] Args:` line) | `[hidden]`                                  |

Local addresses (`127.0.0.1`, `0.0.0.0`, `192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`) are kept: they don't identify anyone and help diagnose network issues. **Player names are kept**: remove them yourself if needed. A version number with 4 parts (e.g. `1.0.0.0`) can look like an IP address and be hidden too.

### Clear

**Clear** button: empties the live view. It does **not** delete the session file nor stop future log capture. Disabled while you're reading a previous session.

## What you'll typically see

### On startup

```
[Manager] Starting Palworld server...
[Manager] Processus démarré.
LogPalNetServer: Server starting on port 8211
LogWorld: Bringing World up for play
```

### While running

Very little output as long as there's no connection or error.

### On graceful shutdown (with API)

```
[Manager] Annonce envoyée: Le serveur va redémarrer...
[Manager] Sauvegarde en cours...
[Manager] Sauvegarde terminée.
[Manager] Shutdown API envoyé (attente 0s).
[Manager] Server exited with code 0
```

### On forced shutdown (without API)

```
[Manager] API indisponible: Timeout
[Manager] Server exited with code 1
```

## Diagnostics

To investigate a crash or unexpected behavior:

1. **Nexum logs**: look for `[ERR]` or `[Manager]` in the view
2. **Palworld logs**: open the latest file in `{serverPath}/Pal/Saved/Logs/`
3. **Windows Event Viewer**: Application → errors related to `PalServer.exe`

When reporting a bug to the Palworld team, attaching files from `Pal/Saved/Logs/` is more useful than Nexum's own log.
