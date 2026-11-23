export default {
  arkConfig: {
    title: "Configuration",
    subtitle: "GameUserSettings.ini + command line",
    notice:
      "Session name, passwords, PvE and RCON are written to GameUserSettings.ini; map, max players, ports and BattlEye go on the command line. Other INI settings are edited by hand while the server is stopped: the server rewrites the file when it stops.",
    groups: {
      server: "Server",
      access: "Access and administration",
      network: "Network",
      advanced: "Advanced",
    },
    maps: {
      TheIsland_WP: "The Island",
      TheCenter_WP: "The Center",
      ScorchedEarth_WP: "Scorched Earth",
      Aberration_WP: "Aberration",
      Extinction_WP: "Extinction",
      Ragnarok_WP: "Ragnarok",
      Valguero_WP: "Valguero",
      LostColony_WP: "Lost Colony",
      Astraeos_WP: "Astraeos",
    },
    fields: {
      SessionName: {
        label: "Session name",
        description:
          "Server name in the unofficial server list: this is what players search for.",
      },
      map: {
        label: "Map",
        description:
          "One world per map (SavedArks/<map> folder). Switching maps doesn't delete the old world. Some maps are paid: players must own them.",
      },
      maxPlayers: {
        label: "Max players",
        description:
          "70 by default. Passed to the server as -WinLiveMaxPlayers, the only setting it honors.",
      },
      ServerPVE: {
        label: "PvE mode",
        description:
          "On: players can't attack each other or each other's buildings.",
      },
      ServerPassword: {
        label: "Server password",
        description: "Asked to players to join. Empty = open to everyone.",
      },
      ServerAdminPassword: {
        label: "Admin password",
        description:
          "For in-game admin commands (EnableCheats <password>) and for RCON. If RCON is on without a password, Nexum creates one at startup.",
      },
      RCONEnabled: {
        label: "RCON",
        description:
          "Needed for a clean stop (the world is saved), saving a running server, announcements before a scheduled restart and the Players page. Without RCON, Nexum stops the server without saving (up to 15 min of progress lost).",
      },
      port: {
        label: "Game port (UDP)",
        description:
          "7777 by default. The only port to forward on your router. A 2nd server on this PC needs another port.",
      },
      queryPort: {
        label: "Query port (UDP)",
        description:
          "27015 by default. No need to forward it, but two ARK servers on this PC need different ones.",
      },
      rconPort: {
        label: "RCON port (TCP)",
        description:
          "27020 by default. Never open it to the Internet: Nexum connects to it from this PC.",
      },
      battlEye: {
        label: "BattlEye",
        description: "Anti-cheat. Off: the server starts with -NoBattlEye.",
      },
      customArgs: {
        label: "Extra arguments",
        description:
          "Added at the end of the command line, separated by spaces (e.g. -ForceAllowCaveFlyers). Don't put passwords here: the server log copies the command line.",
      },
    },
  },
};
