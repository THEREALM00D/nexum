export default {
  valheimConfig: {
    title: "Server Configuration",
    subtitle: "valheim_server.exe launch arguments",
    openServerFolder: "Open server folder",
    save: "Save",
    saved: "Saved!",
    noServerPath: "Configure the server path in the Installation tab.",
    sections: {
      general: "General",
      world: "World",
      modifiers: "World Modifiers",
      network: "Network",
      advanced: "Advanced",
      administration: "Administration",
    },
    modifiers: {
      description:
        "Adjust world difficulty. A preset overwrites all modifiers already applied to this world; the individual settings below then apply on top for fine-tuning.",
      default: "Don't override",
      presetHint:
        "An existing world keeps its previous modifiers until you pick a preset — leaving an individual field empty does not reset it.",
      presetNames: {
        Normal: "Normal",
        Casual: "Casual",
        Easy: "Easy",
        Hard: "Hard",
        Hardcore: "Hardcore",
        Immersive: "Immersive",
        Hammer: "Hammer",
      },
      combat: {
        label: "Combat",
        veryeasy: "Very easy",
        easy: "Easy",
        hard: "Hard",
        veryhard: "Very hard",
      },
      deathpenalty: {
        label: "Death penalty (skill loss)",
        description:
          "Only controls skill level loss on death — non-equipped items are always dropped (base game mechanic, no modifier prevents it). Only equipped armor, accessories, and the weapon in hand at death are kept.",
        casual: "No skill loss",
        veryeasy: "Very light",
        easy: "Light",
        hard: "Harsh",
        hardcore: "Full loss (items + skills)",
      },
      resources: {
        label: "Resources",
        muchless: "Much less",
        less: "Less",
        more: "More",
        muchmore: "Much more",
        most: "Most",
      },
      raids: {
        label: "Raids",
        none: "None",
        muchless: "Very rare",
        less: "Rare",
        more: "Frequent",
        muchmore: "Very frequent",
      },
      portals: {
        label: "Portals",
        casual: "Open",
        hard: "Restricted",
        veryhard: "Very restricted",
      },
    },
    fields: {
      name: {
        label: "Server name",
        description: "Name displayed in the Steam server list.",
      },
      world: {
        label: "World name",
        description: "World file name (without extension).",
        detected: "{{count}} world(s) detected on disk — click to pick one.",
      },
      password: {
        label: "Password",
        description:
          "Leave empty for a public server (min. 5 characters if set).",
        tooShort:
          "Too short: Valheim requires at least 5 characters, otherwise the server refuses to start.",
      },
      port: {
        label: "Port",
        description: "UDP game port. The query port is automatically port+1.",
      },
      public: {
        label: "Public server (Steam)",
        description: "Makes the server visible in the Steam community list.",
      },
      savedir: {
        label: "Saves folder",
        description:
          "Custom path for worlds. Empty = %LOCALAPPDATA%\\..\\LocalLow\\IronGate\\Valheim.",
      },
      worldSeed: {
        label: "World seed",
        description: "World generation seed. Empty = random.",
      },
      worldSize: {
        label: "World size",
        default: "Default",
        small: "Small",
        medium: "Medium",
        large: "Large",
        yolo: "Yolo (very large)",
      },
      crossplay: {
        label: "Crossplay (Xbox)",
        description: "Enables crossplay between PC and Xbox via Xbox network.",
      },
      logFile: {
        label: "Log file",
        description:
          "Leave empty (recommended). If set, Valheim writes its output to this file instead of sending it to Nexum: the Logs page, the Dashboard console and the saved sessions stay empty.",
      },
      customArgs: {
        label: "Extra arguments",
        description: "Additional arguments appended to the command line.",
      },
      odinEyeUrl: {
        label: "Odin-Eye URL (player tracking)",
        description:
          "Requires the Odin-Eye BepInEx plugin installed on the server (see sparcopt.github.io/odin-eye). Enter the address configured in HttpServerAddress, e.g. http://127.0.0.1:21618. Empty = player tracking disabled. Never expose this port publicly (no authentication on the plugin side).",
      },
    },
    administration: {
      description:
        "Access control files (one SteamID64 per line). Located in the saves folder.",
      adminList: "Admins (adminlist.txt)",
      adminListHelper:
        "Access to in-game admin commands (/kick, /ban, /debugmode…)",
      bannedList: "Banned players (bannedlist.txt)",
      bannedListHelper: "Players blocked from connecting.",
      permittedList: "Whitelist (permittedlist.txt)",
      permittedListHelper: "If not empty, only these players can connect.",
      save: "Save",
      saved: "Saved!",
      saveFailed: "Unable to save the list",
      loadFailed: "Unable to load the list",
    },
  },
};
