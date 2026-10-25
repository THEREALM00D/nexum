import type { FieldDef, FieldGroup } from "../../../../components/config/types";

// Réglages de `gameSettings` (lus par le serveur seulement en preset
// Custom), bornes du readme livré avec le serveur 1.0.0.0. Hors bornes, le
// serveur ramène la valeur au minimum / maximum ; un texte invalide l'empêche
// de démarrer, d'où des listes pour les énumérations.

const factor = (key: string, min: number, max: number): FieldDef => ({
  key,
  type: "number",
  min,
  max,
  step: 0.05,
});

// Durées : en nanosecondes dans le fichier, en minutes ici (conversion côté main).
const minutes = (key: string, min: number, max: number): FieldDef => ({
  key,
  type: "number",
  min,
  max,
  step: 1,
});

const choice = (key: string, values: string[]): FieldDef => ({
  key,
  type: "select",
  options: values.map((value) => ({
    value,
    labelKey: `enshroudedConfig.options.${value}`,
  })),
});

const toggle = (key: string): FieldDef => ({ key, type: "boolean" });

const AMOUNTS = ["Few", "Normal", "Many", "Extreme"];

export const GAME_SETTING_GROUPS: FieldGroup[] = [
  {
    labelKey: "enshroudedConfig.themes.player",
    fields: [
      factor("playerHealthFactor", 0.25, 4),
      factor("playerManaFactor", 0.25, 4),
      factor("playerStaminaFactor", 0.25, 4),
      factor("playerBodyHeatFactor", 0.5, 2),
      factor("playerDivingTimeFactor", 0.5, 2),
    ],
  },
  {
    labelKey: "enshroudedConfig.themes.survival",
    fields: [
      toggle("enableDurability"),
      toggle("enableStarvingDebuff"),
      factor("foodBuffDurationFactor", 0.5, 2),
      minutes("fromHungerToStarving", 5, 20),
      factor("shroudTimeFactor", 0.5, 2),
      choice("tombstoneMode", [
        "AddBackpackMaterials",
        "Everything",
        "NoTombstone",
      ]),
      choice("curseModifier", ["Easy", "Normal", "Hard"]),
    ],
  },
  {
    labelKey: "enshroudedConfig.themes.world",
    fields: [
      toggle("enableGliderTurbulences"),
      choice("weatherFrequency", ["Disabled", "Rare", "Normal", "Often"]),
      choice("fishingDifficulty", [
        "VeryEasy",
        "Easy",
        "Normal",
        "Hard",
        "VeryHard",
      ]),
      factor("miningDamageFactor", 0.5, 2),
      factor("plantGrowthSpeedFactor", 0.25, 2),
      factor("resourceDropStackAmountFactor", 0.25, 2),
      factor("factoryProductionSpeedFactor", 0.25, 2),
      { key: "flameLevelFogRemoval", type: "number", min: 0, max: 20, step: 1 },
    ],
  },
  {
    labelKey: "enshroudedConfig.themes.progression",
    fields: [
      factor("experienceCombatFactor", 0.25, 2),
      factor("experienceMiningFactor", 0, 2),
      factor("experienceExplorationQuestsFactor", 0.25, 2),
      factor("perkCostFactor", 0.25, 2),
      factor("perkUpgradeRecyclingFactor", 0, 1),
    ],
  },
  {
    labelKey: "enshroudedConfig.themes.enemies",
    fields: [
      choice("randomSpawnerAmount", [
        "Few",
        "Normal",
        "Automatic",
        "Many",
        "Extreme",
      ]),
      choice("aggroPoolAmount", AMOUNTS),
      factor("enemyDamageFactor", 0.25, 5),
      factor("enemyHealthFactor", 0.25, 4),
      factor("enemyStaminaFactor", 0.5, 2),
      factor("enemyPerceptionRangeFactor", 0.5, 2),
      factor("threatBonus", 0.25, 4),
      toggle("pacifyAllEnemies"),
      choice("tamingStartleRepercussion", [
        "KeepProgress",
        "LoseSomeProgress",
        "LoseAllProgress",
      ]),
    ],
  },
  {
    labelKey: "enshroudedConfig.themes.bosses",
    fields: [
      factor("bossDamageFactor", 0.2, 5),
      factor("bossHealthFactor", 0.2, 5),
    ],
  },
  {
    labelKey: "enshroudedConfig.themes.time",
    fields: [
      minutes("dayTimeDuration", 2, 60),
      minutes("nightTimeDuration", 2, 60),
    ],
  },
];

/** Presets du serveur ; `Custom` est le seul qui lit gameSettings. */
export const PRESETS = ["Default", "Relaxed", "Hard", "Survival", "Custom"];
export const CUSTOM_PRESET = "Custom";
