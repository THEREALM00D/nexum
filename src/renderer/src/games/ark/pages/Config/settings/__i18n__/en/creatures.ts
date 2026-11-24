export default {
  DinoCountMultiplier: {
    label: "Wild creature count",
    description: "How many wild creatures spawn.",
  },
  DinoDamageMultiplier: {
    label: "Wild creature damage",
    description: "Damage dealt by wild creatures.",
  },
  DinoResistanceMultiplier: {
    label: "Damage taken by wild creatures",
    description: "0.5 halves the damage wild creatures take.",
  },
  TamedDinoDamageMultiplier: {
    label: "Tamed creature damage",
    description: "Damage dealt by tamed creatures.",
  },
  TamedDinoResistanceMultiplier: {
    label: "Damage taken by tamed creatures",
    description: "0.5 halves the damage tamed creatures take.",
  },
  DinoCharacterHealthRecoveryMultiplier: {
    label: "Creature health regeneration",
    description: "How fast creatures recover health.",
  },
  DinoCharacterFoodDrainMultiplier: {
    label: "Creature hunger",
    description: "Creature food consumption; also changes taming time.",
  },
  DinoCharacterStaminaDrainMultiplier: {
    label: "Creature stamina drain",
    description: "How fast creatures use up their stamina.",
  },
  RaidDinoCharacterFoodDrainMultiplier: {
    label: "Raid creature hunger",
    description: "Food consumption of raid creatures such as the Titanosaur.",
  },
  AllowRaidDinoFeeding: {
    label: "Feed Titanosaurs",
    description: "Lets a Titanosaur be tamed permanently by feeding it.",
  },
  AllowFlyerCarryPvE: {
    label: "Flyer carry in PvE",
    description: "Flying creatures can pick up wild creatures in PvE.",
  },
  bForceCanRideFliers: {
    label: "Force flying mounts",
    description:
      "True: flyers allowed even on maps that forbid them. False: forbidden everywhere.",
  },
  MaxTamedDinos: {
    label: "Max tamed creatures (server)",
    description: "Cap on tamed creatures for the whole server.",
  },
  MaxPersonalTamedDinos: {
    label: "Max tamed creatures per tribe",
    description: "Cap per tribe; 0 turns the limit off.",
  },
  PersonalTamedDinosSaddleStructureCost: {
    label: "Platform saddle cost",
    description: "Tribe limit slots used by a platform saddle with structures.",
  },
  MaxTamedDinos_SoftTameLimit: {
    label: "Soft tame limit",
    description: 'Above it, extra creatures are marked "for cryo".',
  },
  MaxTamedDinos_SoftTameLimit_CountdownForDeletionDuration: {
    label: "Delay before deletion (soft limit)",
    description: "Seconds before creatures over the soft limit are deleted.",
  },
  DestroyTamesOverTheSoftTameLimit: {
    label: "Delete over the soft limit",
    description: "Extra creatures are deleted once the delay is over.",
  },
  DisableDinoDecayPvE: {
    label: "Disable creature decay in PvE",
    description: "Creatures don't become claimable after a long absence.",
  },
  PvEDinoDecayPeriodMultiplier: {
    label: "Creature decay period (PvE)",
    description: "Time before a neglected creature becomes claimable.",
  },
  AutoDestroyDecayedDinos: {
    label: "Delete decayed creatures",
    description: "Claimable creatures are deleted when the world loads.",
  },
  ServerAutoForceRespawnWildDinosInterval: {
    label: "Forced wild respawn",
    description:
      "Seconds after which wild creatures are recreated on restart; 0 turns it off.",
  },
  DisableImprintDinoBuff: {
    label: "No imprint bonus",
    description: "The imprinting stat bonus doesn't apply to the imprinter.",
  },
  AllowAnyoneBabyImprintCuddle: {
    label: "Anyone can cuddle",
    description: "Anyone can care for a baby, not only the imprinter.",
  },
  PreventMateBoost: {
    label: "No mate boost",
    description: "Turns off the bonus from a nearby mate.",
  },
  FreezeReaperPregnancy: {
    label: "Freeze Reaper pregnancy",
    description: "Freezes the Reaper King pregnancy timer and experience.",
  },
  ForceGachaUnhappyInCaves: {
    label: "Gacha unhappy in caves",
    description: "Gachas are unhappy inside caves.",
  },
  ArmadoggoDeathCooldown: {
    label: "Armadoggo return",
    description:
      "Seconds before the Armadoggo comes back after being knocked out.",
  },
  YoungIceFoxDeathCooldown: {
    label: "Veilwyn return",
    description:
      "Seconds before the Veilwyn comes back after being knocked out.",
  },
  CosmoWeaponAmmoReloadAmount: {
    label: "Cosmo web per reload",
    description: "Web ammo given back on each Cosmo reload.",
  },
  MaxCosmoWeaponAmmo: {
    label: "Max Cosmo web",
    description: "Maximum ammo; -1 makes it depend on the Cosmo's level.",
  },
  bAllowFlyerSpeedLeveling: {
    label: "Flyer speed",
    description:
      'Allows speed points for flyers (also needs "Level movement speed").',
  },
  bDisableDinoTaming: {
    label: "Forbid taming",
    description: "Players can no longer tame creatures.",
  },
  bDisableDinoRiding: {
    label: "Forbid riding",
    description: "Players can no longer ride tamed creatures.",
  },
  bAllowUnclaimDinos: {
    label: "Allow unclaiming",
    description: "Players can release a tamed creature.",
  },
  bUseDinoLevelUpAnimations: {
    label: "Level-up animation",
    description: "Creatures play an animation when they level up.",
  },
  bUseTameLimitForStructuresOnly: {
    label: "Limit for platforms only",
    description:
      "The tame limit only counts platforms with structures and rafts.",
  },
  DestroyTamesOverLevelClamp: {
    label: "Max creature level",
    description:
      "Creatures above this level are deleted at startup; 0 turns it off.",
  },
  PassiveTameIntervalMultiplier: {
    label: "Passive taming requests",
    description: "How often passively tamed creatures make requests.",
  },
  WildDinoCharacterFoodDrainMultiplier: {
    label: "Wild creature hunger",
    description: "Food consumption of wild creatures.",
  },
  WildDinoTorporDrainMultiplier: {
    label: "Torpor loss (wild)",
    description: "How fast a wild creature wakes up.",
  },
  TamedDinoCharacterFoodDrainMultiplier: {
    label: "Tamed creature hunger",
    description: "Food consumption of tamed creatures.",
  },
  TamedDinoTorporDrainMultiplier: {
    label: "Torpor loss (tamed)",
    description: "How fast a tamed creature wakes up.",
  },
  DinoTurretDamageMultiplier: {
    label: "Turret damage to creatures",
    description: "Damage turrets deal to creatures.",
  },
  AdjustableMutagenSpawnDelayMultiplier: {
    label: "Mutagen spawn",
    description:
      "Mutagen spawn interval (8 hours by default on a dedicated server).",
  },
};
