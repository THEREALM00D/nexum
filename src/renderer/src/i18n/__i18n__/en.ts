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
      "{{name}}: auto-restart stopped after {{crashes}} crashes in less than {{minutes}} min. Check the logs of the crashed sessions, then start the server manually.",
    viewLogs: "View logs",
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
    subtitle: "Automatic daily server restart",
    enabled: "Enable scheduled restart",
    time: "Time (24h)",
    warning: "Warning (minutes before)",
    warningHelper:
      "Delay between the announcement and the shutdown (0 = immediate)",
    message: "Announcement message",
    messageHelper:
      "{minutes} will be replaced by the delay. Empty: default message, in Nexum's language.",
    messageDefault: "The server will restart in {minutes} minutes",
    updateGame: "Update the game at restart time",
    updateGameHelper:
      "If a server update is available: shutdown, world backup, update with SteamCMD, then start. No effect for a server installed through the Steam library.",
    save: "Save",
    notify: {
      saved: "Schedule saved",
      saveFailed: "Unable to save the schedule",
    },
  },
};
