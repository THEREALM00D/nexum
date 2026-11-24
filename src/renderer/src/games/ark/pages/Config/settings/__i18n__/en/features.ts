export default {
  DisableCryopodEnemyCheck: {
    label: "Cryopods near enemies",
    description: "Allows cryopods even with enemies nearby.",
  },
  DisableCryopodFridgeRequirement: {
    label: "Cryopods without a cryofridge",
    description: "Cryopods work without a powered cryofridge nearby.",
  },
  EnableCryoSicknessPVE: {
    label: "Cryo sickness in PvE",
    description:
      "Turns on the cooldown after releasing a creature from its cryopod.",
  },
  EnableCryopodNerf: {
    label: "Cryopod penalty",
    description:
      "A creature released from a cryopod is weakened for the duration below.",
  },
  CryopodNerfDuration: {
    label: "Penalty duration",
    description: "Seconds of weakness after release; 10 on official servers.",
  },
  CryopodNerfDamageMult: {
    label: "Damage during the penalty",
    description:
      "Damage dealt during the penalty (0.01 removes 99% of damage).",
  },
  CryopodNerfIncomingDamageMultPercent: {
    label: "Damage taken during the penalty",
    description: "Extra damage taken during the penalty (0.25 = 25% more).",
  },
  LimitBunkersPerTribe: {
    label: "Limit bunkers",
    description: "Limits the number of Tek bunkers per tribe.",
  },
  LimitBunkersPerTribeNum: {
    label: "Max bunkers per tribe",
    description: "Tek bunkers per tribe when the limit is on.",
  },
  MinDistanceBetweenBunkers: {
    label: "Min distance between bunkers",
    description: "Distance (Unreal units) between two bunkers.",
  },
  AllowBunkersInPreventionZones: {
    label: "Bunkers in no-build areas",
    description: "Allows bunkers in areas where building is forbidden.",
  },
  AllowBunkerModulesAboveGround: {
    label: "Bunker modules above ground",
    description: "Allows building modules above ground.",
  },
  AllowBunkerModulesInPreventionZones: {
    label: "Bunker modules in no-build areas",
    description: "Allows modules in areas where building is forbidden.",
  },
  AllowRidingDinosInsideBunkers: {
    label: "Mounts in bunkers",
    description: "Ridden creatures can enter bunkers.",
  },
  AllowDinoAIInsideBunkers: {
    label: "Creature AI in bunkers",
    description: "Creatures stay active inside bunkers.",
  },
  EnemyAccessBunkerHPThreshold: {
    label: "Enemy access threshold",
    description: "Bunker health fraction below which enemies can get in.",
  },
  BunkerUnderHPThresholdDmgMultiplier: {
    label: "Damage below the threshold",
    description: "Damage taken by a bunker below the health threshold.",
  },
  CryoHospitalHoursToRegenHP: {
    label: "Hospital: health",
    description: "Hours for a creature in the cryo hospital to recover health.",
  },
  CryoHospitalHoursToRegenFood: {
    label: "Hospital: food",
    description: "Hours for a creature in the cryo hospital to recover food.",
  },
  CryoHospitalHoursToDrainTorpor: {
    label: "Hospital: torpor",
    description:
      "Hours for a creature in the cryo hospital to lose its torpor.",
  },
  CryoHospitalMatingCooldownReduction: {
    label: "Hospital: mating cooldown",
    description: "Mating cooldown reduction in the cryo hospital.",
  },
  BloodforgeReinforceExtraDurability: {
    label: "Bloodforge: durability",
    description: "Durability added by Bloodforge reinforcement.",
  },
  BloodforgeReinforceResourceCostMultiplier: {
    label: "Bloodforge: cost",
    description: "Resource cost of reinforcement.",
  },
  BloodforgeReinforceSpeedMultiplier: {
    label: "Bloodforge: speed",
    description: "Speed of reinforcement.",
  },
  MaxActiveOutposts: {
    label: "Max active outposts",
    description: "Outposts active at the same time.",
  },
  MaxActiveResourceCaches: {
    label: "Max active resource caches",
    description: "Resource caches active at the same time.",
  },
  MaxActiveCityOutposts: {
    label: "Max active city outposts",
    description: "City outposts active at the same time.",
  },
  OutpostSigilRewardMultiplier: {
    label: "Sigil reward",
    description: "Sigils earned from outpost missions.",
  },
};
