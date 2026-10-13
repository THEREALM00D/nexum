export default {
  setup: {
    title: "Set up a server",
    subtitle:
      "A few steps to get your game server running. You can change everything later from the menu on the left.",
    steps: {
      game: "Game",
      install: "Installation",
      config: "Configuration",
      network: "Firewall",
      start: "Start",
    },
    help: {
      game: "Pick the game, then whether Nexum should install a new server or use one you already have.",
      install:
        "Install SteamCMD (Steam's tool for dedicated servers), then the game server. The download can take a few minutes.",
      config:
        "Set the server name, password and world settings. Don't forget to save.",
      network:
        "Apply the Windows firewall rules so players can reach the server (Windows asks for one confirmation).",
      start:
        "Start the server, then share the address below with your friends.",
    },
    game: {
      which: "Which game?",
      mode: "Server",
      new: "Install a new server",
      existing: "I already have a server",
      name: "Server name in Nexum",
      nameHelper: "Only shown in Nexum. Leave empty to use the folder name.",
      pathNew: "Install folder",
      pathNewHelper:
        "The server will be installed here (several GB). Pick a drive with enough space.",
      pathExisting: "Server folder",
      pathExistingHelper:
        "The folder that contains the server's executable. Nexum detects the game.",
      browse: "Browse",
    },
    create: "Create the server",
    next: "Next",
    back: "Back",
    skip: "Skip",
    finish: "Finish",
  },
};
