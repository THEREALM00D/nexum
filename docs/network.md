# Network & firewall

🇬🇧 English | 🇫🇷 [Français](network.fr.md)

Managing Windows firewall rules to allow connections to the server.

## Why configure the firewall?

By default, Windows blocks inbound connections to the game server (`PalServer.exe`, `valheim_server.exe`…). Without a firewall rule:

- Players **cannot join** your server from outside
- On Palworld, the REST API and RCON are unreachable even from the local network

Nexum creates targeted `netsh` rules for the ports in use.

## Permissions

Nexum runs without administrator rights. When you add or remove a rule, Windows asks you to confirm (UAC prompt): **one** confirmation per action, including **Apply all**. If you decline, nothing is changed.

> Custom rule names can only contain letters, digits, spaces and `- _ . ( ) :` (80 characters max).

## Standard rules

Pre-configured rules correspond to the Palworld ports (the game port gets one rule per protocol):

| Rule         | Port (default) | Protocol  | Purpose            |
| ------------ | -------------- | --------- | ------------------ |
| **Game**     | 8211           | UDP + TCP | Player connections |
| **RCON**     | 25575          | TCP       | Admin console      |
| **REST API** | 8212           | TCP       | Local HTTP API     |

Ports are read from `PalWorldSettings.ini` (`PublicPort`, `RCONPort`, `RESTAPIPort`). In the Windows firewall, these rules are named `Palworld Server - Game UDP`, `Palworld Server - Game TCP`, `Palworld Server - RCON` and `Palworld Server - REST API`.

### Valheim

Two UDP rules:

| Rule                       | Port (default) | Protocol | Purpose            |
| -------------------------- | -------------- | -------- | ------------------ |
| **Valheim Server - Game**  | 2456           | UDP      | Player connections |
| **Valheim Server - Query** | 2457           | UDP      | Steam query        |

The game port comes from **Configuration**, the query port is the game port + 1. After changing the port, click **Apply all** again. Forward the ports shown on the **Join the server** card on your router for players outside your network.

### Astroneer

A single UDP rule:

| Rule                        | Port (default) | Protocol | Purpose            |
| --------------------------- | -------------- | -------- | ------------------ |
| **Astroneer Server - Game** | 8777           | UDP      | Player connections |

The port comes from **Configuration** (`Engine.ini`). After changing it, click **Apply all** again. Forward this port on your router for players outside your network. The console port (`ConsolePort`) gets no rule: never expose it.

### RuneScape: Dragonwilds

Two UDP rules, with the port in their name so that several Dragonwilds servers on the same PC each have their own:

| Rule                                   | Port (default) | Protocol | Purpose            |
| -------------------------------------- | -------------- | -------- | ------------------ |
| **Dragonwilds Server - Game (7777)**   | 7777           | UDP      | Player connections |
| **Dragonwilds Server - Beacon (8888)** | 8888           | UDP      | Beacon             |

Ports come from **Configuration → Network**. After changing a port, remove the old rule (Windows Firewall) and apply the new one. Forward both ports on your router for players outside your network. More in [RuneScape: Dragonwilds](dragonwilds.md).

### Enshrouded

A single UDP rule, with the port in its name so that several Enshrouded servers on the same PC each have their own:

| Rule                                  | Port (default) | Protocol | Use                |
| ------------------------------------- | -------------- | -------- | ------------------ |
| **Enshrouded Server - Query (15637)** | 15637          | UDP      | Player connections |

The port comes from **Configuration → Network**. After changing it, remove the old rule (Windows Firewall) and apply the new one. Forward this port on your router for players outside your network. More in [Enshrouded](enshrouded.md).

## Available actions

### Toggle an individual rule

Each rule has an **Enable** / **Disable** button. Enabling creates the rule in the Windows firewall; disabling removes it.

### Apply all / Remove all

- **Apply all**: creates all the standard rules of the game at once
- **Remove all**: removes the standard rules of the game (custom rules are kept)

### Custom rules

To expose other ports (mods, third-party services):

1. Enter a **name**, a **port**, and choose the **protocol** (TCP or UDP)
2. Click **Create**
3. The rule appears in the list with a delete button

> A custom rule keeps the name you gave it in the Windows firewall, which makes it easy to find.

## Exposing the server to the Internet

The Windows firewall alone isn't enough — you also need to:

1. **Set up port forwarding** on your router
   - Forward the game's UDP ports (shown on the Dashboard's **Join the server** card; `PublicPort` on Palworld) to your machine's local IP
   - Enabling UPnP can do this automatically
2. **Know your public IP**: click **Show my public IP** on the Dashboard's **Join the server** card
3. **Share**: `PUBLIC_IP:8211` on Palworld

> ⚠️ **Never** expose the RCON and REST API ports to the Internet. They are designed for LAN use only, and exposing them would let anyone manipulate your server.

## Verification

To test that the rules are active:

```powershell
netsh advfirewall firewall show rule name=all | findstr /C:"Server - "
```

You should see the standard rules created by Nexum (`<Game> Server - …`). Custom rules keep the name you gave them.
