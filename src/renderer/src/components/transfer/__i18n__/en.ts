export default {
  transfer: {
    export: "Export",
    import: "Import",
    exportedAt: "Exported on {{date}}",
    passwords: {
      label: "Include passwords",
      helper:
        "Valheim server password and Dragonwilds admin password. Unchecked, you'll have to enter them again on the new PC.",
      warning:
        "The file will contain the passwords in plain text: don't share it, and delete it after the import.",
      missing:
        "This file doesn't contain the passwords: enter them again on the Config page of the servers concerned.",
    },
    paths: {
      server: "Server folder",
      backupDir: "Backup folder",
      backupDirHelper: "Empty = Nexum's default folder",
      savedir: "Game data folder (-savedir)",
      savedirHelper: "Empty = the game's default folder",
      logFile: "Log file (-logFile)",
      notInstalledHelper:
        "The server will be imported anyway: install the game from the Installation page.",
      duplicate: "Already added",
      duplicateHelper:
        "A Nexum server already uses this folder: importing it would add a second one.",
    },
    saved: "File saved: {{name}}",
    showInFolder: "Show",
  },
};
