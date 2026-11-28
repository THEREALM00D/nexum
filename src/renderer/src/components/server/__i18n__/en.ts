export default {
  join: {
    title: "Join the server",
    local: "Same network",
    internet: "From the Internet",
    code: "Crossplay join code",
    searchName: "Name to search for in game",
    showPublicIp: "Show my public IP",
    publicIpTooltip:
      "Asks the ipify.org service for your public IP address (only when you click)",
    publicIpError:
      "Couldn't get your public IP. Check your Internet connection.",
    copy: "Copy",
    copied: "Copied",
    thisPc: "this PC",
    notRunning: "Start the server: the addresses to share will appear here.",
    hint: "For friends outside your network: forward UDP port(s) {{range}} on your router to {{ip}}, and apply the firewall rules (Network page). Most routers won't let you join your own public IP from inside your network: have a friend test it.",
  },
  serverWatchdog: {
    stuckStart_one:
      "The server had not finished starting after {{count}} minute: Nexum killed and restarted it at {{time}} (attempt {{attempt}} of {{max}}).",
    stuckStart_other:
      "The server had not finished starting after {{count}} minutes: Nexum killed and restarted it at {{time}} (attempt {{attempt}} of {{max}}).",
    stuckGaveUp_one:
      "The server doesn't finish starting ({{count}} minute) and was already restarted {{max}} times in 30 minutes: Nexum stopped it at {{time}} and no longer restarts it. Check its logs.",
    stuckGaveUp_other:
      "The server doesn't finish starting ({{count}} minutes) and was already restarted {{max}} times in 30 minutes: Nexum stopped it at {{time}} and no longer restarts it. Check its logs.",
    ramLimit:
      "Server RAM stayed above {{limit}} GB for 5 minutes ({{ram}} GB): restart started at {{time}}, players are warned before the stop.",
    ramGaveUp:
      "Server RAM is still above {{limit}} GB ({{ram}} GB) after {{max}} restarts in 6 hours: Nexum no longer restarts it for RAM for a few hours. Look for the cause (mods, memory leak) or raise the limit.",
    ramLimitNoWarning:
      "Server RAM stayed above {{limit}} GB for 5 minutes ({{ram}} GB): Nexum restarted it at {{time}} (the game can't warn players).",
    viewLogs: "View logs",
    dismiss: "Dismiss",
  },
  serverMenu: {
    more: "More actions",
    saveNow: "Save the world now",
    sendMessage: "Send a message to players",
    kill: "Kill the process",
    killHelper: "Without saving, if Stop no longer responds",
    unavailable: {
      rconDisabled: "Enable RCON (Configuration page)",
      restApiDisabled: "Enable the REST API (Configuration page)",
      noCommand: "No command for this game",
    },
    messageTitle: "Send a message to players",
    messageLabel: "Message",
    messageHelper: "Shown in the game chat.",
    messageAscii:
      "The game can't display accents: Nexum removes them when sending.",
    messagePreview: "Sent:",
    playersOnline_one: "{{count}} player online.",
    playersOnline_other: "{{count}} players online.",
    send: "Send",
    cancel: "Cancel",
    killTitle: 'Kill "{{name}}"?',
    killWarning:
      "The server stops right away, without warning players or saving. Everything since the game's last save is lost (up to 15 min for ARK). Use it only if Stop no longer responds.",
    notify: {
      saved: 'World of "{{name}}" saved',
      saveFailed: "Couldn't save the world",
      messageSent: "Message sent to players",
      messageFailed: "Couldn't send the message",
      killed: '"{{name}}" was killed',
    },
  },
  serverDashboard: {
    since: "for {{duration}}",
    viewLogs: "View logs",
    players: "Players online",
    ramServer: "Server RAM",
    ramOf: "of {{total}} GB installed",
    ramUsedOf: "{{used}} / {{total}} GB",
    onlineFor: "Online for",
    nextRestart: "Next scheduled restart: {{time}}",
    thisPc: "This PC",
    cpu: "CPU",
    ram: "RAM",
    poweredOnFor: "Up for",
  },
  logs: {
    title: "Server logs",
    latest: "Latest logs",
    viewAll: "View all",
    lines: "{{count}} lines",
    clear: "Clear",
    empty: "No logs — start the server to see logs.",
    copy: "Copy",
    copyTooltip:
      "Copy the whole log, with the Nexum version and game at the top (handy for a bug report). Public IP addresses, player IDs (Steam, EOS), passwords and join codes are hidden.",
    copied:
      "Log copied. IP addresses, player IDs, passwords and join codes were hidden; player names were kept.",
    copyError: "Couldn't copy the log to the clipboard.",
    save: "Save as .txt",
    saved:
      "Log saved. IP addresses, player IDs, passwords and join codes were hidden; player names were kept.",
    saveError: "Couldn't save the log: {{error}}",
    showInFolder: "Show in folder",
    newLines: "New lines — back to live",
    session: {
      live: "Current session (live)",
      crashed: "crashed",
      openDir: "Open the logs folder",
    },
  },
};
