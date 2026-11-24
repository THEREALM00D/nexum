export default {
  DisableCryopodEnemyCheck: {
    label: "Cryopods près des ennemis",
    description: "Autorise les cryopods même avec des ennemis à proximité.",
  },
  DisableCryopodFridgeRequirement: {
    label: "Cryopods sans cryo-frigo",
    description:
      "Les cryopods fonctionnent sans cryo-frigo alimenté à proximité.",
  },
  EnableCryoSicknessPVE: {
    label: "Mal de cryo en PvE",
    description:
      "Active le temps de récupération après la sortie d'une créature de son cryopod.",
  },
  EnableCryopodNerf: {
    label: "Pénalité de cryopod",
    description:
      "Une créature sortie d'un cryopod est affaiblie pendant la durée ci-dessous.",
  },
  CryopodNerfDuration: {
    label: "Durée de la pénalité",
    description:
      "Secondes d'affaiblissement après la sortie du cryopod ; 10 sur les serveurs officiels.",
  },
  CryopodNerfDamageMult: {
    label: "Dégâts pendant la pénalité",
    description:
      "Dégâts infligés pendant la pénalité (0,01 retire 99 % des dégâts).",
  },
  CryopodNerfIncomingDamageMultPercent: {
    label: "Dégâts reçus pendant la pénalité",
    description:
      "Dégâts subis en plus pendant la pénalité (0,25 = 25 % de plus).",
  },
  LimitBunkersPerTribe: {
    label: "Limiter les bunkers",
    description: "Limite le nombre de bunkers Tek par tribu.",
  },
  LimitBunkersPerTribeNum: {
    label: "Bunkers maximum par tribu",
    description: "Nombre de bunkers Tek par tribu quand la limite est active.",
  },
  MinDistanceBetweenBunkers: {
    label: "Distance minimum entre bunkers",
    description: "Distance (unités Unreal) entre deux bunkers.",
  },
  AllowBunkersInPreventionZones: {
    label: "Bunkers en zone interdite",
    description:
      "Autorise les bunkers dans les zones où la construction est interdite.",
  },
  AllowBunkerModulesAboveGround: {
    label: "Modules de bunker en surface",
    description: "Autorise la construction de modules au-dessus du sol.",
  },
  AllowBunkerModulesInPreventionZones: {
    label: "Modules de bunker en zone interdite",
    description:
      "Autorise les modules dans les zones où la construction est interdite.",
  },
  AllowRidingDinosInsideBunkers: {
    label: "Montures dans les bunkers",
    description: "Les créatures montées peuvent entrer dans les bunkers.",
  },
  AllowDinoAIInsideBunkers: {
    label: "IA des créatures dans les bunkers",
    description: "Les créatures restent actives dans les bunkers.",
  },
  EnemyAccessBunkerHPThreshold: {
    label: "Seuil d'accès ennemi",
    description:
      "Fraction de santé du bunker en dessous de laquelle les ennemis peuvent y entrer.",
  },
  BunkerUnderHPThresholdDmgMultiplier: {
    label: "Dégâts sous le seuil",
    description: "Dégâts reçus par un bunker sous le seuil de santé.",
  },
  CryoHospitalHoursToRegenHP: {
    label: "Hôpital : santé",
    description:
      "Heures pour qu'une créature de l'hôpital cryo récupère sa santé.",
  },
  CryoHospitalHoursToRegenFood: {
    label: "Hôpital : nourriture",
    description:
      "Heures pour qu'une créature de l'hôpital cryo récupère sa nourriture.",
  },
  CryoHospitalHoursToDrainTorpor: {
    label: "Hôpital : torpeur",
    description:
      "Heures pour qu'une créature de l'hôpital cryo élimine sa torpeur.",
  },
  CryoHospitalMatingCooldownReduction: {
    label: "Hôpital : délai d'accouplement",
    description: "Réduction du délai d'accouplement à l'hôpital cryo.",
  },
  BloodforgeReinforceExtraDurability: {
    label: "Bloodforge : durabilité",
    description: "Durabilité ajoutée par le renforcement à la Bloodforge.",
  },
  BloodforgeReinforceResourceCostMultiplier: {
    label: "Bloodforge : coût",
    description: "Coût en ressources du renforcement.",
  },
  BloodforgeReinforceSpeedMultiplier: {
    label: "Bloodforge : vitesse",
    description: "Vitesse du renforcement.",
  },
  MaxActiveOutposts: {
    label: "Avant-postes actifs maximum",
    description: "Nombre d'avant-postes actifs en même temps.",
  },
  MaxActiveResourceCaches: {
    label: "Caches de ressources actives maximum",
    description: "Nombre de caches de ressources actives en même temps.",
  },
  MaxActiveCityOutposts: {
    label: "Avant-postes de ville actifs maximum",
    description: "Nombre d'avant-postes de ville actifs en même temps.",
  },
  OutpostSigilRewardMultiplier: {
    label: "Récompense en sceaux",
    description: "Sceaux gagnés dans les missions d'avant-poste.",
  },
};
