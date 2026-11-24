export default {
  AutoSavePeriodMinutes: {
    label: "Sauvegarde automatique",
    description:
      "Minutes entre deux sauvegardes du monde ; 0 sauvegarde en continu.",
  },
  KickIdlePlayersPeriod: {
    label: "Exclusion des joueurs inactifs",
    description:
      "Secondes d'inactivité avant l'exclusion. Demande l'option de lancement -EnableIdlePlayerKick.",
  },
  EnableAFKKickPlayerCountPercent: {
    label: "Seuil d'exclusion des inactifs",
    description:
      "L'exclusion ne s'applique qu'au-delà de cette fraction de joueurs max (0 à 1).",
  },
  AdminLogging: {
    label: "Afficher les commandes admin",
    description: "Les commandes d'administration apparaissent dans le chat.",
  },
  AllowHideDamageSourceFromLogs: {
    label: "Masquer la source des dégâts",
    description:
      "Faux affiche la source des dégâts dans les journaux de tribu.",
  },
  RCONServerGameLogBuffer: {
    label: "Lignes du journal par RCON",
    description: "Nombre de lignes du journal du jeu envoyées par RCON.",
  },
  AlwaysNotifyPlayerLeft: {
    label: "Annoncer les départs",
    description: "Les joueurs sont toujours prévenus quand quelqu'un part.",
  },
  DontAlwaysNotifyPlayerJoined: {
    label: "Ne pas annoncer les arrivées",
    description: "Désactive l'annonce des joueurs qui rejoignent.",
  },
  AllowSharedConnections: {
    label: "Partage familial Steam",
    description: "Autorise les joueurs en partage familial.",
  },
  UseExclusiveList: {
    label: "Liste blanche",
    description:
      "Seuls les joueurs de la liste peuvent rejoindre (comme -exclusivejoin).",
  },
  UseCharacterTracker: {
    label: "Suivi des personnages",
    description:
      "Active le suivi des personnages (-disableCharacterTracker l'emporte).",
  },
  SpectatorPassword: {
    label: "Mot de passe spectateur",
    description: "Mot de passe du mode spectateur pour les non-admins.",
  },
  BanListURL: {
    label: "URL de la liste de bannis",
    description: "Liste de bannissement globale, relue toutes les 10 minutes.",
  },
  AdminListURL: {
    label: "URL de la liste d'admins",
    description:
      "Liste d'admins en ligne, à la place d'AllowedCheaterAccountIDs.txt.",
  },
  UpdateAllowedCheatersInterval: {
    label: "Relecture de la liste d'admins",
    description: "Secondes entre deux lectures de l'URL d'admins (3 minimum).",
  },
  CosmeticWhitelistOverride: {
    label: "URL des cosmétiques autorisés",
    description: "Liste des cosmétiques personnalisés autorisés.",
  },
  CustomDynamicConfigUrl: {
    label: "URL de config dynamique",
    description:
      "Fichier dynamicconfig.ini en ligne. Demande l'option de lancement -UseDynamicConfig.",
  },
  CustomLiveTuningUrl: {
    label: "URL de réglage en direct",
    description: "Fichier de réglages en direct.",
  },
  BadWordListURL: {
    label: "URL des mots interdits",
    description: "Votre propre liste de mots filtrés.",
  },
  BadWordWhiteListURL: {
    label: "URL des mots autorisés",
    description: "Votre propre liste de mots jamais filtrés.",
  },
  bFilterChat: {
    label: "Filtrer le chat",
    description: "Filtre le chat avec les listes de mots.",
  },
  bFilterCharacterNames: {
    label: "Filtrer les noms de personnages",
    description: "Filtre les noms de personnages avec les listes de mots.",
  },
  bFilterTribeNames: {
    label: "Filtrer les noms de tribus",
    description: "Filtre les noms de tribus avec les listes de mots.",
  },
  LogChatMessages: {
    label: "Journal du chat",
    description: "Enregistre le chat en JSON dans Saved/Logs/ChatLogs.",
  },
  ChatLogFileSplitIntervalSeconds: {
    label: "Découpage du journal du chat",
    description:
      "Secondes entre deux fichiers de journal du chat (45 minimum).",
  },
  ChatLogFlushIntervalSeconds: {
    label: "Écriture du journal du chat",
    description: "Secondes entre deux écritures sur le disque (15 minimum).",
  },
  ChatLogMaxAgeInDays: {
    label: "Conservation du journal du chat",
    description: "Jours de conservation ; -1 = sans limite.",
  },
  DontRestoreBackup: {
    label: "Ne pas restaurer de sauvegarde",
    description:
      "Ne restaure pas automatiquement une sauvegarde après un monde corrompu.",
  },
  EnableMeshBitingProtection: {
    label: "Protection contre les morsures à travers les murs",
    description: "Faux désactive cette protection.",
  },
  ServerEnableMeshChecking: {
    label: "Vérification du terrain",
    description: "Vérifie le terrain lors de la repousse de la végétation.",
  },
  AutoRestartIntervalSeconds: {
    label: "Redémarrage automatique du jeu",
    description:
      "Secondes avant un arrêt automatique (le serveur s'arrête au lieu de redémarrer). Préférer la page Planification.",
  },
  Message: {
    label: "Message d'accueil",
    description:
      "Affiché aux joueurs à la connexion ; \\n pour un retour à la ligne.",
  },
  Duration: {
    label: "Durée du message d'accueil",
    description: "Secondes d'affichage du message.",
  },
};
