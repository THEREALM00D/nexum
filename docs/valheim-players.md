# Valheim player tracking (Odin-Eye)

🇬🇧 English | 🇫🇷 [Français](valheim-players.fr.md)

Valheim has no native REST API. To get the **Players** page (online status, playtime, sessions) and a reliable online count on the dashboard, Nexum relies on the third-party BepInEx plugin [Odin-Eye](https://sparcopt.github.io/odin-eye/).

## 1. Install Odin-Eye on the server

Requirements: BepInEx installed on the Valheim server (5.4.22 recommended).

1. Download the latest Odin-Eye release and copy all the `.dll` files into `Valheim/BepInEx/plugins/`.
2. Start the server once so the plugin generates `Valheim/BepInEx/config/org.bepinex.plugins.odineye.cfg`.
3. Edit that file and set `HttpServerAddress`, for example:

   ```
   HttpServerAddress = http://127.0.0.1:21618/
   ```

   - Use a port that is **not** the game port (2456) nor the Steam query port (2457).
   - Use `127.0.0.1`: the plugin has **no authentication**, so never expose this port to the network or the Internet.

4. Restart the server and check that the BepInEx log contains `OdinEye running!`.

## 2. Configure Nexum

1. Open **Configuration → Network** for your Valheim server.
2. Fill in **Odin-Eye URL** with the same address, e.g. `http://127.0.0.1:21618`.
3. With the server running, click **Test** next to the field: Nexum queries the plugin and shows the number of players online, or what went wrong.
4. Click **Save** at the bottom of the page.

Leave the field empty to disable player tracking.

## 3. What you get

- **Players page**: history of every player seen, with online status, last connection, total playtime and session count. Tracking runs every 30 seconds **while the server is running**.
- **Dashboard**: the "Connected players" counter uses Odin-Eye, with or without crossplay. Without Odin-Eye, the counter can only be read from the console logs **when crossplay is enabled** (Valheim only logs the player count for crossplay sessions); otherwise it shows "—". It can also stay wrong for a server that was already running when Nexum started (its logs are lost).

The banner on the **Dashboard** shows the tracking status: off (no address), waiting for the server to start, waiting for the plugin (it only starts once the world is loaded, which can take a minute or two), connected, or not responding with the reason. "Not responding" only appears if the plugin still doesn't answer 3 minutes after the server started.

## Troubleshooting

If **Test** or the Dashboard says Odin-Eye is not responding:

- **"Nothing answers at…"**: the plugin is not listening at this address.
  - Odin-Eye runs inside the Valheim server: the server must be running, and its world loaded (the plugin starts a few seconds after the server).
  - Open the BepInEx log (`Valheim/BepInEx/LogOutput.log`) and look for `OdinEye running!`. If it is missing, the plugin did not load: check that BepInEx works and that all the Odin-Eye `.dll` files are in `BepInEx/plugins/`. If you see `Starting Http Server at …` followed by an error, the address in `HttpServerAddress` is invalid or its port is already in use.
  - The address in Nexum must match `HttpServerAddress` exactly (same port). The `.cfg` file is only read when the server starts: restart it after editing it.
- **"Something answers at…, but it's not the Odin-Eye players API"**: another program uses this port, or the plugin version does not expose the players list. Pick another port in both places.
- **"Invalid Odin-Eye address"**: use the `http://127.0.0.1:21618` form.

## Limitations

- No player IP address (the plugin does not provide it): the "Last IP" column stays empty.
- Player IDs are shown as plain SteamID64 (the `Steam_` prefix is removed).
- Odin-Eye is not installed or updated by Nexum; you manage it like any other BepInEx mod.
