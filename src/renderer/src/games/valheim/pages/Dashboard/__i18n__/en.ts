export default {
  valheimDashboard: {
    title: "Valheim Dashboard",
    noServerPath: "No path configured",
    noApi:
      "Player tracking is off: Valheim has no API, the server console below shows connections. For the online player count and history, install the Odin-Eye plugin and enter its address in Configuration → Network.",
    odinEye: {
      idle: "Player tracking through Odin-Eye ({{url}}): it will start with the server.",
      waiting:
        "Waiting for Odin-Eye ({{url}}): the plugin starts once the world is loaded.",
      connected: "Odin-Eye connected ({{url}}): player tracking is active.",
      error:
        "Odin-Eye is not responding — {{reason}} Player count and history are not tracked. You can test the address in Configuration → Network.",
    },
    players: {
      title: "Connected players",
      unknown:
        "Unknown — set up the Odin-Eye plugin (Configuration → Network) to track players",
    },
  },
};
