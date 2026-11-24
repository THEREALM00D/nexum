export default {
  AutoSavePeriodMinutes: {
    label: "Autosave",
    description: "Minutes between two world saves; 0 saves constantly.",
  },
  KickIdlePlayersPeriod: {
    label: "Kick idle players",
    description:
      "Idle seconds before a kick. Needs the -EnableIdlePlayerKick launch option.",
  },
  EnableAFKKickPlayerCountPercent: {
    label: "Idle kick threshold",
    description:
      "Kicks only apply above this fraction of max players (0 to 1).",
  },
  AdminLogging: {
    label: "Show admin commands",
    description: "Admin commands show up in chat.",
  },
  AllowHideDamageSourceFromLogs: {
    label: "Hide damage source",
    description: "False shows the damage source in tribe logs.",
  },
  RCONServerGameLogBuffer: {
    label: "Game log lines over RCON",
    description: "Number of game log lines sent over RCON.",
  },
  AlwaysNotifyPlayerLeft: {
    label: "Announce departures",
    description: "Players are always told when someone leaves.",
  },
  DontAlwaysNotifyPlayerJoined: {
    label: "Don't announce arrivals",
    description: "Turns off join announcements.",
  },
  AllowSharedConnections: {
    label: "Steam family sharing",
    description: "Allows family-sharing players.",
  },
  UseExclusiveList: {
    label: "Whitelist",
    description: "Only listed players can join (like -exclusivejoin).",
  },
  UseCharacterTracker: {
    label: "Character tracking",
    description: "Turns on character tracking (-disableCharacterTracker wins).",
  },
  SpectatorPassword: {
    label: "Spectator password",
    description: "Password of spectator mode for non-admins.",
  },
  BanListURL: {
    label: "Ban list URL",
    description: "Global ban list, read again every 10 minutes.",
  },
  AdminListURL: {
    label: "Admin list URL",
    description: "Online admin list, instead of AllowedCheaterAccountIDs.txt.",
  },
  UpdateAllowedCheatersInterval: {
    label: "Admin list refresh",
    description: "Seconds between two reads of the admin URL (3 minimum).",
  },
  CosmeticWhitelistOverride: {
    label: "Allowed cosmetics URL",
    description: "List of allowed custom cosmetics.",
  },
  CustomDynamicConfigUrl: {
    label: "Dynamic config URL",
    description:
      "Online dynamicconfig.ini file. Needs the -UseDynamicConfig launch option.",
  },
  CustomLiveTuningUrl: {
    label: "Live tuning URL",
    description: "Live tuning file.",
  },
  BadWordListURL: {
    label: "Bad words URL",
    description: "Your own list of filtered words.",
  },
  BadWordWhiteListURL: {
    label: "Good words URL",
    description: "Your own list of words never filtered.",
  },
  bFilterChat: {
    label: "Filter chat",
    description: "Filters chat with the word lists.",
  },
  bFilterCharacterNames: {
    label: "Filter character names",
    description: "Filters character names with the word lists.",
  },
  bFilterTribeNames: {
    label: "Filter tribe names",
    description: "Filters tribe names with the word lists.",
  },
  LogChatMessages: {
    label: "Chat log",
    description: "Saves chat as JSON in Saved/Logs/ChatLogs.",
  },
  ChatLogFileSplitIntervalSeconds: {
    label: "Chat log split",
    description: "Seconds between two chat log files (45 minimum).",
  },
  ChatLogFlushIntervalSeconds: {
    label: "Chat log flush",
    description: "Seconds between two writes to disk (15 minimum).",
  },
  ChatLogMaxAgeInDays: {
    label: "Chat log retention",
    description: "Days kept; -1 = no limit.",
  },
  DontRestoreBackup: {
    label: "Don't restore a backup",
    description:
      "Doesn't restore a backup automatically after a corrupted world.",
  },
  EnableMeshBitingProtection: {
    label: "Bite-through-walls protection",
    description: "False turns this protection off.",
  },
  ServerEnableMeshChecking: {
    label: "Terrain checking",
    description: "Checks the terrain when vegetation grows back.",
  },
  AutoRestartIntervalSeconds: {
    label: "Game auto-restart",
    description:
      "Seconds before an automatic shutdown (the server stops instead of restarting). Prefer the Scheduling page.",
  },
  Message: {
    label: "Message of the day",
    description: "Shown to players when they log in; \\n for a new line.",
  },
  Duration: {
    label: "Message duration",
    description: "Seconds the message is shown.",
  },
};
