export default {
  enshroudedConfig: {
    title: "Configuration du serveur",
    subtitle: "enshrouded_server.json",
    openServerFolder: "Ouvrir le dossier du serveur",
    save: "Enregistrer",
    saved: "Enregistré !",
    noServerPath:
      "Configurez le dossier du serveur dans l'onglet Installation.",
    lockedWhileRunning:
      "Le serveur réécrit enshrouded_server.json à chaque démarrage : arrêtez-le pour modifier sa configuration. Le fichier est relu à l'arrêt.",
    sections: {
      general: "Général",
      network: "Réseau",
      difficulty: "Difficulté",
      gameSettings: "Réglages de partie",
      advanced: "Avancé",
      userGroups: "Groupes et mots de passe",
    },
    fields: {
      name: {
        label: "Nom du serveur",
        description:
          "Affiché dans la liste des serveurs du jeu : c'est ce nom que vos amis cherchent.",
      },
      slotCount: {
        label: "Joueurs maximum",
        description:
          "De 1 à 16. Chaque joueur ajoute environ 100 Mo de RAM au serveur.",
      },
      enableTextChat: {
        label: "Chat écrit",
        description: "Active le chat texte sur le serveur.",
      },
      enableVoiceChat: {
        label: "Chat vocal",
        description: "Active le chat vocal sur le serveur.",
      },
      voiceChatMode: { label: "Mode du chat vocal" },
      queryPort: {
        label: "Port (UDP)",
        description:
          "15637 par défaut. C'est le seul port à ouvrir et à rediriger sur la box. Un 2e serveur sur ce PC doit en utiliser un autre.",
      },
      ip: {
        label: "Adresse d'écoute",
        description:
          "Laissez 0.0.0.0 (toutes les cartes réseau), sauf besoin précis.",
      },
      saveDirectory: {
        label: "Dossier des sauvegardes",
        description:
          "./savegame par défaut, relatif au dossier du serveur. Les sauvegardes de Nexum suivent ce dossier.",
      },
      logDirectory: {
        label: "Dossier des logs du jeu",
        description: "./logs par défaut, relatif au dossier du serveur.",
      },
      customArgs: {
        label: "Arguments supplémentaires",
        description:
          "Ajoutés à la ligne de commande du serveur. Enshrouded n'en documente aucun : toute la configuration est dans le fichier.",
      },
    },
    difficulty: {
      description:
        "Les presets règlent toute la difficulté d'un coup. Personnalisé est le seul qui utilise les réglages de partie ci-dessous.",
      presetHint:
        "Les réglages de partie ne sont pas utilisés avec ce preset. En modifier un passe en Personnalisé.",
      customHint: "Le serveur utilise les réglages de partie ci-dessous.",
      presets: {
        Default: "Normal",
        Relaxed: "Détente",
        Hard: "Difficile",
        Survival: "Survie",
        Custom: "Personnalisé",
      },
    },
    gameSettings: {
      description:
        "Les facteurs multiplient la valeur normale du jeu (1 = normal, 2 = double). Une valeur hors limites est ramenée à la limite par le serveur.",
    },
    themes: {
      player: "Joueurs",
      survival: "Survie",
      world: "Monde et ressources",
      progression: "Progression",
      enemies: "Ennemis",
      bosses: "Boss",
      time: "Jour et nuit",
    },
    options: {
      Proximity: "Proximité",
      Global: "Tout le serveur",
      Few: "Peu",
      Normal: "Normal",
      Automatic: "Automatique",
      Many: "Beaucoup",
      Extreme: "Extrême",
      Disabled: "Aucun",
      Rare: "Rare",
      Often: "Fréquent",
      VeryEasy: "Très facile",
      Easy: "Facile",
      Hard: "Difficile",
      VeryHard: "Très difficile",
      KeepProgress: "Garder la progression",
      LoseSomeProgress: "Perdre une partie",
      LoseAllProgress: "Tout perdre",
      AddBackpackMaterials: "Perdre les matériaux",
      Everything: "Perdre tout le sac",
      NoTombstone: "Ne rien perdre",
    },
    settings: {
      playerHealthFactor: {
        label: "Vie des joueurs",
        description: "0,25 à 4.",
      },
      playerManaFactor: { label: "Mana des joueurs", description: "0,25 à 4." },
      playerStaminaFactor: {
        label: "Endurance des joueurs",
        description: "0,25 à 4.",
      },
      playerBodyHeatFactor: {
        label: "Chaleur corporelle",
        description:
          "Temps avant l'hypothermie dans les zones froides. 0,5 à 2.",
      },
      playerDivingTimeFactor: {
        label: "Temps sous l'eau",
        description: "Oxygène de départ. 0,5 à 2.",
      },
      enableDurability: {
        label: "Usure des armes",
        description: "Désactivé : les armes ne cassent plus.",
      },
      enableStarvingDebuff: {
        label: "Faim et famine",
        description:
          "En famine, le joueur perd de la vie jusqu'à manger ou boire.",
      },
      foodBuffDurationFactor: {
        label: "Durée des effets de nourriture",
        description: "0,5 à 2.",
      },
      fromHungerToStarving: {
        label: "Temps avant la famine (minutes)",
        description: "De 5 à 20 minutes.",
      },
      shroudTimeFactor: {
        label: "Temps dans le Voile",
        description: "Durée possible dans le Voile. 0,5 à 2.",
      },
      tombstoneMode: {
        label: "À la mort",
        description:
          "Ce que le joueur perd en mourant, à récupérer sur sa tombe.",
      },
      curseModifier: {
        label: "Malédiction du Voile",
        description:
          "Facile : désactivée. Difficile : deux fois plus de risques qu'en normal.",
      },
      enableGliderTurbulences: {
        label: "Turbulences en planeur",
        description: "Désactivé : le planeur n'est plus secoué.",
      },
      weatherFrequency: { label: "Fréquence de la météo" },
      fishingDifficulty: { label: "Difficulté de la pêche" },
      miningDamageFactor: {
        label: "Efficacité du minage",
        description:
          "Plus de terrain creusé et de ressources par coup. 0,5 à 2.",
      },
      plantGrowthSpeedFactor: {
        label: "Pousse des plantes",
        description: "0,25 à 2.",
      },
      resourceDropStackAmountFactor: {
        label: "Quantité de ressources",
        description: "Ressources par butin (coffres, ennemis…). 0,25 à 2.",
      },
      factoryProductionSpeedFactor: {
        label: "Vitesse des ateliers",
        description: "0,25 à 2.",
      },
      flameLevelFogRemoval: {
        label: "Niveau de Flamme pour un autel dans le Voile",
        description:
          "Niveau de Flamme requis pour poser un autel de Flamme dans le Voile. 0 à 20 (11 par défaut).",
      },
      experienceCombatFactor: {
        label: "Expérience de combat",
        description: "0,25 à 2.",
      },
      experienceMiningFactor: {
        label: "Expérience de minage",
        description: "0 à 2.",
      },
      experienceExplorationQuestsFactor: {
        label: "Expérience d'exploration et de quêtes",
        description: "0,25 à 2.",
      },
      perkCostFactor: {
        label: "Coût d'amélioration des armes",
        description: "Runes nécessaires. 0,25 à 2.",
      },
      perkUpgradeRecyclingFactor: {
        label: "Runes rendues au recyclage",
        description:
          "Part des runes rendue en recyclant une arme améliorée. 0 à 1.",
      },
      randomSpawnerAmount: { label: "Nombre d'ennemis" },
      aggroPoolAmount: {
        label: "Ennemis qui attaquent en même temps",
      },
      enemyDamageFactor: {
        label: "Dégâts des ennemis",
        description: "Hors boss. 0,25 à 5.",
      },
      enemyHealthFactor: {
        label: "Vie des ennemis",
        description: "Hors boss. 0,25 à 4.",
      },
      enemyStaminaFactor: {
        label: "Endurance des ennemis",
        description:
          "Plus elle est haute, plus ils sont longs à étourdir. 0,5 à 2.",
      },
      enemyPerceptionRangeFactor: {
        label: "Perception des ennemis",
        description: "Distance à laquelle ils voient et entendent. 0,5 à 2.",
      },
      threatBonus: {
        label: "Fréquence des attaques ennemies",
        description: "Hors boss. 0,25 à 4.",
      },
      pacifyAllEnemies: {
        label: "Ennemis pacifiques",
        description:
          "Les ennemis n'attaquent que s'ils sont attaqués (hors boss).",
      },
      tamingStartleRepercussion: {
        label: "Animal effrayé pendant l'apprivoisement",
      },
      bossDamageFactor: { label: "Dégâts des boss", description: "0,2 à 5." },
      bossHealthFactor: { label: "Vie des boss", description: "0,2 à 5." },
      dayTimeDuration: {
        label: "Durée du jour (minutes)",
        description: "De 2 à 60 minutes (30 par défaut).",
      },
      nightTimeDuration: {
        label: "Durée de la nuit (minutes)",
        description: "De 2 à 60 minutes (12 par défaut).",
      },
    },
    userGroups: {
      description:
        "Le mot de passe saisi par un joueur en rejoignant le serveur lui donne les droits de son groupe. Le serveur crée 4 groupes avec des mots de passe au hasard ; donnez à chacun le mot de passe du groupe voulu.",
      empty:
        "Aucun groupe : le serveur en créera au prochain démarrage s'il n'en trouve pas.",
      name: "Nom du groupe",
      password: "Mot de passe",
      noPassword:
        "Sans mot de passe, tout le monde peut rejoindre avec ces droits.",
      showPassword: "Afficher / masquer",
      generate: "Générer un mot de passe",
      reservedSlots: "Places réservées",
      remove: "Supprimer le groupe",
      add: "Ajouter un groupe",
      save: "Enregistrer les groupes",
      saved: "Groupes enregistrés !",
      permissions: {
        canKickBan: {
          label: "Expulser et bannir",
          description:
            "Peut expulser ou bannir définitivement d'autres joueurs.",
        },
        canAccessInventories: {
          label: "Coffres des bases",
          description:
            "Accès aux coffres, ateliers et autres rangements des bases (pas aux coffres du monde).",
        },
        canEditWorld: {
          label: "Modifier le monde",
          description:
            "Creuser et détruire hors des bases. Décoché : protège le monde des visiteurs.",
        },
        canEditBase: {
          label: "Construire dans les bases",
          description:
            "Construire, démolir, creuser et poser de l'eau dans les bases.",
        },
        canExtendBase: {
          label: "Autels de Flamme",
          description: "Poser, améliorer et retirer des autels de Flamme.",
        },
      },
    },
  },
};
