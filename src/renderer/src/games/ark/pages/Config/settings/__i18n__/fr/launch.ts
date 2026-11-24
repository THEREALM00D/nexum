export default {
  ServerPlatform: {
    label: "Plateformes acceptées",
    description:
      "ALL : PC et consoles (défaut). PC : PC seulement, nécessaire pour les mods « PC seulement ».",
  },
  clusterid: {
    label: "Identifiant de cluster",
    description:
      "Même valeur sur plusieurs serveurs pour transférer survivants, créatures et objets.",
  },
  ClusterDirOverride: {
    label: "Dossier du cluster",
    description:
      "Dossier partagé des transferts (demande un identifiant de cluster).",
  },
  NoTransferFromFiltering: {
    label: "Bloquer les transferts hors cluster",
    description:
      "Empêche les transferts depuis le solo ou des serveurs sans cluster.",
  },
  culture: {
    label: "Langue du serveur",
    description:
      "Code de langue des messages du serveur (en, fr, de…). Ne change pas la langue des joueurs.",
  },
  ActiveEvent: {
    label: "Événement",
    description: "Active un événement saisonnier.",
  },
  ForceRespawnDinos: {
    label: "Recréer les créatures sauvages",
    description:
      "⚠️ Supprime toutes les créatures sauvages à chaque démarrage.",
  },
  NoDinos: {
    label: "Sans créatures sauvages",
    description:
      "Plus aucune créature sauvage n'apparaît (celles présentes restent).",
  },
  NoWildBabies: {
    label: "Sans bébés sauvages",
    description: "Les bébés sauvages n'apparaissent plus.",
  },
  NoDinosExceptForcedSpawn: {
    label: "Créatures : apparitions forcées seulement",
    description: "Seules les apparitions forcées ont lieu.",
  },
  NoDinosExceptStreamingSpawn: {
    label: "Créatures : apparitions de zone seulement",
    description: "Seules les apparitions par chargement de zone ont lieu.",
  },
  NoDinosExceptManualSpawn: {
    label: "Créatures : apparitions manuelles seulement",
    description: "Seules les créatures créées à la main apparaissent.",
  },
  NoDinosExceptWaterSpawn: {
    label: "Créatures : aquatiques seulement",
    description: "Seules les créatures aquatiques apparaissent.",
  },
  ForceAllowCaveFlyers: {
    label: "Volants dans les grottes",
    description: "Autorise les créatures volantes dans les grottes.",
  },
  AllowFlyerSpeedLeveling: {
    label: "Vitesse des volants (option)",
    description:
      "Autorise les points de vitesse des volants (voir aussi Créatures).",
  },
  imprintlimit: {
    label: "Limite d'imprégnation",
    description:
      "Supprime les créatures au-dessus de ce pourcentage d'imprégnation (101 conseillé).",
  },
  UseTameEffectivenessClamp: {
    label: "Limiter l'efficacité d'apprivoisement",
    description: "L'efficacité d'apprivoisement ne dépasse pas 100 %.",
  },
  AutoDestroyStructures: {
    label: "Destruction auto des structures",
    description:
      "Active la destruction des vieilles structures (délai : Structures).",
  },
  EnableIdlePlayerKick: {
    label: "Exclure les inactifs",
    description:
      "Active l'exclusion des joueurs inactifs (délai : Administration).",
  },
  exclusivejoin: {
    label: "Liste blanche (option)",
    description: "Seuls les joueurs de la liste blanche peuvent rejoindre.",
  },
  pvedisallowtribewar: {
    label: "Interdire les guerres en PvE",
    description: "Les tribus ne peuvent pas se déclarer la guerre en PvE.",
  },
  pveallowtribewar: {
    label: "Autoriser les guerres en PvE",
    description: "Les tribus peuvent se déclarer la guerre en PvE.",
  },
  DisableRailgunPVP: {
    label: "Sans canon électrique Tek en PvP",
    description: "Désactive le canon électrique Tek sur les serveurs PvP.",
  },
  DisableCustomCosmetics: {
    label: "Sans cosmétiques personnalisés",
    description: "Désactive les mods cosmétiques des joueurs.",
  },
  DoCustomCosmeticValidation: {
    label: "Vérifier les cosmétiques",
    description: "Valide les mods cosmétiques des joueurs.",
  },
  DisableCustomFoldersInTributeInventories: {
    label: "Sans dossiers dans les transferts",
    description: "Interdit les dossiers dans l'inventaire des transferts.",
  },
  MinimumTimeBetweenInventoryRetrieval: {
    label: "Délai de récupération d'inventaire",
    description:
      "Secondes avant de pouvoir récupérer de nouveau un inventaire après la mort.",
  },
  passivemods: {
    label: "Mods passifs",
    description:
      "ID de mods chargés sans être actifs (pour les transferts), séparés par des virgules.",
  },
  TotalConversionMod: {
    label: "Mod de conversion totale",
    description: "ID du mod de conversion totale à charger.",
  },
  servergamelog: {
    label: "Journal d'administration",
    description:
      "Enregistre les actions d'administration (et RCON) dans des fichiers datés.",
  },
  servergamelogincludetribelogs: {
    label: "Journaux de tribu dans le journal",
    description: "Ajoute les journaux de tribu au journal du serveur.",
  },
  ServerRCONOutputTribeLogs: {
    label: "Journaux de tribu par RCON",
    description:
      "Envoie les journaux de tribu par RCON (demande l'option précédente).",
  },
  NotifyAdminCommandsInChat: {
    label: "Commandes admin dans le chat des admins",
    description:
      "Les commandes d'administration s'affichent pour les admins seulement.",
  },
  AllowChatSpam: {
    label: "Autoriser le spam du chat",
    description: "Désactive la protection contre le spam du chat.",
  },
  webalarm: {
    label: "Alarmes web",
    description:
      "Notifications web pour les événements de tribu (alarmes, naissances…).",
  },
  UseDynamicConfig: {
    label: "Config dynamique",
    description: "Active la config dynamique (URL : Administration).",
  },
  MaxNumOfSaveBackups: {
    label: "Copies de sauvegarde du jeu",
    description: "Nombre de copies de sauvegarde gardées par le jeu.",
  },
  GBUsageToForceRestart: {
    label: "Redémarrage au-delà de X Go",
    description:
      "Sauvegarde et redémarre le serveur au-delà de ce nombre de Go de RAM ; 0 désactive.",
  },
  usestore: {
    label: "Profils séparés",
    description:
      "Enregistre les profils des personnages dans des fichiers séparés.",
  },
  converttostore: {
    label: "Convertir en profils séparés",
    description:
      "Convertit les données à la prochaine sauvegarde (demande Profils séparés).",
  },
  BackupTransferPlayerDatas: {
    label: "Sauvegarder les profils",
    description: "Garde des copies des profils (demande Profils séparés).",
  },
  disableCharacterTracker: {
    label: "Sans suivi des personnages",
    description: "Désactive le suivi des personnages.",
  },
  UseItemDupeCheck: {
    label: "Anti-duplication des objets",
    description: "Protection supplémentaire contre la duplication d'objets.",
  },
  EnableVictoryCoreDupeCheck: {
    label: "Anti-duplication des créatures",
    description:
      "Vérification supplémentaire contre la duplication de créatures.",
  },
  ForceDupeLog: {
    label: "Journal de duplication",
    description: "Force l'écriture du journal de duplication.",
  },
  DisableDupeLogDeletes: {
    label: "Garder le journal de duplication",
    description: "Empêche l'effet de « Journal de duplication ».",
  },
  ignoredupeditems: {
    label: "Ignorer les objets dupliqués",
    description: "Ne supprime pas les objets dupliqués trouvés.",
  },
  noundermeshchecking: {
    label: "Sans anti-traversée du terrain",
    description:
      "Désactive entièrement la protection contre le passage sous le terrain.",
  },
  noundermeshkilling: {
    label: "Sans mort sous le terrain",
    description:
      "Les joueurs sous le terrain sont téléportés au lieu d'être tués.",
  },
  forcedisablemeshchecking: {
    label: "Sans vérification du terrain",
    description:
      "Désactive la vérification du terrain à la repousse de la végétation.",
  },
  UnstasisDinoObstructionCheck: {
    label: "Créatures dans les murs",
    description:
      "Empêche les créatures de traverser murs et terrain à leur réveil.",
  },
  UseServerNetSpeedCheck: {
    label: "Contrôle de vitesse réseau",
    description: "Ignore les mouvements de joueur en trop à chaque tick.",
  },
  BattlEyeServerRecheck: {
    label: "Revérifier BattlEye",
    description:
      "Vérifie l'état de BattlEye à chaque tick (serveurs officiels).",
  },
  insecure: {
    label: "Sans VAC",
    description: "Désactive l'anti-triche Valve (VAC).",
  },
  StasisKeepControllers: {
    label: "Garder l'IA en mémoire",
    description:
      "Meilleures performances sur les grandes cartes, plus de mémoire utilisée.",
  },
  AlwaysTickDedicatedSkeletalMeshes: {
    label: "Animer toutes les créatures",
    description:
      "Désactive l'optimisation des animations des créatures inactives.",
  },
  disabledinonetrangescaling: {
    label: "Portée réseau fixe des créatures",
    description:
      "La portée réseau des créatures ne dépend plus du nombre de joueurs.",
  },
  NoHangDetection: {
    label: "Sans détection de blocage",
    description:
      "Le serveur ne s'arrête pas si son démarrage dépasse 45 minutes.",
  },
  NoAI: {
    label: "Sans IA",
    description: "⚠️ Les créatures n'ont plus d'IA (tests seulement).",
  },
  nosound: {
    label: "Sans son",
    description: "Désactive le son du serveur.",
  },
  noperfthreads: {
    label: "Sans threads de performance",
    description: "Désactive les threads de performance.",
  },
  onethread: {
    label: "Un seul thread",
    description: "⚠️ Désactive le multithreading (tests seulement).",
  },
};
