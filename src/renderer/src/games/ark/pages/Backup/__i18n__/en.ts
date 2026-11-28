export default {
  arkBackup: {
    subtitle:
      "Manage the ARK world backups (chosen map, without the .arkrbf and .bak copies the game keeps next to it)",
    openWorldFolder: "Open the world folder",
    autoNote:
      "Running server with RCON on: Nexum asks the server to save (SaveWorld) right before. Without RCON, the backup holds the game's last automatic save (every 15 min by default).",
    profiles: {
      tab: "Player profiles",
      settings: {
        title: "Settings",
        interval: "Profile backup",
        intervalHelper:
          ".arkprofile and .arktribe files, separate from the world. Also when a player disconnects (RCON on). A profile that hasn't changed isn't copied again.",
        keep: "Backups to keep per player",
        keepHelper: "From {{min}} to {{max}}.",
        announce: "Announce each backup in game",
        announceHelper: "A short chat message (RCON).",
      },
      title: "Saved profiles ({{count}})",
      search: "Filter by player or ID",
      backupNow: "Back up now",
      summary_one: "{{count}} backup · {{when}}",
      summary_other: "{{count}} backups · {{when}}",
      emptyEnabled:
        "No saved profile yet. The first backup happens at the chosen interval, or when a player disconnects.",
      emptyDisabled:
        "No saved profile. Pick a backup interval, or click Back up now.",
      noMatch: "No player matches.",
      restoreTooltip: "Restore this profile (server must be stopped)",
      stopToRestore: "Stop the server to restore a profile.",
      restore: {
        title: "Restore {{name}}'s profile?",
        body: "Version from {{date}}. Level, experience and engrams go back to this version. The character in the world, its inventory, its tribe and the other players don't change.",
        backupFirst:
          "The current profile is backed up first, so you can go back.",
        cancel: "Cancel",
        confirm: "Restore",
      },
      notify: {
        cannotLoad: "Couldn't read the saved profiles",
        saved_one: "{{count}} profile backed up",
        saved_other: "{{count}} profiles backed up",
        unchanged: "No profile has changed since the last backup",
        restored: "{{name}}'s profile restored",
      },
    },
  },
};
