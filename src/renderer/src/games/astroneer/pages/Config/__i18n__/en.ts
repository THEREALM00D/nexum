export default {
  astroneerConfig: {
    title: "Configuration",
    subtitle: "Engine.ini + AstroServerSettings.ini",
    groups: {
      general: "Server",
      players: "Players",
      save: "Save",
      performance: "Performance",
      advanced: "Advanced",
    },
    fields: {
      ServerName: {
        label: "Server name",
        description: "Name shown in the server browser.",
      },
      ServerAdvertisedName: {
        label: "Advertised name (override)",
        description: "If set, overrides the server name shown to players.",
      },
      PublicIP: {
        label: "Public IP",
        description:
          "Public IP advertised to players. Required to appear in the server browser.",
      },
      ServerPassword: {
        label: "Server password",
        description:
          "Password required to join. Leave empty for a public server.",
      },
      Port: {
        label: "Port",
        description: "UDP port used by players (default 8777).",
      },
      MaxPlayerCount: {
        label: "Max players",
        description:
          "Maximum concurrent players (hard cap of 8 on the game side).",
      },
      OwnerName: {
        label: "Owner (Steam name)",
        description:
          "The first player connecting with this name becomes the server owner.",
      },
      OwnerGuid: {
        label: "Owner (SteamID64)",
        description: "Leave at 0 for automatic assignment.",
      },
      PlayerActivityTimeout: {
        label: "Idle timeout (s)",
        description:
          "Delay before kicking an inactive (AFK) player. 0 = disabled.",
      },
      DenyUnlistedPlayers: {
        label: "Whitelist only",
        description: "If enabled, only explicitly allowed players can join.",
      },
      ActiveSaveFileDescriptiveName: {
        label: "Active save name",
        description:
          "Save file name (without extension). Changing it creates/loads another game.",
      },
      AutoSaveGameInterval: {
        label: "Auto-save interval (s)",
        description: "Interval between each automatic save.",
      },
      BackupSaveGamesInterval: {
        label: "Internal backup interval (s)",
        description:
          "Interval between each internal game backup (independent from Nexum backups).",
      },
      MaxServerFramerate: {
        label: "Max framerate (players connected)",
        description: "Server tick/framerate cap while players are connected.",
      },
      MaxServerIdleFramerate: {
        label: "Max framerate (idle)",
        description: "Server framerate cap when no players are connected.",
      },
      bDisableServerTravel: {
        label: "Disable planet travel",
        description: "Prevents players from traveling between planets.",
      },
      VerbosePlayerProperties: {
        label: "Verbose player logs",
        description: "Enables more detailed logging of player properties.",
      },
      ConsolePort: {
        label: "Console port (RCON)",
        description:
          "TCP port for the console/RCON protocol. Never expose publicly — Nexum does not use it (MVP).",
      },
      ConsolePassword: {
        label: "Console password (RCON)",
        description:
          "Password required by a third-party RCON client to connect to the console port.",
      },
    },
  },
};
