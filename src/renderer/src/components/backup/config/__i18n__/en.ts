export default {
  configBackup: {
    settings: {
      title: "Settings",
      interval: "Automatic backup",
      intervalHelper: "{{files}}. A copy is made only when a file changed.",
      intervalHelperNoFiles: "A copy is made only when a file changed.",
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
      fileTooLarge: "{{file}} · too large",
      hidden_one: "{{count}} identical file isn't shown.",
      hidden_other: "{{count}} identical files aren't shown.",
      identical: "No file changed since this backup.",
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
};
