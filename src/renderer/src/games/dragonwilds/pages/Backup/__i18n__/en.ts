export default {
  dragonwildsBackup: {
    subtitle:
      "Manage Dragonwilds world backups (RSDragonwilds/Saved/SaveGames)",
    openWorldFolder: "Open the worlds folder",
  },
  dragonwildsWorlds: {
    title: "Worlds",
    currentHint:
      'At startup, the server loads the world "{{name}}" and creates it if it doesn\'t exist.',
    noCurrent:
      "No world name configured: the server will create one with a random name.",
    loadedChip: "Loaded at startup",
    load: "Load at startup",
    used: 'The server will load "{{name}}" at the next start.',
    stopFirst: "Stop the server to switch worlds or import one.",
    noServerWorlds: "No world on the server yet.",
    importTitle: "Import a single-player world",
    importHint:
      "Copies the world into the server, then selects it. The server's current worlds are backed up first (ZIP below).",
    import: "Import",
    importFile: "Choose a .sav file…",
    fileFilter: "Dragonwilds world",
    importConfirm:
      "Import this world? The server's worlds are backed up first (ZIP); a server world with the same name is moved to Saved/SaveGames-replaced.",
    imported: 'World "{{name}}" imported: it will be loaded at the next start.',
    noSoloWorlds: "No single-player world found on this PC ({{dir}}).",
    loadFailed: "Couldn't list the worlds.",
  },
};
