# Backups

🇬🇧 English | 🇫🇷 [Français](backups.fr.md)

ZIP backup system for the Palworld server's `SaveGames` folder.

## What gets backed up?

Nexum zips the following folder:

```
{serverPath}/Pal/Saved/SaveGames/
```

This folder contains:

- The world state (terrain, structures, Pals)
- Player inventories and progression
- The ban list
- Save settings

> The `PalWorldSettings.ini` file is **not** included in the backup — it lives in `Pal/Saved/Config/WindowsServer/`.

## Configuration

### Backup folder

Default: `{userData}/backups` (typically `C:\Users\{user}\AppData\Roaming\server-forge\backups`).

You can choose a different folder (external drive, NAS) via the **folder** button.

### Rotation

The **Backups to keep** field defines how many backups are retained. Once the count is exceeded, the oldest ones are deleted automatically.

- `0`: no rotation, everything is kept
- `10` (default): keeps the 10 most recent

### Automatic backup

Interval selector:

| Option   | Frequency        |
| -------- | ---------------- |
| Disabled | No auto backup   |
| 15 min   | Every 15 minutes |
| 30 min   | Every 30 minutes |
| 1 h      | Every hour       |
| 3 h      | Every 3 hours    |
| 6 h      | Every 6 hours    |
| 12 h     | Every 12 hours   |
| 1 day    | Once a day       |

> Automatic backup only runs **while the server is running**.

## Actions

### Create manually

**Create a backup** button:

1. Zips the SaveGames folder (compression level 9 = max)
2. Names the file `backup-YYYY-MM-DD_HH-MM-SS.zip`
3. Applies rotation if needed
4. Shows a success notification

Creating a backup can take from a few seconds to several minutes depending on the world's size.

### Restore

**Restore** button on each backup:

1. Confirmation required
2. **The server must be stopped** (the button is disabled otherwise)
3. The current SaveGames folder is deleted
4. The ZIP's contents are extracted in its place

> ⚠️ Restoring **overwrites** the current save. Make a manual backup before restoring if you want to be able to roll back.

### Delete

**Delete** button on each backup — confirmation required.

## Best practices

- **Enable auto backup** from the start (every hour, for example)
- **Check periodically** that backups are being created correctly (check the logs and timestamps)
- **Store backups on a different drive** than the server's (in case of a disk failure)
- **Test a restore** at least once to make sure the process works
- Before a **major Palworld update**, make a manual backup so you can roll back if needed

## Recovering from a problem

If the server no longer starts after corruption:

1. Stop the server in the Dashboard (if it's zombied)
2. Go to **Backups**
3. Restore the most recent working backup
4. Restart the server

### Valheim: built-in `.old` files

Valheim itself keeps a copy of the previous save state next to the active one (`worldname.db.old` / `worldname.fwl.old`), refreshed on each save cycle. Since Nexum's ZIP backup already includes the whole save folder, these `.old` files are already captured in every backup automatically. In a pinch, without even going through Nexum, you can restore one manually by removing the `.old` extension — useful if corruption happened between two scheduled backups.
