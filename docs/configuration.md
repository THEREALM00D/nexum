# Server configuration

🇬🇧 English | 🇫🇷 [Français](configuration.fr.md)

Graphical editor for the `PalWorldSettings.ini` file.

## Source file

```
{serverPath}/Pal/Saved/Config/WindowsServer/PalWorldSettings.ini
```

Nexum reads this file when the **Configuration** page loads, and writes changes when you click **Save**.

> ⚠️ The server must be **restarted** for changes to take effect.

## Difficulty presets

Three predefined presets change about twenty settings in one click:

### Casual

- XP, capture, and drop rates ×2 to ×3
- Damage taken greatly reduced
- Fast regeneration
- No death penalty
- No invasions

### Normal

- All settings at Palworld's default values

### Hard

- XP and capture rates reduced (×0.8)
- Damage taken increased
- Death penalty active
- Invasions enabled

## Main settings

### Server

| Setting              | Description                                  |
| -------------------- | -------------------------------------------- |
| `ServerName`         | Name shown in the server list                |
| `ServerDescription`  | Short description                            |
| `AdminPassword`      | Admin password (required for the REST API)   |
| `ServerPassword`     | Password to join the server (empty = public) |
| `ServerPlayerMaxNum` | Maximum number of players (default 32)       |
| `PublicPort`         | Game listening port (default 8211, UDP)      |
| `Region`             | Hosting region                               |

### REST API

| Setting          | Description                                        |
| ---------------- | -------------------------------------------------- |
| `RESTAPIEnabled` | Enables the local REST API (recommended for Nexum) |
| `RESTAPIPort`    | HTTP port for the API (default 8212)               |

> **Important**: with the REST API enabled, Nexum can show players, handle kick/ban, and cleanly stop the server with a save.

### RCON

| Setting       | Description               |
| ------------- | ------------------------- |
| `RCONEnabled` | Enables the RCON protocol |
| `RCONPort`    | RCON port (default 25575) |

### Gameplay (selected)

| Setting                  | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| `Difficulty`             | Overall difficulty (None / Easy / Normal / Hard)     |
| `DayTimeSpeedRate`       | Daytime speed                                        |
| `NightTimeSpeedRate`     | Nighttime speed                                      |
| `ExpRate`                | XP multiplier                                        |
| `PalCaptureRate`         | Pal capture rate                                     |
| `DeathPenalty`           | Death penalty (None / Item / ItemAndEquipment / All) |
| `bIsPvP`                 | Enables PvP                                          |
| `bEnableInvaderEnemy`    | Enables raids/invasions                              |
| `bEnableFriendlyFire`    | Friendly fire                                        |
| `bEnableNonLoginPenalty` | Counts offline time against bases                    |

> Over **170 settings** are available in the editor. See the [official Palworld docs](https://docs.palworldgame.com) for the full list.

## Saving the configuration

The **Save** button:

1. Writes all changed values into `PalWorldSettings.ini`
2. Preserves the structure and the `[/Script/Pal.PalGameWorldSettings]` section
3. Shows a success or error notification

> If the server is running, **restart it** from the Dashboard to apply the changes.

## Tips

- **Enable RESTAPI** from the start to make use of all of Nexum's features
- Set a **strong admin password**: it's used for both the REST API and RCON
- **Back up your INI file** before trying a preset (the preset button overwrites the affected values)
