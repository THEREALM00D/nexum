export default {
  arkLaunchImport: {
    title: "Take over the launch line",
    intro:
      "The old server's map, ports, mods and options only exist on its launch line. Nexum takes it over to find the same world.",
    sources: {
      log: "Server log",
      paste: "Paste",
      file: ".bat file",
    },
    foundInLog: "Found in {{file}} ({{date}}).",
    noLog:
      "No launch line found in the server logs: paste it or choose the .bat that starts the server.",
    noLineInFile: "This file doesn't start ArkAscendedServer.",
    fromFile: "Read from {{file}}.",
    scriptFilter: "Launch scripts",
    line: "Launch line",
    linePlaceholder:
      'TheIsland_WP?listen?SessionName="My server" -port=7777 -mods=…',
    summary: "What will be taken over",
    map: "Map",
    world: "World",
    worldOption:
      "{{folder}}: saved on {{date}}, {{profiles}} profile(s), {{tribes}} tribe(s)",
    newWorld: "No world found: new world",
    worldHint:
      "The most recent one is selected. The line sets AltSaveDirectoryName={{folder}}.",
    worldLineHint: "The line sets AltSaveDirectoryName={{folder}}.",
    ports: "Ports",
    portsValue: "game {{game}}/UDP, query {{query}}/UDP, RCON {{rcon}}/TCP",
    players: "Max players",
    battlEye: "BattlEye",
    yes: "On",
    no: "Off",
    mods: "Mods",
    modsCount_one: "{{count}} mod",
    modsCount_other: "{{count}} mods",
    cluster: "Cluster",
    clusterValue: "{{id}}, folder {{folder}}",
    options: "Launch options",
    iniSettings: "Written to GameUserSettings.ini",
    customArgs: "Extra arguments",
    none: "None",
    conflicts: "Ports already used by a Nexum server: {{list}}.",
    conflictItem: "{{label}} {{port}}/{{protocol}} ({{server}})",
    portLabels: { game: "game", query: "query", rcon: "RCON" },
    conflictsHint:
      "Both servers can't run at the same time: change one of the ports on the Configuration page.",
    notices: "Not taken over as is:",
    notice: {
      noMap: "The line has no map: TheIsland_WP by default.",
      mapInvalid:
        "Unreadable map ({{detail}}): TheIsland_WP by default, fix it on the Configuration page.",
      maxPlayersQuery:
        "?MaxPlayers is ignored by the game; its value is used since there's no -WinLiveMaxPlayers.",
      queryFlag: "{{detail}}: option without a value, not taken over.",
      multihome:
        "{{detail}}: kept in the extra arguments. The server will only listen on this address: RCON (clean stop, announcements) may stop answering.",
      valueWithSpace:
        "{{detail}}: a value with spaces can't be taken over. Set the option by hand after the import.",
      invalidValue: "{{detail}}: invalid value, not taken over.",
      batchVariable:
        "{{detail}}: script variable, not taken over. Replace it with its value in the line.",
      portsSame:
        "Same game and query port ({{detail}}): change one of them in the line, otherwise the import is refused.",
      worldNotFound:
        "No {{detail}} world in this folder: a new world will be created on the first start.",
    },
    modSettings: "Mod settings (kept in place)",
    modSections_one: "{{count}} section in the INI files: {{list}}",
    modSections_other: "{{count}} sections in the INI files: {{list}}",
    modFiles_one: "{{count}} file in Saved: {{list}}",
    modFiles_other: "{{count}} files in Saved: {{list}}",
    serverApi:
      "ServerAPI installed with {{count}} plugin(s) ({{list}}): Nexum starts ArkAscendedServer.exe directly, these plugins won't be loaded.",
    openDialog: "Take over a launch line",
    dialogIntro:
      "Replaces this server's map, ports, mods, launch options and extra arguments with the ones on the line. Unsaved changes in the Configuration tabs will be lost.",
    apply: "Apply",
    cancel: "Cancel",
    applied: "Launch line taken over",
  },
};
