import { APP_ERRORS_EN } from "@shared/appErrors/en";

export default {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirm: "Confirm",
    browse: "Browse",
    error: "Error",
    success: "Success",
    language: "Language",
    errorPrefix: "Error: {{msg}}",
    units: { b: "B", kb: "KB", mb: "MB", gb: "GB" },
    change: "Change",
    or: "OR",
    clearSearch: "Clear search",
    minimize: "Minimize",
    maximize: "Maximize",
    restore: "Restore",
    close: "Close",
  },
  serverControls: {
    startFailed: "Couldn't start the server",
    stopFailed: "Couldn't stop the server",
    restartFailed: "Couldn't restart the server",
  },
  appErrors: APP_ERRORS_EN,
  gameRequirements: {
    hint: "{{game}} needs a solid PC: about {{ram}} GB of RAM for the server alone and {{disk}} GB of free disk space.",
  },
  installDir: {
    warning:
      "This folder is inside Nexum's install folder ({{dir}}). Up to version 0.12.3, Nexum emptied that folder on every update: choose a folder outside it to keep your files safe.",
  },
  gameUpdate: {
    available:
      "{{name}}: a server update is available (build {{build}}). Players who updated their game won't be able to join.",
    availableSteamLibrary:
      "{{name}}: a server update is available (build {{build}}). Installed through the Steam library: update it from Steam.",
    update: "Update",
  },
  autoRestart: {
    gaveUp:
      "{{name}}: auto-restart stopped after {{crashes}} restarts (crash or stuck start) in less than {{minutes}} min. Check the logs of the previous sessions, then start the server manually.",
    failed: "{{name}} could not be restarted after its crash: {{error}}",
    failedStuck:
      "{{name}} could not be restarted after a stuck start: {{error}}",
    viewLogs: "View logs",
  },
  autoStart: {
    failed: "{{name}} could not start automatically: {{error}}",
  },
  modUpdate: {
    available_one:
      "{{name}}: 1 mod has an update. Update it while the server is stopped.",
    available_other:
      "{{name}}: {{count}} mods have an update. Update them while the server is stopped.",
    deprecated_one: "{{name}}: 1 mod was deprecated by its author.",
    deprecated_other:
      "{{name}}: {{count}} mods were deprecated by their authors.",
    open: "See mods",
  },
  status: {
    running: "Online",
    starting: "Starting...",
    stopping: "Stopping...",
    crashed: "Crashed",
    stopped: "Stopped",
  },
  backup: {
    title: "Backups",
    tabs: { world: "World", config: "Configuration" },
    configFiles: {
      settings: {
        title: "Settings",
        interval: "Automatic backup",
        intervalHelper: "{{files}}. A copy is made only when a file changed.",
        keep: "Backups to keep",
        keepHelper: "From {{min}} to {{max}}.",
        beforeSave: "Back up before each save",
        beforeSaveHelper:
          "When Nexum writes a config file (Configuration page, launch line import…).",
        beforeStart: "Back up before each start",
        beforeStartHelper:
          "The game, an update or a mod often rewrites the config at startup.",
      },
      list: {
        title: "Configuration backups ({{count}})",
        empty:
          "No backup yet. Click Create a backup, or wait for the next automatic copy.",
        detail: "{{files}} · {{size}}",
        diff: "View differences with the current files",
        restore: "Restore (server must be stopped)",
        restoreConfirm:
          "Restore this configuration backup?\nThe current configuration is backed up first.",
        deleteConfirm: "Delete this configuration backup?",
      },
      reasons: {
        beforeSave: "Before save",
        beforeStart: "Before start",
        beforeRestore: "Before restore",
      },
      diff: {
        title: "Differences with the current configuration",
        subtitle: "Backup from {{date}}, compared with today's files.",
        file: "File",
        fileChanges_zero: "{{file}} · none",
        fileChanges_one: "{{file}} · {{count}} change",
        fileChanges_other: "{{file}} · {{count}} changes",
        identical: "This file hasn't changed.",
        tooLarge: "File too large or binary: no line by line comparison.",
        legend:
          "In red: what the backup holds. In green: what's there today. Passwords are hidden.",
        close: "Close",
        restore: "Restore this backup",
      },
      notify: {
        cannotLoad: "Couldn't read the configuration backups",
        created: "Configuration backed up",
        unchanged: "Nothing changed since the last backup",
        restored: "Configuration restored",
      },
    },
    config: {
      title: "Configuration",
      dir: "Backup folder",
      dirOpen: "Open in explorer",
      keep: "Backups to keep (rotation)",
      keepHelper: "0 = no rotation. Pre-update backups are counted separately.",
      auto: "Automatic backup",
      autoOff: "Disabled",
      auto15: "Every 15 minutes",
      auto30: "Every 30 minutes",
      auto60: "Every hour",
      auto180: "Every 3 hours",
      auto360: "Every 6 hours",
      auto720: "Every 12 hours",
      auto1440: "Once a day",
      beforeUpdate: "Back up the world before every update",
      beforeUpdateHelper:
        "Before updating the game (Installation page, scheduled restart) or the mods. If the backup fails, the update does not run.",
    },
    list: {
      title: "Backups ({{count}})",
      create: "Create a backup",
      creating: "Backing up...",
      none: "No backup",
      restoreTooltip: "Restore (server must be stopped)",
      deleteTooltip: "Delete",
      restoreConfirm:
        "Restore {{name}}?\nThe current save will be overwritten.",
      deleteConfirm: "Delete {{name}}?",
      beforeUpdate: "Before update",
    },
    notify: {
      cannotLoad: "Unable to load backups",
      created: "Backup created: {{name}}",
      createFailed: "Backup failed",
      restored: "Backup restored: {{name}}",
      restoreFailed: "Restore failed",
      deleted: "Backup deleted",
      deleteFailed: "Unable to delete the backup",
      configFailed: "Unable to save the backup configuration",
      beforeUpdate: "World backed up before the update: {{name}}",
    },
  },
  schedule: {
    title: "Schedule",
    subtitle: "Server restarts, player warnings and updates",
    sections: {
      restarts: "Restarts",
      warnings: "Warn players",
      updates: "Game updates",
    },
    enabled: "Enable scheduled restart",
    mode: {
      label: "Schedule type",
      times: "Fixed times",
      interval: "Every X hours",
    },
    times: "Shutdown times (24h)",
    addTime: "Add a time",
    newTime: "Time (24h)",
    add: "Add",
    remove: "Remove {{value}}",
    noTimes: "Add at least one time.",
    alreadyListed: "Already in the list.",
    days: {
      label: "Days",
      none: "Pick at least one day.",
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
    },
    intervalHours: "Every (hours)",
    intervalStart: "Starting at (24h)",
    next: {
      label: "Next restart: {{when}}",
      intervalLabel: "Next restart: {{when}} ({{times}})",
      none: "No restart planned",
      today: "today at {{time}}",
      tomorrow: "tomorrow at {{time}}",
      other: "{{day}} at {{time}}",
    },
    warnings: {
      label: "Announcements before the stop (minutes)",
      helper:
        "One announcement per delay. The world is saved just before the stop.",
      none: "No announcement: the server stops without warning.",
      newDelay: "Minutes before the stop",
      range: "Between 1 and {{max}} minutes.",
    },
    message: "Announcement message",
    messageHelper:
      "{minutes} will be replaced by the delay. Empty: default message, in Nexum's language.",
    messageDefault: "The server will restart in {minutes} minutes",
    updateGame: "Update the game at restart time",
    updateGameHelper:
      "If a server update is available: shutdown, world backup, update with SteamCMD, then start. No effect for a server installed through the Steam library.",
    checkUpdates: "Check for updates while the server runs",
    checkUpdatesHelper:
      "When an update is found: players are warned, then shutdown, backup, update and start, without waiting for the next restart. No effect for a server installed through the Steam library.",
    checkEvery: "Check every",
    hours: "{{count}} h",
    updateWarning: "Warn players (minutes before)",
    save: "Save",
    notify: {
      saved: "Schedule saved",
      saveFailed: "Unable to save the schedule",
    },
  },
};
