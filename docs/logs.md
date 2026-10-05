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

### Limited buffer

Nexum keeps the **last 500 lines** in memory. Beyond that, older lines are removed from the display (but not from the process's own history).

## Actions

### Auto-scroll

The view automatically scrolls down as new lines arrive. Click and scroll up to pause auto-scroll, then scroll back down to resume it.

### Copy / Save as .txt

To share the log (Discord, GitHub issue):

- **Copy**: copies the **whole** log (the last 500 lines kept by Nexum) to the clipboard, with a first line giving your Nexum version, the game and the date. Paste it directly: on Discord, a long paste is automatically turned into a `message.txt` file.
- **Save as .txt**: opens the Windows "Save as" dialog (Documents folder by default). Once saved, a **Show in folder** button opens the folder in Explorer, ready to attach the file.

The whole log is exported, not just the last lines: when a server stops on its own, the cause is usually near the **start** of the log, while the last lines only show the shutdown.

> ⚠️ Before sharing, check the log doesn't contain IP addresses, Steam IDs or join codes. Nexum already hides passwords in its `[Manager] Args:` line.

### Clear

**Clear** button: empties the view completely. It does **not** stop future log capture.

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
