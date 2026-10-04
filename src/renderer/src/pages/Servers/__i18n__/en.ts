export default {
  servers: {
    title: "Servers",
    subtitle: "All your dedicated servers. Click a server to set it as active.",
    empty: "No server configured. Add your first server to get started.",
    active: "Active",
    addServer: "Add server",
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
    },
    actions: {
      activate: "Activate",
      edit: "Edit",
      delete: "Delete",
      deleteConfirm:
        'Delete server "{{name}}"? Game files stay intact, only Nexum configuration is removed.',
      deleteTypeToConfirm: 'Type "{{name}}" to confirm',
    },
    launchAtLogin: {
      label: "Launch Nexum when Windows starts",
      helper:
        'Nexum opens minimized in the taskbar, then starts the servers marked "Start automatically".',
      on: "Nexum will launch when Windows starts",
      off: "Nexum will no longer launch when Windows starts",
    },
    dialog: {
      autoStart: "Start automatically when Nexum opens",
      autoStartHelper:
        'Pairs well with "Launch Nexum when Windows starts": the server comes back on its own after a PC restart.',
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
      exeChecking: "Checking…",
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
