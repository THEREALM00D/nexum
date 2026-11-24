export default {
  TheMaxStructuresInRange: {
    label: "Max structures in an area",
    description: "Number of structures allowed within a fixed radius.",
  },
  IgnoreLimitMaxStructuresInRangeTypeFlag: {
    label: "No decoration limit",
    description:
      "Removes the limit of 150 decorative structures (flags, signs…).",
  },
  MaxStructuresInSmallRadius: {
    label: "Max structures around the player",
    description:
      "Limit within the small radius below; official servers use 40.",
  },
  RadiusStructuresInSmallRadius: {
    label: "Small structure radius",
    description:
      "Radius (Unreal units) of the limit above; 225 on official servers.",
  },
  MaxStructuresToProcess: {
    label: "Structures processed per tick",
    description: "0 processes every structure on each server tick.",
  },
  StructureDamageMultiplier: {
    label: "Structure damage",
    description: "Damage dealt by structures (spike walls…).",
  },
  StructureResistanceMultiplier: {
    label: "Damage taken by structures",
    description: "0.5 halves the damage structures take.",
  },
  AlwaysAllowStructurePickup: {
    label: "Quick pickup always allowed",
    description: "Removes the quick pickup time limit of structures.",
  },
  StructurePickupHoldDuration: {
    label: "Pickup hold time",
    description: "Seconds to hold for quick pickup; 0 is instant.",
  },
  StructurePickupTimeAfterPlacement: {
    label: "Pickup window after placing",
    description:
      "Seconds during which a placed structure can be quickly picked up.",
  },
  StructurePreventResourceRadiusMultiplier: {
    label: "No-resource radius around structures",
    description: "Distance around structures where resources don't grow back.",
  },
  EnableExtraStructurePreventionVolumes: {
    label: "Extra no-build areas",
    description: "Forbids building in some resource-rich areas.",
  },
  ForceAllStructureLocking: {
    label: "Lock all structures",
    description: "All structures are locked by default.",
  },
  AllowCaveBuildingPvE: {
    label: "Build in caves (PvE)",
    description: "Allows building in caves in PvE.",
  },
  AllowCaveBuildingPvP: {
    label: "Build in caves (PvP)",
    description: "False forbids building in caves in PvP.",
  },
  PvEAllowStructuresAtSupplyDrops: {
    label: "Build near supply drops (PvE)",
    description: "Allows building near supply drop points in PvE.",
  },
  AllowCrateSpawnsOnTopOfStructures: {
    label: "Crates on structures",
    description: "Supply crates can land on structures.",
  },
  MaxPlatformSaddleStructureLimit: {
    label: "Max platform saddles",
    description: "Number of platform saddles and rafts on the whole server.",
  },
  PerPlatformMaxStructuresMultiplier: {
    label: "Structures per platform",
    description: "Multiplies how many structures fit on a saddle or raft.",
  },
  PlatformSaddleBuildAreaBoundsMultiplier: {
    label: "Platform build area",
    description: "How far from a platform you can build.",
  },
  OverrideStructurePlatformPrevention: {
    label: "Turrets on platforms",
    description: "Allows turrets and spike structures on platform saddles.",
  },
  AllowCryoFridgeOnSaddle: {
    label: "Cryofridge on saddles",
    description: "Allows cryofridges on platform saddles and rafts.",
  },
  MaxGateFrameOnSaddles: {
    label: "Gateways on saddles",
    description: "Gateways per platform saddle; 0 forbids them.",
  },
  AllowMultipleAttachedC4: {
    label: "Several C4 per creature",
    description: "Allows more than one C4 on the same creature.",
  },
  DestroyUnconnectedWaterPipes: {
    label: "Destroy loose pipes",
    description: "Unconnected pipes are destroyed after two real days.",
  },
  MaxTrainCars: {
    label: "Max cars per train",
    description: "Number of cars in a train.",
  },
  DisableStructureDecayPvE: {
    label: "Disable structure decay (PvE)",
    description: "Abandoned structures no longer decay.",
  },
  PvEStructureDecayPeriodMultiplier: {
    label: "Structure decay period",
    description:
      "Time before an abandoned structure decays (PvE, and PvP when enabled).",
  },
  AutoDestroyOldStructuresMultiplier: {
    label: "Auto-destroy old structures",
    description:
      "Delay before abandoned structures are destroyed. Needs the -AutoDestroyStructures launch option.",
  },
  OnlyAutoDestroyCoreStructures: {
    label: "Only destroy core structures",
    description: "Only foundations, walls, etc. are destroyed automatically.",
  },
  OnlyDecayUnsnappedCoreStructures: {
    label: "Only decay loose structures",
    description: "Only unsnapped core structures decay.",
  },
  FastDecayUnsnappedCoreStructures: {
    label: "Fast decay of loose structures",
    description:
      "Unsnapped core structures decay after the fast interval (Game.ini).",
  },
  bDisableStructurePlacementCollision: {
    label: "No placement collision",
    description: "Structures can clip into the terrain.",
  },
  bIgnoreStructuresPreventionVolumes: {
    label: "Ignore no-build areas",
    description: "Allows building in protected areas (obelisks, portals…).",
  },
  bGenesisUseStructuresPreventionVolumes: {
    label: "Protected mission areas (Genesis)",
    description: "Forbids building in Genesis: Part 1 mission areas.",
  },
  bAllowPlatformSaddleMultiFloors: {
    label: "Multi-floor platforms",
    description: "Allows several floors on a platform saddle.",
  },
  bFlyerPlatformAllowUnalignedDinoBasing: {
    label: "Neutral creatures on flying platforms",
    description: "A flying Quetzal platform accepts non-allied creatures.",
  },
  bPassiveDefensesDamageRiderlessDinos: {
    label: "Defenses against riderless creatures",
    description: "Spike walls hurt wild or riderless creatures.",
  },
  StructureDamageRepairCooldown: {
    label: "Repair cooldown",
    description: "Seconds after damage before repairing; 0 turns it off.",
  },
  PvPZoneStructureDamageMultiplier: {
    label: "Structure damage in PvP zones",
    description: "Damage taken by structures in PvP zones (caves…).",
  },
  FastDecayInterval: {
    label: "Fast decay interval",
    description: "Seconds before loose structures decay fast.",
  },
  bLimitTurretsInRange: {
    label: "Limit turrets",
    description: "Limits the number of turrets in an area.",
  },
  bHardLimitTurretsInRange: {
    label: "Hard turret limit",
    description: "Applies the limit to turrets already placed.",
  },
  LimitTurretsNum: {
    label: "Max turrets",
    description: "Number of turrets in the area below.",
  },
  LimitTurretsRange: {
    label: "Turret area",
    description: "Radius (Unreal units) counted for the turret limit.",
  },
  LimitGeneratorsNum: {
    label: "Max generators",
    description: "Number of generators in the area below.",
  },
  LimitGeneratorsRange: {
    label: "Generator area",
    description: "Radius (Unreal units) counted for the generator limit.",
  },
};
