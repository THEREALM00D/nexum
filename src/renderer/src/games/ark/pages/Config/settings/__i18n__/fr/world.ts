export default {
  DayCycleSpeedScale: {
    label: "Vitesse du cycle jour/nuit",
    description: "Vitesse générale du temps en jeu.",
  },
  DayTimeSpeedScale: {
    label: "Durée du jour",
    description:
      "Vitesse du temps pendant la journée (plus bas, journées plus longues).",
  },
  NightTimeSpeedScale: {
    label: "Durée de la nuit",
    description:
      "Vitesse du temps pendant la nuit (plus bas, nuits plus longues).",
  },
  StartTimeHour: {
    label: "Heure de départ",
    description:
      "Heure du jeu au démarrage du serveur ; -1 garde l'heure sauvegardée.",
  },
  DisableWeatherFog: {
    label: "Sans brouillard",
    description: "Désactive le brouillard.",
  },
  RandomSupplyCratePoints: {
    label: "Ravitaillements aléatoires",
    description: "Les caisses tombent à des endroits aléatoires.",
  },
  ClampItemSpoilingTimes: {
    label: "Limiter le pourrissement",
    description: "Ramène la durée de conservation des objets à leur maximum.",
  },
  ClampItemStats: {
    label: "Limiter les stats des objets",
    description:
      "Active le plafond des stats d'objets (ItemStatClamps dans Game.ini).",
  },
  ExtinctionEventTimeInterval: {
    label: "Événement d'extinction",
    description:
      "Secondes avant la remise à zéro complète du monde (2592000 = 30 jours). Vide = désactivé.",
  },
  AllowTekSuitPowersInGenesis: {
    label: "Pouvoirs de la combinaison Tek (Genesis)",
    description:
      "Active les pouvoirs de la combinaison Tek sur Genesis: Part 1.",
  },
  UseAstraeosTraversalBuff: {
    label: "Téléportation de biome (Astraeos)",
    description: "Téléportation entre biomes d'Astraeos en maintenant R.",
  },
  WorldBossKingKaijuSpawnTime: {
    label: "Apparition du Roi Titan",
    description: "Heure UTC (hh:mm:ss) d'apparition du Roi Titan errant.",
  },
  OverrideSecondsUntilBuriedTreasureAutoReveals: {
    label: "Révélation des trésors enterrés",
    description: "Secondes avant qu'un trésor enterré se révèle tout seul.",
  },
  NeedsPowerToActivateAquaticCompartments: {
    label: "Compartiments aquatiques alimentés",
    description: "Les compartiments aquatiques ont besoin d'électricité.",
  },
  ElementalIslandShutdownFrequencyMultiplier: {
    label: "Arrêts de l'île élémentaire",
    description: "Fréquence des arrêts de l'île élémentaire.",
  },
  DisableBurrowDecayTimers: {
    label: "Terriers sans dégradation",
    description: "Les terriers des Burrowbucks ne se dégradent plus.",
  },
  GlobalSpoilingTimeMultiplier: {
    label: "Durée de conservation",
    description: "Temps avant qu'un objet périssable pourrisse.",
  },
  GlobalItemDecompositionTimeMultiplier: {
    label: "Durée des objets au sol",
    description: "Temps avant que les objets et sacs lâchés disparaissent.",
  },
  GlobalCorpseDecompositionTimeMultiplier: {
    label: "Durée des cadavres",
    description: "Temps avant que les cadavres disparaissent.",
  },
  UseCorpseLifeSpanMultiplier: {
    label: "Durée de vie des corps et sacs",
    description: "Modifie la durée des cadavres et des sacs lâchés.",
  },
  CropGrowthSpeedMultiplier: {
    label: "Pousse des cultures",
    description: "Plus haut, les cultures poussent plus vite.",
  },
  CropDecaySpeedMultiplier: {
    label: "Pourrissement des cultures",
    description: "Plus haut, les cultures pourrissent plus lentement.",
  },
  BaseTemperatureMultiplier: {
    label: "Température de base",
    description: "Plus bas, plus froid ; plus haut, plus chaud.",
  },
  ResourceNoReplenishRadiusPlayers: {
    label: "Rayon sans repousse autour des joueurs",
    description:
      "Au-dessus de 1, les ressources repoussent plus loin des joueurs.",
  },
  ResourceNoReplenishRadiusStructures: {
    label: "Rayon sans repousse autour des structures",
    description:
      "Au-dessus de 1, les ressources repoussent plus loin des structures.",
  },
  LimitNonPlayerDroppedItemsCount: {
    label: "Objets au sol maximum",
    description:
      "Objets lâchés permis dans le rayon ci-dessous ; 600 sur les serveurs officiels.",
  },
  LimitNonPlayerDroppedItemsRange: {
    label: "Rayon des objets au sol",
    description:
      "Rayon (unités Unreal) de la limite ci-dessus ; 1600 sur les serveurs officiels.",
  },
  FuelConsumptionIntervalMultiplier: {
    label: "Consommation de carburant",
    description: "Intervalle entre deux consommations de carburant.",
  },
  GlobalPoweredBatteryDurabilityDecreasePerSecond: {
    label: "Usure des batteries",
    description:
      "Vitesse de décharge des batteries dans les appareils électriques.",
  },
  bDisableLootCrates: {
    label: "Sans caisses de butin",
    description:
      "Les caisses de butin n'apparaissent plus (les caisses d'artefacts si).",
  },
  bDisableDefaultMapItemSets: {
    label: "Sans équipement de départ (Genesis 2)",
    description: "Pas de combinaison Tek à l'apparition sur Genesis: Part 2.",
  },
  bDisableGenesisMissions: {
    label: "Sans missions Genesis",
    description: "Désactive les missions de Genesis.",
  },
  bDisableWorldBuffs: {
    label: "Sans effets de monde",
    description: "Désactive les effets de monde de Genesis: Part 2.",
  },
  bEnableWorldBuffScaling: {
    label: "Effets de monde proportionnels",
    description: "Les effets de monde suivent les réglages du serveur.",
  },
  WorldBuffScalingEfficacy: {
    label: "Force des effets de monde",
    description: "Échelle des effets de monde (avec le réglage ci-dessus).",
  },
  ValgueroMemorialEntries: {
    label: "Noms du mémorial (Valguero)",
    description:
      "Noms gravés sur le mémorial de Valguero, séparés par des points-virgules.",
  },
};
