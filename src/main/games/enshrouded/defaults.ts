import type {
  EnshroudedGameSettingValue,
  EnshroudedSettings,
} from "../../../shared/types";

// Valeurs et clés d'enshrouded_server.json gérées par Nexum (voir serverJson.ts).

// Durées de gameSettings stockées en nanosecondes : affichées en minutes.
export const NS_PER_MINUTE = 60_000_000_000;
export const DURATION_KEYS = new Set([
  "dayTimeDuration",
  "nightTimeDuration",
  "fromHungerToStarving",
]);

// gameSettings du fichier créé par le serveur 1.0.0.0 (vérifié), durées en
// minutes. Complète un fichier absent ou ancien : le serveur ajoute de
// lui-même les clés qui manquent.
export const DEFAULT_GAME_SETTINGS: Record<string, EnshroudedGameSettingValue> =
  {
    playerHealthFactor: 1,
    playerManaFactor: 1,
    playerStaminaFactor: 1,
    playerBodyHeatFactor: 1,
    playerDivingTimeFactor: 1,
    enableDurability: true,
    enableStarvingDebuff: false,
    foodBuffDurationFactor: 1,
    fromHungerToStarving: 10,
    shroudTimeFactor: 1,
    tombstoneMode: "AddBackpackMaterials",
    enableGliderTurbulences: true,
    weatherFrequency: "Normal",
    fishingDifficulty: "Normal",
    miningDamageFactor: 1,
    plantGrowthSpeedFactor: 1,
    resourceDropStackAmountFactor: 1,
    factoryProductionSpeedFactor: 1,
    perkUpgradeRecyclingFactor: 0.5,
    perkCostFactor: 1,
    experienceCombatFactor: 1,
    experienceMiningFactor: 1,
    experienceExplorationQuestsFactor: 1,
    randomSpawnerAmount: "Automatic",
    aggroPoolAmount: "Normal",
    enemyDamageFactor: 1,
    enemyHealthFactor: 1,
    enemyStaminaFactor: 1,
    enemyPerceptionRangeFactor: 1,
    bossDamageFactor: 1,
    bossHealthFactor: 1,
    threatBonus: 1,
    pacifyAllEnemies: false,
    tamingStartleRepercussion: "LoseSomeProgress",
    dayTimeDuration: 30,
    nightTimeDuration: 12,
    curseModifier: "Normal",
    flameLevelFogRemoval: 11,
  };

// Valeurs du fichier créé par le serveur (vérifié sur la version 1.0.0.0).
export const DEFAULT_SETTINGS: Omit<EnshroudedSettings, "customArgs"> = {
  name: "Enshrouded Server",
  ip: "0.0.0.0",
  queryPort: 15637,
  slotCount: 16,
  voiceChatMode: "Proximity",
  enableVoiceChat: false,
  enableTextChat: false,
  gameSettingsPreset: "Default",
  gameSettings: {},
  saveDirectory: "./savegame",
  logDirectory: "./logs",
};

export const TOP_LEVEL_KEYS = [
  "name",
  "ip",
  "queryPort",
  "slotCount",
  "voiceChatMode",
  "enableVoiceChat",
  "enableTextChat",
  "gameSettingsPreset",
  "saveDirectory",
  "logDirectory",
] as const;
