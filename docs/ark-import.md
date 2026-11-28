# Moving an existing ARK server to Nexum

🇬🇧 English | 🇫🇷 [Français](ark-import.fr.md)

You already host an ARK: Survival Ascended server with another tool or a `.bat` file? Nexum can take it over in place: same folder, same world, same players and tribes, same mods and settings. Nothing is copied or moved.

## Before you start

- **Stop the server in the old tool** and turn off its automatic restart: two programs must not start the same server.
- Keep the old tool installed until the server runs fine in Nexum.
- The first update from Nexum can take longer, if the old tool left an old version of the game: see [Updating the server](installation.md#updating-the-server).

## Add the server

Use **Servers → Add server** (or the setup wizard, **I already have a server**) and choose the server folder, the one that contains `ShooterGame`. Nexum recognizes ARK and shows **Take over the launch line**.

The files of the folder stay as they are: `GameUserSettings.ini`, `Game.ini`, mod sections and the files mods write under `ShooterGame\Saved`, the worlds in `SavedArks`, and the mods already downloaded (the first start doesn't download them again).

What only exists on the **launch line** of the old tool (map, ports, mods, options) has to be taken over. Nexum finds it on its own:

- **Server log**: the server writes its whole launch line in `ShooterGame\Saved\Logs\ShooterGame.log` every time it starts. Nexum reads the most recent log that has one, skipping the lines Nexum itself started the server with. Nothing to do.
- **Paste**: paste the line yourself (copied from the old tool).
- **.bat file**: choose the `.bat` or `.cmd` file that starts the server.

You can edit the line before saving.

## What is taken over

The summary shows what Nexum will use:

| On the launch line                                          | In Nexum                                                         |
| ----------------------------------------------------------- | ---------------------------------------------------------------- |
| Map (`TheIsland_WP`, modded map…)                           | **Configuration → General**, Map                                 |
| `?Port=` or `-port=`, `?QueryPort=`, `?RCONPort=`           | **Configuration → General**, Network (`?Port` wins over `-port`) |
| `-WinLiveMaxPlayers=`, `-NoBattlEye`                        | **Configuration → General**                                      |
| `-mods=`                                                    | **Mods** page, in the same order                                 |
| `-passivemods=`                                             | **Mods** page, as passive mods (active if also in `-mods=`)      |
| `-clusterid=`, `-ClusterDirOverride=`, `-ServerPlatform=`…  | **Configuration → Game settings**, launch options                |
| `?SessionName=`, `?ServerAdminPassword=` and other `?` keys | Written to `GameUserSettings.ini`, as the server itself does     |
| Anything else (`-servergamelogincludetribelogs`…)           | **Configuration → General**, extra arguments                     |

The RCON port and max players come from `GameUserSettings.ini` when the line doesn't set them.

**World**: Nexum looks for the map's world in `SavedArks` and in every `AltSaveDirectoryName` folder, and picks the most recent one. If several are found, choose one in the summary: the line's `?AltSaveDirectoryName=` doesn't decide, since an old tool may have left it while the world was saved elsewhere. The folder you pick is kept in the **World folder** field of the General tab.

The summary also lists the mod settings kept in place: mod sections of the INI files and the files mods write in `ShooterGame\Saved\SaveGames`. Afterwards, each mod section is a **Mod: [Section]** group in **Configuration → Game settings**, where you can change its settings ([ARK page](ark.md#game-settings)). The `SaveGames` files are written by the mods themselves: they keep working, but Nexum doesn't edit them.

## What Nexum flags

- **Ports already used** by another Nexum server, running or not. Two servers of a cluster often share the default query port (27015): give each one its own before starting them together.
- Options Nexum can't take over as is: a value with spaces (for example a cluster folder path with spaces), an invalid value, `-MULTIHOME` (kept, but RCON may stop answering).
- **ServerAPI plugins** (`AsaApiLoader.exe`): Nexum starts `ArkAscendedServer.exe` directly, so these plugins are not loaded.
- Script variables (`%NAME%`) in a `.bat` line: replace them with their value in the line.
- **No world found**: the server will create a new world on its first start. Check the map and the folder.

## Server already added

For an ARK server added before this feature, or to take over a new line: **Configuration → General → Take over a launch line**. It replaces the map, ports, mods, launch options and extra arguments of the server.
