export default {
  arkDashboard: {
    startupReadyHint:
      'No "advertising for join" line in the log (usually 1 to 2 min). Counts toward the 3 restarts after a crash.',
    noServerPath: "No path configured",
    rconWarning:
      "RCON is off: Nexum stops the server without saving the world (up to 15 min of progress lost), can't warn players before a restart, and can't track them.",
    playersNeedRcon: "Turn RCON on to see who is connected.",
    info: 'The server takes one to two minutes to be ready after Start ("advertising for join" line in the logs) and uses about 10 GB of RAM. Nexum uses RCON to stop it cleanly (the world is saved), force a save and track players. Players find the server by its session name in the unofficial server list.',
  },
};
