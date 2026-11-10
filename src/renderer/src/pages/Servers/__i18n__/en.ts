export default {
  servers: {
    title: "Servers",
    subtitle: "All your dedicated servers. Click a server to set it as active.",
    emptyTitle: "No server yet",
    emptyHint:
      "The wizard installs the game, sets up the configuration and opens the ports in a few steps.",
    launchWizard: "Launch the setup wizard",
    importFolder: "Import an existing folder",
    active: "Active",
    addServer: "Add server",
    setupWizard: "Setup wizard",
    columns: {
      name: "Name",
      game: "Game",
      path: "Path",
      status: "Status",
      actions: "",
    },
    status: {
      running: "Running",
      starting: "Starting...",
      stopping: "Stopping...",
      crashed: "Crashed",
      stopped: "Stopped",
    },
    serverActions: {
      start: "Start",
      stop: "Stop",
      restart: "Restart",
    },
    games: {
      palworld: "Palworld",
      valheim: "Valheim",
      astroneer: "Astroneer",
      dragonwilds: "RuneScape: Dragonwilds",
      enshrouded: "Enshrouded",
    },
    actions: {
      activate: "Activate",
      more: "More actions",
      openFolder: "Open folder",
      edit: "Edit",
      delete: "Delete",
      deleteConfirm:
        'Delete server "{{name}}"? Game files stay intact, only Nexum configuration is removed.',
      deleteTypeToConfirm: 'Type "{{name}}" to confirm',
    },
    transfer: {
      exportMenu: "Export to another PC",
      exportStopFirst: "Stop the server to export it",
      importButton: "Import a server",
      exportTitle: "Export “{{name}}”",
      exportDescription:
        "A ZIP file with the server's Nexum settings, its world, the game's configuration files and its mod list (reinstalled on the other PC). The game isn't included: install it on the other PC from the Installation page.",
      gameFilesWarning:
        "The game's configuration files are copied as they are, with any passwords they contain (Palworld admin password, Enshrouded group passwords…).",
      importTitle: "Import a server",
      name: "Name",
      contents: "File contents ({{game}})",
      world: "Server world",
      noWorld: "No world",
      configFiles: "{{count}} game configuration file",
      configFiles_other: "{{count}} game configuration files",
      mods: "{{count}} mod to reinstall",
      mods_other: "{{count}} mods to reinstall",
      replaceWorld: "Replace the world already there",
      replaceWorldHelper:
        "Files with the same name already exist in the worlds folder. Unchecked, the imported world isn't copied.",
      done: "Server “{{name}}” imported.",
      worldSkipped:
        "The world wasn't copied: one with the same name already exists.",
      modsPending:
        "Install the game, then reinstall the mods from the Mods page.",
    },
    dialog: {
      autoStart: "Start automatically when Nexum opens",
      autoStartHelper:
        'With "Launch Nexum when Windows starts" (Settings page), the server comes back on its own after a PC restart.',
      autoRestart: "Restart automatically after a crash",
      autoRestartHelper:
        "10 seconds after the crash. At most 3 times in 30 minutes, so a server that crashes on startup doesn't loop.",
      addTitle: "New server",
      editTitle: "Edit server",
      name: "Name",
      nameHelper: "E.g.: FREEPORT, PvE Casual, Test",
      path: "Server folder",
      pathHelper:
        "Folder containing the server executable — new install or an existing one, e.g. E:\\Server\\Palworld_Freeport",
      pathBrowse: "Browse",
      gameType: "Game",
      color: "Color",
      save: "Save",
      cancel: "Cancel",
      exeFound: "{{game}} server detected in this folder",
      exeMissing:
        "No known server executable found in this folder — check the path or the game selection",
    },
    notify: {
      created: 'Server "{{name}}" added.',
      updated: 'Server "{{name}}" updated.',
      deleted: "Server deleted.",
      activated: '"{{name}}" is now the active server.',
      pathRequired: "Server path is required.",
      nameRequired: "Server name is required.",
      startFailed: "Start failed: {{error}}",
      stopFailed: "Stop failed: {{error}}",
      restartFailed: "Restart failed: {{error}}",
    },
  },
};
