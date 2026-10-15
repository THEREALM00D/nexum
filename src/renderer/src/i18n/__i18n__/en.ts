export default {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirm: "Confirm",
    browse: "Browse",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    language: "Language",
    errorPrefix: "Error: {{msg}}",
    change: "Change",
    or: "OR",
    clearSearch: "Clear search",
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
      dirTooltip: "Choose a folder",
      dirOpen: "Open in explorer",
      keep: "Backups to keep (rotation)",
      keepHelper: "0 = no rotation",
      auto: "Automatic backup",
      autoOff: "Disabled",
      auto15: "Every 15 minutes",
      auto30: "Every 30 minutes",
      auto60: "Every hour",
      auto180: "Every 3 hours",
      auto360: "Every 6 hours",
      auto720: "Every 12 hours",
      auto1440: "Once a day",
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
    messageHelper: "{minutes} will be replaced by the delay",
    save: "Save",
    notify: {
      saved: "Schedule saved",
      saveFailed: "Unable to save the schedule",
    },
  },
};
