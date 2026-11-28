// Clés de Game.ini éditées ailleurs que dans « Réglages de jeu » : par les
// éditeurs de l'onglet Listes, ou seulement à la main (éditeur brut). Elles
// ne sont jamais proposées comme « Autres réglages ».
export const LIST_EDITOR_KEYS = [
  "PerLevelStatsMultiplier_Player",
  "PerLevelStatsMultiplier_DinoWild",
  "PerLevelStatsMultiplier_DinoTamed",
  "PerLevelStatsMultiplier_DinoTamed_Add",
  "PerLevelStatsMultiplier_DinoTamed_Affinity",
  "ConfigOverrideItemMaxQuantity",
  "OverrideNamedEngramEntries",
  "EngramEntryAutoUnlocks",
  "OverridePlayerLevelEngramPoints",
  "bOnlyAllowSpecifiedEngrams",
  "ConfigAddNPCSpawnEntriesContainer",
  "ConfigSubtractNPCSpawnEntriesContainer",
  "ConfigOverrideNPCSpawnEntriesContainer",
  "DinoSpawnWeightMultipliers",
  "NPCReplacements",
  "ConfigOverrideItemCraftingCosts",
];

export const RAW_ONLY_LIST_KEYS = [
  // Engrammes par index : l'onglet Listes n'édite que ceux par nom.
  "OverrideEngramEntries",
  "CheatTeleportLocations",
  "ConfigOverrideSupplyCrateItems",
  "DinoClassDamageMultipliers",
  "DinoClassResistanceMultipliers",
  "DinoClassSpeedMultipliers",
  "TamedDinoClassDamageMultipliers",
  "TamedDinoClassResistanceMultipliers",
  "TamedDinoClassSpeedMultipliers",
  "TamedDinoClassStaminaMultipliers",
  "ExcludeItemIndices",
  "HarvestResourceItemAmountClassMultipliers",
  "ItemStatClamps",
  "LevelExperienceRampOverrides",
  "MutagenLevelBoost",
  "MutagenLevelBoost_Bred",
  "PlayerBaseStatMultipliers",
  "PreventBreedingForClassNames",
  "PreventDinoTameClassNames",
  "PreventTransferForClassNames",
];

// [ServerSettings] de GameUserSettings.ini gérées par l'onglet Général
// (gameUserSettingsIni.ts) ou obsolètes dans ASA (mods : -mods, page Mods).
export const GENERAL_TAB_KEYS = [
  "ServerPassword",
  "ServerAdminPassword",
  "ServerPVE",
  "RCONEnabled",
  "RCONPort",
  "ActiveMods",
  "ActiveMapMod",
  "ActiveTotalConversion",
];
