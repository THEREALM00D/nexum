export default {
  dragonwildsConfig: {
    title: "Configuration",
    subtitle: "DedicatedServer.ini + launch arguments",
    notice:
      "Your Player ID is shown at the bottom of the game's Settings menu: the server won't start without it. The server loads the world named in \"World name\"; to pick another world or bring over a single-player world, use the Backups page.",
    groups: {
      server: "Server",
      access: "Owner and administration",
      network: "Network",
      advanced: "Advanced",
    },
    policy: {
      Crossplay: "Crossplay (PC and consoles)",
      PC: "PC only",
    },
    fields: {
      ServerName: {
        label: "Server name",
        description:
          'Shown in the "Created By" column of the worlds list. Randomly generated if empty.',
      },
      DefaultWorldName: {
        label: "World name",
        description:
          "World loaded at startup (the world's name, not its .sav file name), created if it doesn't exist. It's also the name players search for in the worlds list (case-sensitive).",
      },
      WorldPassword: {
        label: "World password",
        description: "Asked of players to join. Empty = open to everyone.",
      },
      OwnerId: {
        label: "Owner Player ID",
        description:
          "Your Player ID, at the bottom of the game's Settings menu. The owner can ban and unban anyone. Required: the server won't start without it.",
      },
      AdminPassword: {
        label: "Admin password",
        description:
          "Entered in game (Pause → Settings → Server Management) to become an admin: ban online players. The server removes it from its file after reading it; Nexum puts it back on every start.",
      },
      Port: {
        label: "Game port (UDP)",
        description:
          "7777 by default. A second server on this PC needs another port (7778…).",
      },
      BeaconPort: {
        label: "Beacon port (UDP)",
        description:
          "8888 by default (game port + 1111). Forward it on your router like the game port.",
      },
      PlatformPolicy: {
        label: "Allowed platforms",
        description:
          "Crossplay: PC and console players. PC only: PC players only.",
      },
      customArgs: {
        label: "Extra arguments",
        description:
          "Added to the server command line, after -Port and -BeaconPort.",
      },
    },
  },
};
