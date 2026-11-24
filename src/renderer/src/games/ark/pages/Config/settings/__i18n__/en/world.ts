export default {
  DayCycleSpeedScale: {
    label: "Day/night cycle speed",
    description: "Overall speed of in-game time.",
  },
  DayTimeSpeedScale: {
    label: "Day length",
    description: "Speed of time during the day (lower means longer days).",
  },
  NightTimeSpeedScale: {
    label: "Night length",
    description: "Speed of time during the night (lower means longer nights).",
  },
  StartTimeHour: {
    label: "Start hour",
    description:
      "In-game hour when the server starts; -1 keeps the saved time.",
  },
  DisableWeatherFog: {
    label: "No fog",
    description: "Turns off fog.",
  },
  RandomSupplyCratePoints: {
    label: "Random supply drops",
    description: "Crates drop at random places.",
  },
  ClampItemSpoilingTimes: {
    label: "Clamp spoiling times",
    description: "Brings item spoiling times back to their maximum.",
  },
  ClampItemStats: {
    label: "Clamp item stats",
    description: "Turns on the item stat cap (ItemStatClamps in Game.ini).",
  },
  ExtinctionEventTimeInterval: {
    label: "Extinction event",
    description:
      "Seconds before the world is fully reset (2592000 = 30 days). Empty = off.",
  },
  AllowTekSuitPowersInGenesis: {
    label: "Tek suit powers (Genesis)",
    description: "Turns on Tek suit powers on Genesis: Part 1.",
  },
  UseAstraeosTraversalBuff: {
    label: "Biome teleport (Astraeos)",
    description: "Teleport between Astraeos biomes by holding R.",
  },
  WorldBossKingKaijuSpawnTime: {
    label: "King Titan spawn",
    description: "UTC time (hh:mm:ss) when the Wandering King Titan spawns.",
  },
  OverrideSecondsUntilBuriedTreasureAutoReveals: {
    label: "Buried treasure reveal",
    description: "Seconds before buried treasure reveals itself.",
  },
  NeedsPowerToActivateAquaticCompartments: {
    label: "Powered aquatic compartments",
    description: "Aquatic compartments need electricity.",
  },
  ElementalIslandShutdownFrequencyMultiplier: {
    label: "Elemental island shutdowns",
    description: "How often the elemental island shuts down.",
  },
  DisableBurrowDecayTimers: {
    label: "No burrow decay",
    description: "Burrowbuck burrows no longer decay.",
  },
  GlobalSpoilingTimeMultiplier: {
    label: "Spoiling time",
    description: "Time before perishable items spoil.",
  },
  GlobalItemDecompositionTimeMultiplier: {
    label: "Dropped item lifetime",
    description: "Time before dropped items and bags disappear.",
  },
  GlobalCorpseDecompositionTimeMultiplier: {
    label: "Corpse lifetime",
    description: "Time before corpses disappear.",
  },
  UseCorpseLifeSpanMultiplier: {
    label: "Corpse and bag lifespan",
    description: "Changes how long corpses and dropped bags last.",
  },
  CropGrowthSpeedMultiplier: {
    label: "Crop growth",
    description: "Higher means crops grow faster.",
  },
  CropDecaySpeedMultiplier: {
    label: "Crop decay",
    description: "Higher means crops rot more slowly.",
  },
  BaseTemperatureMultiplier: {
    label: "Base temperature",
    description: "Lower is colder; higher is hotter.",
  },
  ResourceNoReplenishRadiusPlayers: {
    label: "No-regrowth radius around players",
    description: "Above 1, resources grow back farther from players.",
  },
  ResourceNoReplenishRadiusStructures: {
    label: "No-regrowth radius around structures",
    description: "Above 1, resources grow back farther from structures.",
  },
  LimitNonPlayerDroppedItemsCount: {
    label: "Max dropped items",
    description:
      "Dropped items allowed within the radius below; 600 on official servers.",
  },
  LimitNonPlayerDroppedItemsRange: {
    label: "Dropped items radius",
    description:
      "Radius (Unreal units) of the limit above; 1600 on official servers.",
  },
  FuelConsumptionIntervalMultiplier: {
    label: "Fuel consumption",
    description: "Interval between two fuel uses.",
  },
  GlobalPoweredBatteryDurabilityDecreasePerSecond: {
    label: "Battery wear",
    description: "How fast batteries drain in electrical devices.",
  },
  bDisableLootCrates: {
    label: "No loot crates",
    description: "Loot crates no longer spawn (artifact crates still do).",
  },
  bDisableDefaultMapItemSets: {
    label: "No starting gear (Genesis 2)",
    description: "No Tek suit on spawn on Genesis: Part 2.",
  },
  bDisableGenesisMissions: {
    label: "No Genesis missions",
    description: "Turns off Genesis missions.",
  },
  bDisableWorldBuffs: {
    label: "No world buffs",
    description: "Turns off Genesis: Part 2 world buffs.",
  },
  bEnableWorldBuffScaling: {
    label: "Scaled world buffs",
    description: "World buffs follow the server settings.",
  },
  WorldBuffScalingEfficacy: {
    label: "World buff strength",
    description: "Scale of world buffs (with the setting above).",
  },
  ValgueroMemorialEntries: {
    label: "Memorial names (Valguero)",
    description:
      "Names engraved on the Valguero memorial, separated by semicolons.",
  },
};
