# Valheim player tracking (Odin-Eye)

🇬🇧 English | 🇫🇷 [Français](valheim-players.fr.md)

Valheim has no native REST API. To get the **Players** page (online status, playtime, sessions) and a reliable online count on the dashboard, ServerForge relies on the third-party BepInEx plugin [Odin-Eye](https://sparcopt.github.io/odin-eye/).

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

## 2. Configure ServerForge

1. Open **Configuration → Network** for your Valheim server.
2. Fill in **Odin-Eye URL** with the same address, e.g. `http://127.0.0.1:21618`.
3. Click **Save** at the bottom of the page.

Leave the field empty to disable player tracking.

## 3. What you get

- **Players page**: history of every player seen, with online status, last connection, total playtime and session count. Tracking runs every 30 seconds **while the server is running**.
- **Dashboard**: the "Connected players" counter uses Odin-Eye, with or without crossplay. Without Odin-Eye, the counter can only be read from the console logs **when crossplay is enabled** (Valheim only logs the player count for crossplay sessions); otherwise it shows "—". It can also stay wrong for a server that was already running when ServerForge started (its logs are lost).

## Limitations

- No player IP address (the plugin does not provide it): the "Last IP" column stays empty.
- Player IDs are shown as plain SteamID64 (the `Steam_` prefix is removed).
- Odin-Eye is not installed or updated by ServerForge; you manage it like any other BepInEx mod.
