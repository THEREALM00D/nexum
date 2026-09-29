export default {
  config: {
    title: "Configuration",
    subtitle: "PalWorldSettings.ini",
    search: "Rechercher un paramètre...",
    searchClear: "Effacer la recherche",
    noResults: "Aucun paramètre ne correspond à « {{query}} ».",
    openFolder: "Ouvrir le dossier de config",
    expandAll: "Tout déplier",
    collapseAll: "Tout replier",
    save: "Sauvegarder la configuration",
    saved: "Sauvegardé !",
    unknownError: "Erreur inconnue",
    loadFailed: "Impossible de charger la configuration",
    noServerPath: "Configurez le chemin serveur dans Installation.",
    groups: {
      server: "Serveur",
      rcon: "RCON",
      restapi: "REST API",
      security: "Sécurité / Auth",
      time: "Temps & Vitesse",
      xp: "XP & Collecte",
      palMechanics: "Mécaniques Pal",
      playerStats: "Statistiques joueur",
      statPoints: "Points de statistiques",
      building: "Constructions",
      items: "Objets & Équipement",
      death: "Mort & Pénalités",
      guild: "Guilde",
      pvp: "PvP",
      gameplay: "Gameplay",
      randomizer: "Randomiseur",
      supplyChat: "Ravitaillement & Chat",
      perfLogs: "Performance & Logs",
    },
    difficulty: {
      none: "Personnalisé",
      casual: "Casual",
      normal: "Normal",
      hard: "Difficile",
    },
    deathPenalty: {
      none: "Aucune",
      item: "Objets",
      itemAndEquipment: "Objets + équipement",
      all: "Tout",
    },
    fields: {
      ServerName: {
        label: "Nom du serveur",
        description: "Nom affiché dans la liste des serveurs communautaires.",
      },
      ServerDescription: {
        label: "Description",
        description:
          "Description courte affichée sous le nom du serveur dans la liste.",
      },
      PublicIP: {
        label: "IP publique",
        description:
          "IP publique annoncée aux clients. Laisser vide pour détection automatique.",
      },
      PublicPort: {
        label: "Port public",
        description: "Port UDP utilisé par les joueurs (défaut 8211).",
      },
      ServerPlayerMaxNum: {
        label: "Joueurs max",
        description:
          "Nombre maximum de joueurs simultanés sur le serveur (limite recommandée : 32).",
      },
      CoopPlayerMaxNum: {
        label: "Joueurs coop max",
        description:
          "Nombre max de joueurs en session coopérative hébergée (4 par défaut). Sans effet sur un serveur dédié.",
      },
      ServerPassword: {
        label: "Mot de passe serveur",
        description:
          "Mot de passe requis pour rejoindre. Laisser vide pour un serveur public.",
      },
      AdminPassword: {
        label: "Mot de passe admin",
        description:
          "Mot de passe administrateur (commandes de modération et REST API).",
      },
      Region: {
        label: "Région",
        description:
          "Code régional affiché dans la liste des serveurs (ex : EU, NA, AS).",
      },
      RCONEnabled: {
        label: "Activer RCON",
        description:
          "Active le protocole RCON standard pour l'administration à distance.",
      },
      RCONPort: {
        label: "Port RCON",
        description: "Port TCP utilisé par RCON (défaut 25575).",
      },
      RESTAPIEnabled: {
        label: "Activer REST API",
        description:
          "Active l'API REST officielle (requise pour les redémarrages planifiés gracieux et les commandes admin de Nexum).",
      },
      RESTAPIPort: {
        label: "Port REST API",
        description: "Port HTTP de l'API REST (défaut 8212, local uniquement).",
      },
      bUseAuth: {
        label: "Authentification requise",
        description:
          "Exige l'authentification Steam des joueurs. Désactiver augmente les risques de triche.",
      },
      BanListURL: {
        label: "URL liste de bans",
        description:
          "URL d'une liste de bans partagée récupérée au démarrage du serveur.",
      },
      CrossplayPlatforms: {
        label: "Plateformes crossplay",
        description:
          "Plateformes autorisées (Steam, Xbox, etc.). Format tableau : (Steam,Xbox,Unknown,PS5,Mac).",
      },
      bAllowClientMod: {
        label: "Autoriser mods client",
        description: "Autorise les clients utilisant des mods à se connecter.",
      },
      DayTimeSpeedRate: {
        label: "Vitesse journée",
        description:
          "Multiplicateur de vitesse du temps pendant la journée (1.0 = normal, 0.5 = 2× plus lent).",
      },
      NightTimeSpeedRate: {
        label: "Vitesse nuit",
        description:
          "Multiplicateur de vitesse du temps pendant la nuit (1.0 = normal).",
      },
      ExpRate: {
        label: "Taux d'XP",
        description:
          "Multiplicateur de l'expérience gagnée par les joueurs et les Pals.",
      },
      CollectionDropRate: {
        label: "Taux de collecte",
        description:
          "Multiplicateur de la quantité d'objets obtenue en récoltant (arbres, rochers, etc.).",
      },
      CollectionObjectHpRate: {
        label: "HP objets collectables",
        description:
          "Multiplicateur des PV des objets collectables (plus bas = récolte plus rapide).",
      },
      CollectionObjectRespawnSpeedRate: {
        label: "Respawn objets collectables",
        description:
          "Vitesse de réapparition des ressources. Plus bas = réapparition plus rapide.",
      },
      EnemyDropItemRate: {
        label: "Drop ennemi",
        description:
          "Multiplicateur des objets lâchés par les ennemis à leur mort.",
      },
      PalCaptureRate: {
        label: "Taux de capture Pal",
        description:
          "Multiplicateur du taux de réussite de capture avec les Pal Spheres.",
      },
      PalSpawnNumRate: {
        label: "Taux de spawn Pal",
        description:
          "Multiplicateur du nombre de Pals générés dans le monde (densité).",
      },
      PalDamageRateAttack: {
        label: "Dégâts Pal (attaque)",
        description: "Multiplicateur des dégâts infligés par les Pals.",
      },
      PalDamageRateDefense: {
        label: "Dégâts Pal (défense)",
        description:
          "Multiplicateur des dégâts reçus par les Pals (plus bas = Pals plus résistants).",
      },
      PalStomachDecreaceRate: {
        label: "Faim Pal",
        description:
          "Vitesse à laquelle la faim des Pals diminue. Plus bas = ils mangent moins souvent.",
      },
      PalStaminaDecreaceRate: {
        label: "Stamina Pal",
        description: "Vitesse à laquelle l'endurance des Pals diminue.",
      },
      PalAutoHPRegeneRate: {
        label: "Régén HP Pal",
        description: "Vitesse de régénération naturelle des PV des Pals.",
      },
      PalAutoHpRegeneRateInSleep: {
        label: "Régén HP Pal (sommeil)",
        description:
          "Vitesse de régénération des PV des Pals pendant le sommeil.",
      },
      PalEggDefaultHatchingTime: {
        label: "Temps d'éclosion (h)",
        description:
          "Durée de base avant l'éclosion d'un œuf de Pal, en heures réelles.",
      },
      bPalLost: {
        label: "Perte Pal à la mort",
        description:
          "Si activé, les Pals actifs peuvent être perdus définitivement à leur mort.",
      },
      PlayerDamageRateAttack: {
        label: "Dégâts joueur (attaque)",
        description: "Multiplicateur des dégâts infligés par les joueurs.",
      },
      PlayerDamageRateDefense: {
        label: "Dégâts joueur (défense)",
        description:
          "Multiplicateur des dégâts reçus par les joueurs (plus bas = plus résistant).",
      },
      PlayerStomachDecreaceRate: {
        label: "Faim joueur",
        description: "Vitesse à laquelle la faim du joueur diminue.",
      },
      PlayerStaminaDecreaceRate: {
        label: "Stamina joueur",
        description: "Vitesse à laquelle l'endurance du joueur diminue.",
      },
      PlayerAutoHPRegeneRate: {
        label: "Régén HP joueur",
        description: "Vitesse de régénération automatique des PV du joueur.",
      },
      PlayerAutoHpRegeneRateInSleep: {
        label: "Régén HP joueur (sommeil)",
        description:
          "Vitesse de régénération des PV du joueur pendant le sommeil.",
      },
      bAllowEnhanceStat_Attack: {
        label: "Amélioration Attaque",
        description:
          "Autorise l'investissement de points de stat dans l'attaque.",
      },
      bAllowEnhanceStat_Health: {
        label: "Amélioration Santé",
        description: "Autorise l'investissement de points dans les PV.",
      },
      bAllowEnhanceStat_Stamina: {
        label: "Amélioration Endurance",
        description: "Autorise l'investissement de points dans l'endurance.",
      },
      bAllowEnhanceStat_Weight: {
        label: "Amélioration Poids",
        description:
          "Autorise l'investissement de points dans la capacité de transport.",
      },
      bAllowEnhanceStat_WorkSpeed: {
        label: "Amélioration Vitesse travail",
        description:
          "Autorise l'investissement de points dans la vitesse de travail.",
      },
      BuildObjectDamageRate: {
        label: "Dégâts aux constructions",
        description:
          "Multiplicateur des dégâts infligés aux constructions des joueurs.",
      },
      BuildObjectDeteriorationDamageRate: {
        label: "Détérioration constructions",
        description:
          "Vitesse de dégradation naturelle des constructions. 0 = pas de décrépitude.",
      },
      BaseCampMaxNum: {
        label: "Camps de base max",
        description: "Nombre maximum total de camps de base sur le serveur.",
      },
      BaseCampWorkerMaxNum: {
        label: "Travailleurs camp max",
        description: "Nombre maximum de Pals assignés par camp (défaut 15).",
      },
      BaseCampMaxNumInGuild: {
        label: "Camps max par guilde",
        description:
          "Nombre maximum de camps qu'une même guilde peut posséder.",
      },
      MaxBuildingLimitNum: {
        label: "Bâtiments max (0 = illimité)",
        description:
          "Limite du nombre de bâtiments par zone. 0 désactive la limite.",
      },
      bBuildAreaLimit: {
        label: "Limiter zone de construction",
        description:
          "Restreint la construction à la zone du camp de base uniquement.",
      },
      WorkSpeedRate: {
        label: "Vitesse de travail",
        description:
          "Multiplicateur de la vitesse de travail des joueurs et Pals.",
      },
      DropItemMaxNum: {
        label: "Objets au sol max",
        description: "Nombre maximum d'objets lâchés au sol simultanément.",
      },
      DropItemAliveMaxHours: {
        label: "Durée de vie objets au sol (h)",
        description:
          "Durée avant la disparition automatique d'un objet au sol, en heures.",
      },
      EquipmentDurabilityDamageRate: {
        label: "Dégâts durabilité équipement",
        description:
          "Vitesse de dégradation de l'équipement à l'usage. 0 = indestructible.",
      },
      ItemWeightRate: {
        label: "Poids des objets",
        description:
          "Multiplicateur du poids des objets. Plus bas = inventaire plus léger.",
      },
      ItemCorruptionMultiplier: {
        label: "Multiplicateur corruption",
        description: "Multiplicateur de la corruption des objets périssables.",
      },
      DeathPenalty: {
        label: "Pénalité de mort",
        description:
          "Ce qui est perdu à la mort du joueur : rien, objets du sac, +équipement, ou tout (sac + équipement + matériaux).",
      },
      BlockRespawnTime: {
        label: "Temps de blocage respawn",
        description:
          "Durée minimum avant de pouvoir réapparaître après la mort (en secondes).",
      },
      RespawnPenaltyDurationThreshold: {
        label: "Seuil durée pénalité respawn",
        description:
          "Seuil de session active au-delà duquel la pénalité de respawn s'applique.",
      },
      RespawnPenaltyTimeScale: {
        label: "Échelle temps pénalité respawn",
        description:
          "Multiplicateur de la pénalité de temps de respawn après une mort.",
      },
      GuildPlayerMaxNum: {
        label: "Membres guilde max",
        description: "Nombre maximum de joueurs par guilde (défaut 20).",
      },
      GuildRejoinCooldownMinutes: {
        label: "Délai rejoin guilde (min)",
        description:
          "Temps d'attente avant de pouvoir rejoindre une guilde après l'avoir quittée.",
      },
      bAutoResetGuildNoOnlinePlayers: {
        label: "Reset guilde si inactif",
        description:
          "Réinitialise automatiquement les guildes dont aucun joueur ne se connecte pendant le délai configuré.",
      },
      AutoResetGuildTimeNoOnlinePlayers: {
        label: "Délai reset guilde (h)",
        description:
          "Délai d'inactivité (heures) avant reset automatique de la guilde.",
      },
      bIsPvP: {
        label: "PvP activé",
        description: "Active le mode PvP général sur le serveur.",
      },
      bEnablePlayerToPlayerDamage: {
        label: "Dégâts joueur → joueur",
        description:
          "Autorise les dégâts entre joueurs (requis pour un vrai PvP).",
      },
      bEnableFriendlyFire: {
        label: "Tir allié",
        description: "Autorise les dégâts entre membres de la même guilde.",
      },
      bCanPickupOtherGuildDeathPenaltyDrop: {
        label: "Ramasser drop mort guilde adverse",
        description:
          "Permet de ramasser les objets lâchés à la mort par les joueurs d'une autre guilde.",
      },
      bAdditionalDropItemWhenPlayerKillingInPvPMode: {
        label: "Drop extra en PvP",
        description:
          "Ajoute des objets supplémentaires au drop lors d'une mise à mort en PvP.",
      },
      AdditionalDropItemNumWhenPlayerKillingInPvPMode: {
        label: "Nb objets drop PvP",
        description:
          "Quantité d'objets supplémentaires lâchés lors d'un kill PvP.",
      },
      AdditionalDropItemWhenPlayerKillingInPvPMode: {
        label: "Objet drop PvP (ID)",
        description:
          "ID de l'objet supplémentaire lâché à chaque kill PvP (laisser vide pour aléatoire).",
      },
      bEnableDefenseOtherGuildPlayer: {
        label: "Défense joueur guilde adverse",
        description:
          "Permet aux constructions défensives (tourelles) de cibler les joueurs d'autres guildes.",
      },
      bDisplayPvPItemNumOnWorldMap_Player: {
        label: "Afficher items PvP carte (joueur)",
        description:
          "Affiche sur la carte la position des sacs de mort PvP des joueurs.",
      },
      bDisplayPvPItemNumOnWorldMap_BaseCamp: {
        label: "Afficher items PvP carte (camp)",
        description:
          "Affiche sur la carte le pillage disponible dans les camps ennemis.",
      },
      Difficulty: {
        label: "Difficulté",
        description:
          "Préréglage global de difficulté. Choisir « Personnalisé » pour conserver les valeurs individuelles.",
      },
      bIsMultiplay: {
        label: "Multijoueur",
        description: "Marque la session comme multijoueur.",
      },
      bHardcore: {
        label: "Mode Hardcore",
        description:
          "Active le mode Hardcore (conséquences accrues à la mort).",
      },
      bCharacterRecreateInHardcore: {
        label: "Recréer perso en Hardcore",
        description:
          "Force la création d'un nouveau personnage après une mort en Hardcore.",
      },
      bEnableFastTravel: {
        label: "Voyage rapide",
        description:
          "Autorise le voyage rapide via les Pyramides et points d'intérêt.",
      },
      bEnableFastTravelOnlyBaseCamp: {
        label: "Voyage rapide — camp seulement",
        description:
          "Restreint le voyage rapide aux seuls camps de base du joueur.",
      },
      bIsStartLocationSelectByMap: {
        label: "Choix spawn par carte",
        description:
          "Permet au joueur de choisir son point de départ sur la carte.",
      },
      bExistPlayerAfterLogout: {
        label: "Corps présent après déconnexion",
        description:
          "Le personnage reste physiquement présent dans le monde après déconnexion (vulnérable).",
      },
      bEnableInvaderEnemy: {
        label: "Ennemis envahisseurs",
        description:
          "Active les raids ennemis qui attaquent les camps de base.",
      },
      bEnableNonLoginPenalty: {
        label: "Pénalité déconnexion",
        description:
          "Applique des pénalités aux joueurs ne se connectant pas régulièrement.",
      },
      bEnableAimAssistPad: {
        label: "Aide visée manette",
        description: "Active l'aide à la visée pour les joueurs à la manette.",
      },
      bEnableAimAssistKeyboard: {
        label: "Aide visée clavier",
        description:
          "Active l'aide à la visée pour les joueurs clavier/souris.",
      },
      bIsShowJoinLeftMessage: {
        label: "Message connexion/déconnexion",
        description:
          "Affiche un message in-game quand un joueur rejoint ou quitte.",
      },
      bShowPlayerList: {
        label: "Afficher liste joueurs",
        description: "Rend la liste des joueurs connectés visible en jeu.",
      },
      bIsUseBackupSaveData: {
        label: "Sauvegarde backup",
        description: "Active les sauvegardes de secours automatiques côté jeu.",
      },
      bAllowGlobalPalboxExport: {
        label: "Export Palbox global",
        description:
          "Autorise l'export de Pals hors du serveur (vers un autre monde).",
      },
      bAllowGlobalPalboxImport: {
        label: "Import Palbox global",
        description: "Autorise l'import de Pals venant d'un autre monde.",
      },
      bInvisibleOtherGuildBaseCampAreaFX: {
        label: "Masquer zone camp guilde adverse",
        description:
          "Masque visuellement la zone de construction des camps d'autres guildes.",
      },
      bActiveUNKO: {
        label: "Activer UNKO",
        description:
          "Active la mécanique UNKO (excréments des Pals, nécessaire pour certaines recettes).",
      },
      DenyTechnologyList: {
        label: "Technologies interdites",
        description:
          "Liste d'IDs de technologies interdites (séparés par des virgules).",
      },
      RandomizerType: {
        label: "Type de randomiseur",
        description:
          "Type de randomisation des Pals dans le monde (None, Region, All, etc.).",
      },
      RandomizerSeed: {
        label: "Graine",
        description:
          "Graine du randomiseur (même graine = mêmes résultats). 0 = aléatoire.",
      },
      bIsRandomizerPalLevelRandom: {
        label: "Niveau Pal aléatoire",
        description:
          "Randomise également le niveau des Pals en plus de leur espèce.",
      },
      SupplyDropSpan: {
        label: "Intervalle ravitaillement (min)",
        description:
          "Intervalle en minutes entre chaque largage de ravitaillement aérien.",
      },
      ChatPostLimitPerMinute: {
        label: "Messages chat/min max",
        description:
          "Nombre maximum de messages qu'un joueur peut envoyer par minute (anti-spam).",
      },
      ServerReplicatePawnCullDistance: {
        label: "Distance culling serveur",
        description:
          "Distance au-delà de laquelle le serveur arrête de répliquer les Pals aux clients. Plus bas = moins de charge réseau.",
      },
      LogFormatType: {
        label: "Format des logs",
        description: "Format des logs serveur (text ou json).",
      },
    },
  },
};
