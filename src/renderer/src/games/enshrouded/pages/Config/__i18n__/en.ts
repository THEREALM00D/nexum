export default {
  enshroudedConfig: {
    title: "Server Configuration",
    subtitle: "enshrouded_server.json",
    openServerFolder: "Open server folder",
    save: "Save",
    saved: "Saved!",
    noServerPath: "Configure the server path in the Installation tab.",
    lockedWhileRunning:
      "The server rewrites enshrouded_server.json every time it starts: stop it to change its configuration. The file is read again when it stops.",
    sections: {
      general: "General",
      network: "Network",
      difficulty: "Difficulty",
      gameSettings: "Gameplay settings",
      advanced: "Advanced",
      userGroups: "Groups and passwords",
    },
    fields: {
      name: {
        label: "Server name",
        description:
          "Shown in the game's server list: this is the name your friends search for.",
      },
      slotCount: {
        label: "Max players",
        description:
          "1 to 16. Each player adds about 100 MB of RAM to the server.",
      },
      enableTextChat: {
        label: "Text chat",
        description: "Turns text chat on for the server.",
      },
      enableVoiceChat: {
        label: "Voice chat",
        description: "Turns voice chat on for the server.",
      },
      voiceChatMode: { label: "Voice chat mode" },
      queryPort: {
        label: "Port (UDP)",
        description:
          "15637 by default. It's the only port to open and forward on your router. A 2nd server on this PC must use another one.",
      },
      ip: {
        label: "Listen address",
        description:
          "Leave 0.0.0.0 (all network adapters) unless you need otherwise.",
      },
      saveDirectory: {
        label: "Save folder",
        description:
          "./savegame by default, relative to the server folder. Nexum's backups follow this folder.",
      },
      logDirectory: {
        label: "Game log folder",
        description: "./logs by default, relative to the server folder.",
      },
      customArgs: {
        label: "Extra arguments",
        description:
          "Added to the server command line. Enshrouded documents none: all the configuration is in the file.",
      },
    },
    difficulty: {
      description:
        "Presets set the whole difficulty at once. Custom is the only one that uses the gameplay settings below.",
      presetHint:
        "The gameplay settings aren't used with this preset. Changing one switches to Custom.",
      customHint: "The server uses the gameplay settings below.",
      presets: {
        Default: "Default",
        Relaxed: "Relaxed",
        Hard: "Hard",
        Survival: "Survival",
        Custom: "Custom",
      },
    },
    gameSettings: {
      description:
        "Factors multiply the game's normal value (1 = normal, 2 = double). A value out of range is clamped by the server.",
    },
    themes: {
      player: "Players",
      survival: "Survival",
      world: "World and resources",
      progression: "Progression",
      enemies: "Enemies",
      bosses: "Bosses",
      time: "Day and night",
    },
    options: {
      Proximity: "Proximity",
      Global: "Whole server",
      Few: "Few",
      Normal: "Normal",
      Automatic: "Automatic",
      Many: "Many",
      Extreme: "Extreme",
      Disabled: "None",
      Rare: "Rare",
      Often: "Often",
      VeryEasy: "Very easy",
      Easy: "Easy",
      Hard: "Hard",
      VeryHard: "Very hard",
      KeepProgress: "Keep progress",
      LoseSomeProgress: "Lose some progress",
      LoseAllProgress: "Lose all progress",
      AddBackpackMaterials: "Lose materials",
      Everything: "Lose the whole backpack",
      NoTombstone: "Lose nothing",
    },
    settings: {
      playerHealthFactor: { label: "Player health", description: "0.25 to 4." },
      playerManaFactor: { label: "Player mana", description: "0.25 to 4." },
      playerStaminaFactor: {
        label: "Player stamina",
        description: "0.25 to 4.",
      },
      playerBodyHeatFactor: {
        label: "Body heat",
        description: "Time before hypothermia in cold areas. 0.5 to 2.",
      },
      playerDivingTimeFactor: {
        label: "Diving time",
        description: "Starting oxygen. 0.5 to 2.",
      },
      enableDurability: {
        label: "Weapon durability",
        description: "Off: weapons no longer break.",
      },
      enableStarvingDebuff: {
        label: "Hunger and starvation",
        description:
          "While starving, players lose health until they eat or drink.",
      },
      foodBuffDurationFactor: {
        label: "Food buff duration",
        description: "0.5 to 2.",
      },
      fromHungerToStarving: {
        label: "Time before starving (minutes)",
        description: "5 to 20 minutes.",
      },
      shroudTimeFactor: {
        label: "Time in the Shroud",
        description: "How long players can stay in the Shroud. 0.5 to 2.",
      },
      tombstoneMode: {
        label: "On death",
        description:
          "What players lose when they die, recoverable from their tombstone.",
      },
      curseModifier: {
        label: "Shroud curse",
        description: "Easy: turned off. Hard: twice the normal chance.",
      },
      enableGliderTurbulences: {
        label: "Glider turbulence",
        description: "Off: the glider is no longer shaken.",
      },
      weatherFrequency: { label: "Weather frequency" },
      fishingDifficulty: { label: "Fishing difficulty" },
      miningDamageFactor: {
        label: "Mining effectiveness",
        description: "More terrain dug and resources per hit. 0.5 to 2.",
      },
      plantGrowthSpeedFactor: {
        label: "Plant growth speed",
        description: "0.25 to 2.",
      },
      resourceDropStackAmountFactor: {
        label: "Resource gain",
        description: "Resources per loot stack (chests, enemies…). 0.25 to 2.",
      },
      factoryProductionSpeedFactor: {
        label: "Workstation speed",
        description: "0.25 to 2.",
      },
      flameLevelFogRemoval: {
        label: "Flame level for an altar in the Shroud",
        description:
          "Flame level required to place a Flame Altar in the Shroud. 0 to 20 (11 by default).",
      },
      experienceCombatFactor: {
        label: "Combat experience",
        description: "0.25 to 2.",
      },
      experienceMiningFactor: {
        label: "Mining experience",
        description: "0 to 2.",
      },
      experienceExplorationQuestsFactor: {
        label: "Exploration and quest experience",
        description: "0.25 to 2.",
      },
      perkCostFactor: {
        label: "Weapon upgrade cost",
        description: "Runes required. 0.25 to 2.",
      },
      perkUpgradeRecyclingFactor: {
        label: "Runes back when recycling",
        description:
          "Share of runes returned when salvaging an upgraded weapon. 0 to 1.",
      },
      randomSpawnerAmount: { label: "Enemy amount" },
      aggroPoolAmount: { label: "Enemies attacking at the same time" },
      enemyDamageFactor: {
        label: "Enemy damage",
        description: "Bosses excluded. 0.25 to 5.",
      },
      enemyHealthFactor: {
        label: "Enemy health",
        description: "Bosses excluded. 0.25 to 4.",
      },
      enemyStaminaFactor: {
        label: "Enemy stamina",
        description: "The higher, the longer they take to stun. 0.5 to 2.",
      },
      enemyPerceptionRangeFactor: {
        label: "Enemy perception",
        description: "How far they see and hear. 0.5 to 2.",
      },
      threatBonus: {
        label: "Enemy attack frequency",
        description: "Bosses excluded. 0.25 to 4.",
      },
      pacifyAllEnemies: {
        label: "Pacified enemies",
        description: "Enemies only attack when attacked (bosses excluded).",
      },
      tamingStartleRepercussion: { label: "Startled animal while taming" },
      bossDamageFactor: { label: "Boss damage", description: "0.2 to 5." },
      bossHealthFactor: { label: "Boss health", description: "0.2 to 5." },
      dayTimeDuration: {
        label: "Daytime length (minutes)",
        description: "2 to 60 minutes (30 by default).",
      },
      nightTimeDuration: {
        label: "Nighttime length (minutes)",
        description: "2 to 60 minutes (12 by default).",
      },
    },
    userGroups: {
      description:
        "The password a player types when joining gives them their group's permissions. The server creates 4 groups with random passwords; give each person the password of the group you want.",
      empty:
        "No groups: the server will create some on its next start if it finds none.",
      name: "Group name",
      password: "Password",
      noPassword: "Without a password, anyone can join with these permissions.",
      showPassword: "Show / hide",
      generate: "Generate a password",
      reservedSlots: "Reserved slots",
      remove: "Remove the group",
      add: "Add a group",
      save: "Save groups",
      saved: "Groups saved!",
      permissions: {
        canKickBan: {
          label: "Kick and ban",
          description: "Can kick or permanently ban other players.",
        },
        canAccessInventories: {
          label: "Base chests",
          description:
            "Access to chests, workstations and other storage in bases (not world chests).",
        },
        canEditWorld: {
          label: "Edit the world",
          description:
            "Dig and destroy outside bases. Unchecked: protects the world from visitors.",
        },
        canEditBase: {
          label: "Build in bases",
          description: "Build, demolish, dig and place water in bases.",
        },
        canExtendBase: {
          label: "Flame Altars",
          description: "Place, upgrade and remove Flame Altars.",
        },
      },
    },
  },
};
