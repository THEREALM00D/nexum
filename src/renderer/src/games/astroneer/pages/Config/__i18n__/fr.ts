export default {
  astroneerConfig: {
    title: "Configuration",
    subtitle: "Engine.ini + AstroServerSettings.ini",
    groups: {
      general: "Serveur",
      players: "Joueurs",
      save: "Sauvegarde",
      performance: "Performance",
      advanced: "Avancé",
    },
    fields: {
      ServerName: {
        label: "Nom du serveur",
        description: "Nom affiché dans le navigateur de serveurs.",
      },
      ServerAdvertisedName: {
        label: "Nom affiché (override)",
        description:
          "Si renseigné, remplace le nom du serveur affiché aux joueurs.",
      },
      PublicIP: {
        label: "IP publique",
        description:
          "IP publique annoncée aux joueurs. Requise pour apparaître dans le navigateur de serveurs.",
      },
      ServerPassword: {
        label: "Mot de passe serveur",
        description:
          "Mot de passe requis pour rejoindre. Laisser vide pour un serveur public.",
      },
      Port: {
        label: "Port",
        description: "Port UDP utilisé par les joueurs (défaut 8777).",
      },
      MaxPlayerCount: {
        label: "Joueurs max",
        description:
          "Nombre maximum de joueurs simultanés (limite dure de 8 côté jeu).",
      },
      OwnerName: {
        label: "Propriétaire (nom Steam)",
        description:
          "Le premier joueur se connectant avec ce nom devient propriétaire du serveur.",
      },
      OwnerGuid: {
        label: "Propriétaire (SteamID64)",
        description: "Laisser à 0 pour une assignation automatique.",
      },
      PlayerActivityTimeout: {
        label: "Timeout inactivité (s)",
        description:
          "Délai avant expulsion d'un joueur inactif (AFK). 0 = désactivé.",
      },
      DenyUnlistedPlayers: {
        label: "Liste blanche uniquement",
        description:
          "Si activé, seuls les joueurs explicitement autorisés peuvent rejoindre.",
      },
      ActiveSaveFileDescriptiveName: {
        label: "Nom de la sauvegarde active",
        description:
          "Nom de fichier de sauvegarde (sans extension). Changer crée/charge une autre partie.",
      },
      AutoSaveGameInterval: {
        label: "Intervalle auto-save (s)",
        description: "Intervalle entre chaque sauvegarde automatique.",
      },
      BackupSaveGamesInterval: {
        label: "Intervalle backup interne (s)",
        description:
          "Intervalle entre chaque backup interne du jeu (indépendant des sauvegardes Nexum).",
      },
      MaxServerFramerate: {
        label: "Framerate max (joueurs connectés)",
        description:
          "Limite de tick/framerate serveur quand des joueurs sont connectés.",
      },
      MaxServerIdleFramerate: {
        label: "Framerate max (inactif)",
        description:
          "Limite de framerate serveur quand aucun joueur n'est connecté.",
      },
      bDisableServerTravel: {
        label: "Désactiver le voyage entre planètes",
        description:
          "Empêche les joueurs de voyager d'une planète à une autre.",
      },
      VerbosePlayerProperties: {
        label: "Logs joueurs détaillés",
        description:
          "Active des logs plus détaillés sur les propriétés joueur.",
      },
      ConsolePort: {
        label: "Port console (RCON)",
        description:
          "Port TCP du protocole console/RCON. À ne jamais exposer publiquement — Nexum ne l'utilise pas (MVP).",
      },
      ConsolePassword: {
        label: "Mot de passe console (RCON)",
        description:
          "Mot de passe requis par un client RCON tiers pour se connecter au port console.",
      },
    },
  },
};
