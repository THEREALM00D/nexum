export default {
  config: {
    title: "Configuration",
    subtitle: "PalWorldSettings.ini",
    search: "Search a setting...",
    searchClear: "Clear search",
    noResults: 'No setting matches "{{query}}".',
    openFolder: "Open config folder",
    expandAll: "Expand all",
    collapseAll: "Collapse all",
    save: "Save configuration",
    saved: "Saved!",
    unknownError: "Unknown error",
    loadFailed: "Unable to load the configuration",
    noServerPath: "Configure the server path in Installation.",
    groups: {
      server: "Server",
      rcon: "RCON",
      restapi: "REST API",
      security: "Security / Auth",
      time: "Time & Speed",
      xp: "XP & Gathering",
      palMechanics: "Pal mechanics",
      playerStats: "Player stats",
      statPoints: "Stat points",
      building: "Building",
      items: "Items & Equipment",
      death: "Death & Penalties",
      guild: "Guild",
      pvp: "PvP",
      gameplay: "Gameplay",
      randomizer: "Randomizer",
      supplyChat: "Supply drop & Chat",
      perfLogs: "Performance & Logs",
    },
    difficulty: {
      none: "Custom",
      casual: "Casual",
      normal: "Normal",
      hard: "Hard",
    },
    deathPenalty: {
      none: "None",
      item: "Items",
      itemAndEquipment: "Items + equipment",
      all: "All",
    },
    fields: {
      ServerName: {
        label: "Server name",
        description: "Name shown in the community server list.",
      },
      ServerDescription: {
        label: "Description",
        description:
          "Short description shown under the server name in the list.",
      },
      PublicIP: {
        label: "Public IP",
        description:
          "Public IP advertised to clients. Leave empty for auto-detection.",
      },
      PublicPort: {
        label: "Public port",
        description: "UDP port used by players (default 8211).",
      },
      ServerPlayerMaxNum: {
        label: "Max players",
        description:
          "Maximum concurrent players on the server (recommended cap: 32).",
      },
      CoopPlayerMaxNum: {
        label: "Max coop players",
        description:
          "Max players in a hosted coop session (default 4). No effect on a dedicated server.",
      },
      ServerPassword: {
        label: "Server password",
        description:
          "Password required to join. Leave empty for a public server.",
      },
      AdminPassword: {
        label: "Admin password",
        description:
          "Administrator password (moderation commands and REST API).",
      },
      Region: {
        label: "Region",
        description:
          "Regional code shown in the server list (e.g. EU, NA, AS).",
      },
      RCONEnabled: {
        label: "Enable RCON",
        description: "Enables the standard RCON protocol for remote admin.",
      },
      RCONPort: {
        label: "RCON port",
        description: "TCP port used by RCON (default 25575).",
      },
      RESTAPIEnabled: {
        label: "Enable REST API",
        description:
          "Enables the official REST API (required for graceful scheduled restarts and Nexum admin commands).",
      },
      RESTAPIPort: {
        label: "REST API port",
        description: "HTTP port of the REST API (default 8212, local only).",
      },
      bUseAuth: {
        label: "Authentication required",
        description:
          "Requires Steam authentication from players. Disabling raises cheating risks.",
      },
      BanListURL: {
        label: "Ban list URL",
        description: "URL of a shared ban list fetched at server startup.",
      },
      CrossplayPlatforms: {
        label: "Crossplay platforms",
        description:
          "Allowed platforms (Steam, Xbox, etc.). Array format: (Steam,Xbox,Unknown,PS5,Mac).",
      },
      bAllowClientMod: {
        label: "Allow client mods",
        description: "Allows clients using mods to connect.",
      },
      DayTimeSpeedRate: {
        label: "Daytime speed",
        description:
          "Daytime time-of-day multiplier (1.0 = normal, 0.5 = 2× slower).",
      },
      NightTimeSpeedRate: {
        label: "Nighttime speed",
        description: "Nighttime time-of-day multiplier (1.0 = normal).",
      },
      ExpRate: {
        label: "XP rate",
        description: "Multiplier for experience gained by players and Pals.",
      },
      CollectionDropRate: {
        label: "Gather rate",
        description:
          "Multiplier for quantity of items obtained from gathering (trees, rocks, etc.).",
      },
      CollectionObjectHpRate: {
        label: "Collectable HP",
        description:
          "HP multiplier for collectable objects (lower = faster gathering).",
      },
      CollectionObjectRespawnSpeedRate: {
        label: "Collectable respawn speed",
        description: "Respawn speed of resources. Lower = faster respawn.",
      },
      EnemyDropItemRate: {
        label: "Enemy drop",
        description: "Multiplier for items dropped by enemies on death.",
      },
      PalCaptureRate: {
        label: "Pal capture rate",
        description: "Multiplier for Pal Sphere capture success.",
      },
      PalSpawnNumRate: {
        label: "Pal spawn rate",
        description:
          "Multiplier for the number of Pals spawned in the world (density).",
      },
      PalDamageRateAttack: {
        label: "Pal damage (attack)",
        description: "Multiplier for damage dealt by Pals.",
      },
      PalDamageRateDefense: {
        label: "Pal damage (defense)",
        description:
          "Multiplier for damage taken by Pals (lower = tougher Pals).",
      },
      PalStomachDecreaceRate: {
        label: "Pal hunger",
        description:
          "Rate at which Pal hunger decreases. Lower = they eat less often.",
      },
      PalStaminaDecreaceRate: {
        label: "Pal stamina",
        description: "Rate at which Pal stamina decreases.",
      },
      PalAutoHPRegeneRate: {
        label: "Pal HP regen",
        description: "Natural HP regeneration rate of Pals.",
      },
      PalAutoHpRegeneRateInSleep: {
        label: "Pal HP regen (sleep)",
        description: "HP regeneration rate of Pals while sleeping.",
      },
      PalEggDefaultHatchingTime: {
        label: "Hatching time (h)",
        description: "Base time before a Pal egg hatches, in real-world hours.",
      },
      bPalLost: {
        label: "Lose Pal on death",
        description:
          "If enabled, active Pals may be permanently lost on death.",
      },
      PlayerDamageRateAttack: {
        label: "Player damage (attack)",
        description: "Multiplier for damage dealt by players.",
      },
      PlayerDamageRateDefense: {
        label: "Player damage (defense)",
        description:
          "Multiplier for damage taken by players (lower = tougher).",
      },
      PlayerStomachDecreaceRate: {
        label: "Player hunger",
        description: "Rate at which player hunger decreases.",
      },
      PlayerStaminaDecreaceRate: {
        label: "Player stamina",
        description: "Rate at which player stamina decreases.",
      },
      PlayerAutoHPRegeneRate: {
        label: "Player HP regen",
        description: "Automatic HP regeneration rate of the player.",
      },
      PlayerAutoHpRegeneRateInSleep: {
        label: "Player HP regen (sleep)",
        description: "HP regeneration rate of the player while sleeping.",
      },
      bAllowEnhanceStat_Attack: {
        label: "Enhance Attack",
        description: "Allows investing stat points into attack.",
      },
      bAllowEnhanceStat_Health: {
        label: "Enhance Health",
        description: "Allows investing stat points into HP.",
      },
      bAllowEnhanceStat_Stamina: {
        label: "Enhance Stamina",
        description: "Allows investing stat points into stamina.",
      },
      bAllowEnhanceStat_Weight: {
        label: "Enhance Weight",
        description: "Allows investing stat points into carry capacity.",
      },
      bAllowEnhanceStat_WorkSpeed: {
        label: "Enhance Work Speed",
        description: "Allows investing stat points into work speed.",
      },
      BuildObjectDamageRate: {
        label: "Building damage",
        description: "Multiplier for damage dealt to player-built structures.",
      },
      BuildObjectDeteriorationDamageRate: {
        label: "Building deterioration",
        description: "Natural decay rate of structures. 0 = no decay.",
      },
      BaseCampMaxNum: {
        label: "Max base camps",
        description: "Maximum total number of base camps on the server.",
      },
      BaseCampWorkerMaxNum: {
        label: "Max camp workers",
        description: "Max Pals assigned per camp (default 15).",
      },
      BaseCampMaxNumInGuild: {
        label: "Max camps per guild",
        description: "Max number of camps a single guild can own.",
      },
      MaxBuildingLimitNum: {
        label: "Max buildings (0 = unlimited)",
        description: "Per-area building count limit. 0 disables the limit.",
      },
      bBuildAreaLimit: {
        label: "Limit build area",
        description: "Restricts building to the base-camp area only.",
      },
      WorkSpeedRate: {
        label: "Work speed",
        description: "Work speed multiplier for players and Pals.",
      },
      DropItemMaxNum: {
        label: "Max ground items",
        description: "Maximum number of items dropped on the ground at once.",
      },
      DropItemAliveMaxHours: {
        label: "Ground item lifetime (h)",
        description:
          "Time before a dropped item despawns automatically, in hours.",
      },
      EquipmentDurabilityDamageRate: {
        label: "Equipment durability loss",
        description:
          "Rate at which equipment wears down with use. 0 = indestructible.",
      },
      ItemWeightRate: {
        label: "Item weight",
        description: "Multiplier for item weight. Lower = lighter inventory.",
      },
      ItemCorruptionMultiplier: {
        label: "Corruption multiplier",
        description: "Multiplier for the spoilage of perishable items.",
      },
      DeathPenalty: {
        label: "Death penalty",
        description:
          "What is lost on player death: nothing, bag items, +equipment, or everything (bag + equipment + materials).",
      },
      BlockRespawnTime: {
        label: "Respawn block time",
        description:
          "Minimum time before being able to respawn after death (seconds).",
      },
      RespawnPenaltyDurationThreshold: {
        label: "Respawn penalty threshold",
        description:
          "Active-session threshold above which the respawn penalty applies.",
      },
      RespawnPenaltyTimeScale: {
        label: "Respawn penalty scale",
        description: "Multiplier for the respawn time penalty after death.",
      },
      GuildPlayerMaxNum: {
        label: "Max guild members",
        description: "Maximum number of players per guild (default 20).",
      },
      GuildRejoinCooldownMinutes: {
        label: "Guild rejoin cooldown (min)",
        description:
          "Waiting time before being able to rejoin a guild after leaving.",
      },
      bAutoResetGuildNoOnlinePlayers: {
        label: "Reset inactive guilds",
        description:
          "Automatically resets guilds whose members never log in during the configured delay.",
      },
      AutoResetGuildTimeNoOnlinePlayers: {
        label: "Guild reset delay (h)",
        description: "Inactivity delay (hours) before automatic guild reset.",
      },
      bIsPvP: {
        label: "PvP enabled",
        description: "Enables general PvP mode on the server.",
      },
      bEnablePlayerToPlayerDamage: {
        label: "Player → player damage",
        description: "Allows damage between players (required for actual PvP).",
      },
      bEnableFriendlyFire: {
        label: "Friendly fire",
        description: "Allows damage between members of the same guild.",
      },
      bCanPickupOtherGuildDeathPenaltyDrop: {
        label: "Pick up other-guild death drop",
        description:
          "Allows picking up items dropped on death by players from other guilds.",
      },
      bAdditionalDropItemWhenPlayerKillingInPvPMode: {
        label: "Extra drop on PvP kill",
        description: "Adds extra items to the drop on a PvP kill.",
      },
      AdditionalDropItemNumWhenPlayerKillingInPvPMode: {
        label: "PvP drop count",
        description: "Number of extra items dropped on a PvP kill.",
      },
      AdditionalDropItemWhenPlayerKillingInPvPMode: {
        label: "PvP drop item (ID)",
        description:
          "ID of the extra item dropped on each PvP kill (leave empty for random).",
      },
      bEnableDefenseOtherGuildPlayer: {
        label: "Defense against other-guild players",
        description:
          "Lets defensive structures (turrets) target players from other guilds.",
      },
      bDisplayPvPItemNumOnWorldMap_Player: {
        label: "Show PvP items on map (player)",
        description:
          "Shows on the map the location of players' PvP death bags.",
      },
      bDisplayPvPItemNumOnWorldMap_BaseCamp: {
        label: "Show PvP items on map (camp)",
        description: "Shows on the map loot available in enemy camps.",
      },
      Difficulty: {
        label: "Difficulty",
        description:
          'Global difficulty preset. Choose "Custom" to keep individual values.',
      },
      bIsMultiplay: {
        label: "Multiplayer",
        description: "Flags the session as multiplayer.",
      },
      bHardcore: {
        label: "Hardcore mode",
        description: "Enables Hardcore mode (stronger death consequences).",
      },
      bCharacterRecreateInHardcore: {
        label: "Recreate character in Hardcore",
        description: "Forces creating a new character after a Hardcore death.",
      },
      bEnableFastTravel: {
        label: "Fast travel",
        description: "Allows fast travel via Pyramids and points of interest.",
      },
      bEnableFastTravelOnlyBaseCamp: {
        label: "Fast travel — base camps only",
        description: "Restricts fast travel to the player's own base camps.",
      },
      bIsStartLocationSelectByMap: {
        label: "Start location on map",
        description: "Lets the player choose their starting point on the map.",
      },
      bExistPlayerAfterLogout: {
        label: "Body stays after logout",
        description:
          "The character physically stays in the world after logout (vulnerable).",
      },
      bEnableInvaderEnemy: {
        label: "Invader enemies",
        description: "Enables enemy raids that attack base camps.",
      },
      bEnableNonLoginPenalty: {
        label: "Non-login penalty",
        description: "Applies penalties to players who don't log in regularly.",
      },
      bEnableAimAssistPad: {
        label: "Controller aim assist",
        description: "Enables aim assist for controller players.",
      },
      bEnableAimAssistKeyboard: {
        label: "Keyboard aim assist",
        description: "Enables aim assist for keyboard/mouse players.",
      },
      bIsShowJoinLeftMessage: {
        label: "Join/leave message",
        description: "Shows an in-game message when a player joins or leaves.",
      },
      bShowPlayerList: {
        label: "Show player list",
        description: "Makes the connected player list visible in-game.",
      },
      bIsUseBackupSaveData: {
        label: "Backup save",
        description: "Enables automatic fallback saves on the game side.",
      },
      bAllowGlobalPalboxExport: {
        label: "Global Palbox export",
        description:
          "Allows exporting Pals out of the server (to another world).",
      },
      bAllowGlobalPalboxImport: {
        label: "Global Palbox import",
        description: "Allows importing Pals from another world.",
      },
      bInvisibleOtherGuildBaseCampAreaFX: {
        label: "Hide other-guild camp area",
        description: "Visually hides the build area of other guilds' camps.",
      },
      bActiveUNKO: {
        label: "Enable UNKO",
        description:
          "Enables UNKO mechanic (Pal dung, needed for some recipes).",
      },
      DenyTechnologyList: {
        label: "Denied technologies",
        description: "Comma-separated list of denied technology IDs.",
      },
      RandomizerType: {
        label: "Randomizer type",
        description:
          "Type of Pal randomization in the world (None, Region, All, etc.).",
      },
      RandomizerSeed: {
        label: "Seed",
        description: "Randomizer seed (same seed = same results). 0 = random.",
      },
      bIsRandomizerPalLevelRandom: {
        label: "Random Pal level",
        description: "Also randomizes Pal levels in addition to their species.",
      },
      SupplyDropSpan: {
        label: "Supply drop interval (min)",
        description: "Minutes between each airborne supply drop.",
      },
      ChatPostLimitPerMinute: {
        label: "Max chat/min",
        description:
          "Max chat messages a player can send per minute (anti-spam).",
      },
      ServerReplicatePawnCullDistance: {
        label: "Server culling distance",
        description:
          "Distance beyond which the server stops replicating Pals to clients. Lower = less network load.",
      },
      LogFormatType: {
        label: "Log format",
        description: "Server log format (text or json).",
      },
    },
  },
};
