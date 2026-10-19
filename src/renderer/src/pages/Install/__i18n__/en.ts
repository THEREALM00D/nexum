export default {
  install: {
    title: "Installation",
    subtitle: "Install or update the {{game}} server via SteamCMD",
    steamcmd: {
      label: "SteamCMD",
      installed: "Installed",
      notInstalled: "Not installed",
      statusOk: "OK",
      statusMissing: "Missing",
      install: "Install SteamCMD",
    },
    folder: {
      title: "Installation folder",
      installGame: "Install {{game}}",
      installing: "Installing...",
      update: "Update",
    },
    update: {
      title: "Update available?",
      installedBuild: "Installed build: {{build}}",
      check: "Check",
      checking: "Connecting to Steam...",
      upToDate: "The server is up to date.",
      cannotRead:
        "Unable to read the installed build — is the server properly installed in this folder?",
      available: "Update available",
      availableWithBuild: "Update available (build {{build}}).",
    },
    launchArgs: {
      title: "Launch arguments",
      publicLobby: "Public lobby (Xbox / PS crossplay)",
      publicLobbyTooltip:
        "Adds -publiclobby. The server appears in the Palworld Community tab on all platforms and is joinable by Xbox players. A Lobby ID is shown in the logs at startup.",
      performanceFlags: "Multi-thread performance flags",
      performanceFlagsTooltip:
        "Adds -useperfthreads -NoAsyncLoadingThread -UseMultithreadForDS. Recommended on multi-core CPUs for better stability.",
      customArgs: "Custom arguments",
      customArgsTooltip:
        "Extra arguments appended to the PalServer.exe command line (space-separated). Advanced.",
      saved: "Launch arguments saved. Restart the server to apply.",
    },
    progress: "Progress",
  },
};
