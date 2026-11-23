export default {
  arkConfig: {
    title: "Configuration",
    subtitle: "GameUserSettings.ini + ligne de commande",
    notice:
      "Nom de session, mots de passe, PvE et RCON sont écrits dans GameUserSettings.ini ; carte, joueurs max, ports et BattlEye passent par la ligne de commande. Les autres réglages de l'INI se modifient à la main, serveur arrêté : le serveur réécrit le fichier à l'arrêt.",
    groups: {
      server: "Serveur",
      access: "Accès et administration",
      network: "Réseau",
      advanced: "Avancé",
    },
    maps: {
      TheIsland_WP: "The Island",
      TheCenter_WP: "The Center",
      ScorchedEarth_WP: "Scorched Earth",
      Aberration_WP: "Aberration",
      Extinction_WP: "Extinction",
      Ragnarok_WP: "Ragnarok",
      Valguero_WP: "Valguero",
      LostColony_WP: "Lost Colony",
      Astraeos_WP: "Astraeos",
      Genesis_WP: "Genesis: Part 1",
    },
    fields: {
      SessionName: {
        label: "Nom de session",
        description:
          "Nom du serveur dans la liste des serveurs non officiels : c'est lui que les joueurs cherchent.",
      },
      map: {
        label: "Carte",
        description:
          "Un monde par carte (dossier SavedArks/<carte>). Changer de carte ne supprime pas l'ancien monde. Certaines cartes sont payantes : les joueurs doivent les posséder. Carte moddée : tapez son nom exact (par exemple Svartalfheim_WP) et ajoutez son mod dans la page Mods.",
      },
      maxPlayers: {
        label: "Joueurs max",
        description:
          "70 par défaut. Passé au serveur par -WinLiveMaxPlayers, le seul réglage qu'il prend en compte.",
      },
      ServerPVE: {
        label: "Mode PvE",
        description:
          "Activé : les joueurs ne peuvent pas s'attaquer entre eux ni attaquer les constructions des autres.",
      },
      ServerPassword: {
        label: "Mot de passe du serveur",
        description:
          "Demandé aux joueurs pour rejoindre. Vide = serveur ouvert à tous.",
      },
      ServerAdminPassword: {
        label: "Mot de passe admin",
        description:
          "Pour les commandes admin en jeu (EnableCheats <mot de passe>) et pour RCON. Si RCON est activé sans mot de passe, Nexum en crée un au démarrage.",
      },
      RCONEnabled: {
        label: "RCON",
        description:
          "Indispensable pour l'arrêt propre (le monde est sauvegardé), la sauvegarde à chaud, les annonces avant un redémarrage planifié et la page Joueurs. Sans RCON, Nexum arrête le serveur sans sauvegarde (jusqu'à 15 min de progression perdues).",
      },
      port: {
        label: "Port de jeu (UDP)",
        description:
          "7777 par défaut. Le seul port à rediriger sur la box. Un 2e serveur sur ce PC doit utiliser un autre port.",
      },
      queryPort: {
        label: "Port de requête (UDP)",
        description:
          "27015 par défaut. Pas besoin de le rediriger, mais deux serveurs ARK sur ce PC doivent en avoir un différent.",
      },
      rconPort: {
        label: "Port RCON (TCP)",
        description:
          "27020 par défaut. Ne jamais l'ouvrir sur Internet : Nexum s'y connecte depuis ce PC.",
      },
      battlEye: {
        label: "BattlEye",
        description:
          "Anti-triche. Désactivé : le serveur est lancé avec -NoBattlEye.",
      },
      customArgs: {
        label: "Arguments supplémentaires",
        description:
          "Ajoutés à la fin de la ligne de commande, séparés par des espaces (ex. -ForceAllowCaveFlyers). Ne pas y mettre de mot de passe : le journal du serveur recopie la ligne de commande.",
      },
    },
  },
};
