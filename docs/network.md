# Network & firewall

🇬🇧 English | 🇫🇷 [Français](network.fr.md)

Managing Windows firewall rules to allow connections to the server.

## Why configure the firewall?

By default, Windows blocks inbound connections to `PalServer.exe`. Without a firewall rule:

- Players **cannot join** your server from outside
- The REST API and RCON are unreachable even from the local network

Nexum creates targeted `netsh` rules for the ports in use.

## Permissions

Nexum runs without administrator rights. When you add or remove a rule, Windows asks you to confirm (UAC prompt): **one** confirmation per action, including **Apply all**. If you decline, nothing is changed.

> Custom rule names can only contain letters, digits, spaces and `- _ . ( ) :` (80 characters max).

## Standard rules

Three pre-configured rules correspond to the Palworld ports:

| Rule         | Port (default) | Protocol  | Purpose            |
| ------------ | -------------- | --------- | ------------------ |
| **Game**     | 8211           | UDP + TCP | Player connections |
| **RCON**     | 25575          | TCP       | Admin console      |
| **REST API** | 8212           | TCP       | Local HTTP API     |

Ports are read from `PalWorldSettings.ini` (`PublicPort`, `RCONPort`, `RESTAPIPort`).

## Available actions

### Toggle an individual rule

Each rule has a toggle. Enabling it creates the rule in the Windows firewall; disabling it removes it.

### Enable all / Remove all

- **Enable all**: creates the 3 standard rules at once
- **Remove all**: removes every Nexum rule (standard + custom)

### Custom rules

To expose other ports (mods, third-party services):

1. Enter a **name**, a **port**, and choose the **protocol** (TCP or UDP)
2. Click **Create**
3. The rule appears in the list with a delete button

> Custom rules are prefixed with `Nexum - ` in `netsh advfirewall` to make them easy to identify.

## Exposing the server to the Internet

The Windows firewall alone isn't enough — you also need to:

1. **Set up port forwarding** on your router
   - Forward `PublicPort` (UDP) to your machine's local IP
   - Enabling UPnP can do this automatically
2. **Know your public IP** ([whatismyipaddress.com](https://whatismyipaddress.com))
3. **Share**: `PUBLIC_IP:8211`

> ⚠️ **Never** expose the RCON and REST API ports to the Internet. They are designed for LAN use only, and exposing them would let anyone manipulate your server.

## Verification

To test that the rules are active:

```powershell
netsh advfirewall firewall show rule name=all | findstr "Nexum"
```

You should see the rules created by the application.
