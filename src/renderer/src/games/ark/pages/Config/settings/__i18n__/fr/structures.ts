export default {
  TheMaxStructuresInRange: {
    label: "Structures maximum dans une zone",
    description: "Nombre de structures permises dans un rayon fixe.",
  },
  IgnoreLimitMaxStructuresInRangeTypeFlag: {
    label: "Sans limite de décorations",
    description:
      "Supprime la limite de 150 structures décoratives (drapeaux, panneaux…).",
  },
  MaxStructuresInSmallRadius: {
    label: "Structures maximum autour du joueur",
    description:
      "Limite dans le petit rayon ci-dessous ; les serveurs officiels utilisent 40.",
  },
  RadiusStructuresInSmallRadius: {
    label: "Petit rayon des structures",
    description:
      "Rayon (unités Unreal) de la limite ci-dessus ; 225 sur les serveurs officiels.",
  },
  MaxStructuresToProcess: {
    label: "Structures traitées par tick",
    description: "0 traite toutes les structures à chaque tick du serveur.",
  },
  StructureDamageMultiplier: {
    label: "Dégâts des structures",
    description: "Dégâts infligés par les structures (murs à pointes…).",
  },
  StructureResistanceMultiplier: {
    label: "Dégâts reçus par les structures",
    description: "0,5 divise par deux les dégâts subis par les structures.",
  },
  AlwaysAllowStructurePickup: {
    label: "Ramassage rapide toujours permis",
    description: "Supprime le délai de ramassage rapide des structures.",
  },
  StructurePickupHoldDuration: {
    label: "Durée d'appui pour ramasser",
    description:
      "Secondes d'appui pour le ramassage rapide ; 0 est instantané.",
  },
  StructurePickupTimeAfterPlacement: {
    label: "Délai de ramassage après pose",
    description:
      "Secondes pendant lesquelles une structure posée peut être ramassée rapidement.",
  },
  StructurePreventResourceRadiusMultiplier: {
    label: "Rayon sans ressources autour des structures",
    description:
      "Distance autour des structures où les ressources ne repoussent pas.",
  },
  EnableExtraStructurePreventionVolumes: {
    label: "Zones interdites supplémentaires",
    description:
      "Interdit la construction dans certaines zones riches en ressources.",
  },
  ForceAllStructureLocking: {
    label: "Verrouiller toutes les structures",
    description: "Toutes les structures sont verrouillées par défaut.",
  },
  AllowCaveBuildingPvE: {
    label: "Construire dans les grottes (PvE)",
    description: "Autorise la construction dans les grottes en PvE.",
  },
  AllowCaveBuildingPvP: {
    label: "Construire dans les grottes (PvP)",
    description: "Faux interdit la construction dans les grottes en PvP.",
  },
  PvEAllowStructuresAtSupplyDrops: {
    label: "Construire près des ravitaillements (PvE)",
    description: "Autorise la construction près des points de largage en PvE.",
  },
  AllowCrateSpawnsOnTopOfStructures: {
    label: "Caisses sur les structures",
    description:
      "Les caisses de ravitaillement peuvent tomber sur des structures.",
  },
  MaxPlatformSaddleStructureLimit: {
    label: "Selles-plateformes maximum",
    description:
      "Nombre de selles-plateformes et de radeaux sur tout le serveur.",
  },
  PerPlatformMaxStructuresMultiplier: {
    label: "Structures par plateforme",
    description:
      "Multiplie le nombre de structures posables sur une selle ou un radeau.",
  },
  PlatformSaddleBuildAreaBoundsMultiplier: {
    label: "Zone de construction des plateformes",
    description:
      "Distance jusqu'à laquelle on peut construire autour d'une plateforme.",
  },
  OverrideStructurePlatformPrevention: {
    label: "Tourelles sur les plateformes",
    description:
      "Autorise tourelles et structures à pointes sur les selles-plateformes.",
  },
  AllowCryoFridgeOnSaddle: {
    label: "Cryo-frigo sur les selles",
    description:
      "Autorise les cryo-frigos sur les selles-plateformes et les radeaux.",
  },
  MaxGateFrameOnSaddles: {
    label: "Portails sur les selles",
    description: "Nombre de portails par selle-plateforme ; 0 les interdit.",
  },
  AllowMultipleAttachedC4: {
    label: "Plusieurs C4 par créature",
    description: "Autorise plusieurs C4 collés sur une même créature.",
  },
  DestroyUnconnectedWaterPipes: {
    label: "Détruire les tuyaux isolés",
    description: "Les tuyaux non reliés sont détruits après deux jours réels.",
  },
  MaxTrainCars: {
    label: "Wagons maximum par train",
    description: "Nombre de wagons d'un train.",
  },
  DisableStructureDecayPvE: {
    label: "Désactiver la dégradation des structures (PvE)",
    description: "Les structures abandonnées ne se dégradent plus.",
  },
  PvEStructureDecayPeriodMultiplier: {
    label: "Délai de dégradation des structures",
    description:
      "Durée avant qu'une structure abandonnée se dégrade (PvE et PvP si activée).",
  },
  AutoDestroyOldStructuresMultiplier: {
    label: "Destruction auto des vieilles structures",
    description:
      "Délai avant destruction des structures abandonnées. Demande l'option de lancement -AutoDestroyStructures.",
  },
  OnlyAutoDestroyCoreStructures: {
    label: "Détruire seulement les structures de base",
    description:
      "Seules les fondations, murs, etc. sont détruits automatiquement.",
  },
  OnlyDecayUnsnappedCoreStructures: {
    label: "Dégrader seulement les structures isolées",
    description: "Seules les structures de base non reliées se dégradent.",
  },
  FastDecayUnsnappedCoreStructures: {
    label: "Dégradation rapide des structures isolées",
    description:
      "Les structures de base non reliées se dégradent après l'intervalle rapide (Game.ini).",
  },
  bDisableStructurePlacementCollision: {
    label: "Sans collision à la pose",
    description: "Les structures peuvent traverser le terrain.",
  },
  bIgnoreStructuresPreventionVolumes: {
    label: "Ignorer les zones interdites",
    description:
      "Autorise la construction dans les zones protégées (obélisques, portails…).",
  },
  bGenesisUseStructuresPreventionVolumes: {
    label: "Zones de missions protégées (Genesis)",
    description:
      "Interdit la construction dans les zones de missions de Genesis: Part 1.",
  },
  bAllowPlatformSaddleMultiFloors: {
    label: "Plateformes à plusieurs étages",
    description: "Autorise plusieurs étages sur une selle-plateforme.",
  },
  bFlyerPlatformAllowUnalignedDinoBasing: {
    label: "Créatures neutres sur les plateformes volantes",
    description:
      "Une plateforme de Quetzal en vol accepte des créatures non alliées.",
  },
  bPassiveDefensesDamageRiderlessDinos: {
    label: "Défenses contre les créatures sans cavalier",
    description:
      "Les murs à pointes blessent les créatures sauvages ou sans cavalier.",
  },
  StructureDamageRepairCooldown: {
    label: "Délai avant réparation",
    description:
      "Secondes après des dégâts avant de pouvoir réparer ; 0 désactive.",
  },
  PvPZoneStructureDamageMultiplier: {
    label: "Dégâts aux structures en zone PvP",
    description:
      "Dégâts reçus par les structures dans les zones PvP (grottes…).",
  },
  FastDecayInterval: {
    label: "Intervalle de dégradation rapide",
    description: "Secondes avant la dégradation rapide des structures isolées.",
  },
  bLimitTurretsInRange: {
    label: "Limiter les tourelles",
    description: "Limite le nombre de tourelles dans une zone.",
  },
  bHardLimitTurretsInRange: {
    label: "Limite stricte des tourelles",
    description: "Applique la limite aux tourelles déjà posées.",
  },
  LimitTurretsNum: {
    label: "Tourelles maximum",
    description: "Nombre de tourelles dans la zone ci-dessous.",
  },
  LimitTurretsRange: {
    label: "Zone des tourelles",
    description: "Rayon (unités Unreal) compté pour la limite de tourelles.",
  },
  LimitGeneratorsNum: {
    label: "Générateurs maximum",
    description: "Nombre de générateurs dans la zone ci-dessous.",
  },
  LimitGeneratorsRange: {
    label: "Zone des générateurs",
    description: "Rayon (unités Unreal) compté pour la limite de générateurs.",
  },
};
