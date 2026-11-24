export default {
  arkLaunchImport: {
    title: "Reprendre la ligne de lancement",
    intro:
      "La carte, les ports, les mods et les options de l'ancien serveur ne sont que sur sa ligne de lancement. Nexum la reprend pour retrouver le même monde.",
    sources: {
      log: "Log du serveur",
      paste: "Coller",
      file: "Fichier .bat",
    },
    foundInLog: "Trouvée dans {{file}} ({{date}}).",
    noLog:
      "Aucune ligne trouvée dans les logs du serveur : collez-la ou choisissez le .bat qui le lance.",
    noLineInFile: "Ce fichier ne lance pas ArkAscendedServer.",
    fromFile: "Lue dans {{file}}.",
    scriptFilter: "Scripts de lancement",
    line: "Ligne de lancement",
    linePlaceholder:
      'TheIsland_WP?listen?SessionName="Mon serveur" -port=7777 -mods=…',
    summary: "Ce qui sera repris",
    map: "Carte",
    world: "Monde",
    worldOption:
      "{{folder}} : enregistré le {{date}}, {{profiles}} profil(s), {{tribes}} tribu(s)",
    newWorld: "Aucun monde trouvé : nouveau monde",
    worldHint:
      "Le plus récent est choisi. La ligne indique AltSaveDirectoryName={{folder}}.",
    ports: "Ports",
    portsValue: "jeu {{game}}/UDP, requête {{query}}/UDP, RCON {{rcon}}/TCP",
    players: "Joueurs max",
    battlEye: "BattlEye",
    yes: "Activé",
    no: "Désactivé",
    mods: "Mods",
    modsCount_one: "{{count}} mod",
    modsCount_other: "{{count}} mods",
    cluster: "Cluster",
    clusterValue: "{{id}}, dossier {{dir}}",
    options: "Options de lancement",
    iniSettings: "Écrit dans GameUserSettings.ini",
    customArgs: "Arguments supplémentaires",
    none: "Aucun",
    conflicts: "Ports déjà utilisés par un serveur de Nexum : {{list}}.",
    conflictItem: "{{label}} {{port}}/{{protocol}} ({{server}})",
    portLabels: { game: "jeu", query: "requête", rcon: "RCON" },
    conflictsHint:
      "Les deux serveurs ne pourront pas tourner en même temps : changez un des ports dans la page Configuration.",
    notices: "Non repris tel quel :",
    notice: {
      noMap: "La ligne n'indique pas de carte : TheIsland_WP par défaut.",
      mapInvalid:
        "Carte illisible ({{detail}}) : TheIsland_WP par défaut, à corriger dans la page Configuration.",
      maxPlayersQuery:
        "?MaxPlayers est ignoré par le jeu ; sa valeur est reprise faute de -WinLiveMaxPlayers.",
      queryFlag: "{{detail}} : option sans valeur, non reprise.",
      multihome:
        "{{detail}} : gardé dans les arguments supplémentaires. Le serveur n'écoutera que sur cette adresse : RCON (arrêt propre, annonces) peut ne plus répondre.",
      valueWithSpace:
        "{{detail}} : une valeur avec des espaces ne peut pas être reprise. Réglez l'option à la main après l'import.",
      invalidValue: "{{detail}} : valeur invalide, non reprise.",
      batchVariable:
        "{{detail}} : variable du script, non reprise. Remplacez-la par sa valeur dans la ligne.",
      portsSame:
        "Port de jeu et port de requête identiques ({{detail}}) : changez-en un dans la ligne, sinon l'import est refusé.",
      worldNotFound:
        "Aucun monde {{detail}} dans ce dossier : un nouveau monde sera créé au premier démarrage.",
    },
    modSettings: "Réglages des mods (gardés en place)",
    modSections_one: "{{count}} section dans les INI : {{list}}",
    modSections_other: "{{count}} sections dans les INI : {{list}}",
    modFiles_one: "{{count}} fichier dans Saved : {{list}}",
    modFiles_other: "{{count}} fichiers dans Saved : {{list}}",
    serverApi:
      "ServerAPI installé avec {{count}} plugin(s) ({{list}}) : Nexum lance ArkAscendedServer.exe directement, ces plugins ne seront pas chargés.",
    openDialog: "Reprendre une ligne de lancement",
    dialogIntro:
      "Remplace la carte, les ports, les mods, les options de lancement et les arguments supplémentaires de ce serveur par ceux de la ligne. Les modifications non enregistrées des onglets de la page Configuration seront perdues.",
    apply: "Appliquer",
    cancel: "Annuler",
    applied: "Ligne de lancement reprise",
  },
};
