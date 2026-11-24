export default {
  DinoCountMultiplier: {
    label: "Nombre de créatures sauvages",
    description: "Quantité de créatures sauvages qui apparaissent.",
  },
  DinoDamageMultiplier: {
    label: "Dégâts des créatures sauvages",
    description: "Dégâts infligés par les créatures sauvages.",
  },
  DinoResistanceMultiplier: {
    label: "Dégâts reçus par les créatures sauvages",
    description:
      "0,5 divise par deux les dégâts subis par les créatures sauvages.",
  },
  TamedDinoDamageMultiplier: {
    label: "Dégâts des créatures apprivoisées",
    description: "Dégâts infligés par les créatures apprivoisées.",
  },
  TamedDinoResistanceMultiplier: {
    label: "Dégâts reçus par les créatures apprivoisées",
    description:
      "0,5 divise par deux les dégâts subis par les créatures apprivoisées.",
  },
  DinoCharacterHealthRecoveryMultiplier: {
    label: "Régénération de santé des créatures",
    description: "Vitesse de récupération de la santé des créatures.",
  },
  DinoCharacterFoodDrainMultiplier: {
    label: "Faim des créatures",
    description:
      "Consommation de nourriture des créatures ; change aussi la durée d'apprivoisement.",
  },
  DinoCharacterStaminaDrainMultiplier: {
    label: "Endurance des créatures",
    description: "Vitesse à laquelle les créatures consomment leur endurance.",
  },
  RaidDinoCharacterFoodDrainMultiplier: {
    label: "Faim des créatures de raid",
    description:
      "Consommation de nourriture des créatures de raid comme le Titanosaure.",
  },
  AllowRaidDinoFeeding: {
    label: "Nourrir les Titanosaures",
    description:
      "Permet d'apprivoiser définitivement un Titanosaure en le nourrissant.",
  },
  AllowFlyerCarryPvE: {
    label: "Transport par les volants en PvE",
    description:
      "Les créatures volantes peuvent saisir des créatures sauvages en PvE.",
  },
  bForceCanRideFliers: {
    label: "Forcer les montures volantes",
    description:
      "Vrai : volants permis même sur les cartes qui les interdisent. Faux : interdits partout.",
  },
  MaxTamedDinos: {
    label: "Créatures apprivoisées maximum (serveur)",
    description: "Plafond de créatures apprivoisées sur tout le serveur.",
  },
  MaxPersonalTamedDinos: {
    label: "Créatures apprivoisées maximum par tribu",
    description: "Plafond par tribu ; 0 désactive la limite.",
  },
  PersonalTamedDinosSaddleStructureCost: {
    label: "Coût d'une selle-plateforme",
    description:
      "Places de la limite de tribu prises par une selle-plateforme avec des structures.",
  },
  MaxTamedDinos_SoftTameLimit: {
    label: "Limite douce de créatures apprivoisées",
    description:
      "Au-delà, les créatures en trop sont marquées « à cryogéniser ».",
  },
  MaxTamedDinos_SoftTameLimit_CountdownForDeletionDuration: {
    label: "Délai avant suppression (limite douce)",
    description:
      "Secondes avant la suppression des créatures au-delà de la limite douce.",
  },
  DestroyTamesOverTheSoftTameLimit: {
    label: "Supprimer au-delà de la limite douce",
    description:
      "Les créatures en trop sont supprimées une fois le délai écoulé.",
  },
  DisableDinoDecayPvE: {
    label: "Désactiver l'abandon des créatures en PvE",
    description:
      "Les créatures ne deviennent pas réclamables après une longue absence.",
  },
  PvEDinoDecayPeriodMultiplier: {
    label: "Délai d'abandon des créatures (PvE)",
    description:
      "Durée avant qu'une créature non entretenue devienne réclamable.",
  },
  AutoDestroyDecayedDinos: {
    label: "Supprimer les créatures abandonnées",
    description:
      "Les créatures réclamables sont supprimées au chargement du monde.",
  },
  ServerAutoForceRespawnWildDinosInterval: {
    label: "Réapparition forcée des sauvages",
    description:
      "Secondes après lesquelles les créatures sauvages sont recréées au redémarrage ; 0 désactive.",
  },
  DisableImprintDinoBuff: {
    label: "Sans bonus d'imprégnation",
    description:
      "Le bonus de stats de l'imprégnation ne s'applique pas à l'imprégnateur.",
  },
  AllowAnyoneBabyImprintCuddle: {
    label: "Câlins par tout le monde",
    description:
      "N'importe qui peut s'occuper d'un bébé, pas seulement l'imprégnateur.",
  },
  PreventMateBoost: {
    label: "Sans bonus d'accouplement",
    description: "Désactive le bonus donné par un partenaire proche.",
  },
  FreezeReaperPregnancy: {
    label: "Geler la grossesse du Faucheur",
    description:
      "Fige le minuteur et l'expérience de la grossesse du Roi Faucheur.",
  },
  ForceGachaUnhappyInCaves: {
    label: "Gacha malheureux dans les grottes",
    description: "Les Gachas sont malheureux dans les grottes.",
  },
  ArmadoggoDeathCooldown: {
    label: "Retour de l'Armadoggo",
    description:
      "Secondes avant que l'Armadoggo revienne après avoir été mis K.O.",
  },
  YoungIceFoxDeathCooldown: {
    label: "Retour du Veilwyn",
    description:
      "Secondes avant que le Veilwyn revienne après avoir été mis K.O.",
  },
  CosmoWeaponAmmoReloadAmount: {
    label: "Toile du Cosmo par recharge",
    description: "Munitions de toile rendues à chaque recharge du Cosmo.",
  },
  MaxCosmoWeaponAmmo: {
    label: "Toile maximum du Cosmo",
    description: "Munitions maximum ; -1 les fait dépendre du niveau du Cosmo.",
  },
  bAllowFlyerSpeedLeveling: {
    label: "Vitesse des volants",
    description:
      "Autorise les points de vitesse pour les volants (demande aussi « Monter la vitesse de déplacement »).",
  },
  bDisableDinoTaming: {
    label: "Interdire l'apprivoisement",
    description: "Les joueurs ne peuvent plus apprivoiser de créatures.",
  },
  bDisableDinoRiding: {
    label: "Interdire de monter les créatures",
    description:
      "Les joueurs ne peuvent plus monter les créatures apprivoisées.",
  },
  bAllowUnclaimDinos: {
    label: "Autoriser l'abandon de créatures",
    description: "Les joueurs peuvent libérer une créature apprivoisée.",
  },
  bUseDinoLevelUpAnimations: {
    label: "Animation de montée de niveau",
    description: "Les créatures jouent une animation en montant de niveau.",
  },
  bUseTameLimitForStructuresOnly: {
    label: "Limite pour les plateformes seulement",
    description:
      "La limite de créatures ne compte que les plateformes avec structures et les radeaux.",
  },
  DestroyTamesOverLevelClamp: {
    label: "Niveau maximum des créatures",
    description:
      "Les créatures au-dessus de ce niveau sont supprimées au démarrage ; 0 désactive.",
  },
  PassiveTameIntervalMultiplier: {
    label: "Demandes d'apprivoisement passif",
    description:
      "Fréquence des demandes des créatures apprivoisées passivement.",
  },
  WildDinoCharacterFoodDrainMultiplier: {
    label: "Faim des créatures sauvages",
    description: "Consommation de nourriture des créatures sauvages.",
  },
  WildDinoTorporDrainMultiplier: {
    label: "Perte de torpeur (sauvages)",
    description: "Vitesse à laquelle une créature sauvage se réveille.",
  },
  TamedDinoCharacterFoodDrainMultiplier: {
    label: "Faim des créatures apprivoisées",
    description: "Consommation de nourriture des créatures apprivoisées.",
  },
  TamedDinoTorporDrainMultiplier: {
    label: "Perte de torpeur (apprivoisées)",
    description: "Vitesse à laquelle une créature apprivoisée se réveille.",
  },
  DinoTurretDamageMultiplier: {
    label: "Dégâts des tourelles sur les créatures",
    description: "Dégâts des tourelles infligés aux créatures.",
  },
  AdjustableMutagenSpawnDelayMultiplier: {
    label: "Apparition du mutagène",
    description:
      "Intervalle d'apparition du mutagène (8 heures par défaut sur un serveur dédié).",
  },
};
