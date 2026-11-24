import type {
  ArkPerLevelStats,
  ArkStackSize,
  ArkStatsTable,
} from "../../../../../shared/types";
import { GAME_SECTION } from "../../../../../shared/arkSettings";
import type { IniDocument } from "../iniDocument";
import {
  ueField,
  ueFieldText,
  ueStruct,
  ueText,
  formatUeValue,
} from "../ueStruct";
import {
  boolText,
  classText,
  extraFields,
  numberText,
  readEntries,
  ueBool,
  withExtra,
  writeEntries,
  type ParsedEntries,
} from "./listEntries";
import { AppError } from "../../../../utils/appError";

export const STATS_TABLES: ArkStatsTable[] = [
  "Player",
  "DinoWild",
  "DinoTamed",
  "DinoTamed_Add",
  "DinoTamed_Affinity",
];
// Index 0 à 11 : santé, endurance, torpeur, oxygène, nourriture, eau,
// température, poids, dégâts, vitesse, force d'âme, fabrication (wiki).
export const STAT_COUNT = 12;

const statsKey = (table: ArkStatsTable) => `PerLevelStatsMultiplier_${table}`;

/** PerLevelStatsMultiplier_<table>[n] ; "" = non écrit (défaut du jeu). */
export function readStats(doc: IniDocument): ArkPerLevelStats {
  const stats = {} as ArkPerLevelStats;
  for (const table of STATS_TABLES) {
    const values: string[] = Array(STAT_COUNT).fill("");
    for (const entry of doc.getAll(GAME_SECTION, statsKey(table))) {
      if (entry.index !== null && entry.index < STAT_COUNT) {
        values[entry.index] = entry.value;
      }
    }
    stats[table] = values;
  }
  return stats;
}

export function writeStats(doc: IniDocument, stats: ArkPerLevelStats): void {
  for (const table of STATS_TABLES) {
    const lines = (stats[table] ?? []).flatMap((value, index) => {
      if (index >= STAT_COUNT) return [];
      const number = numberText(`${statsKey(table)}[${index}]`, value);
      return number === undefined
        ? []
        : [`${statsKey(table)}[${index}]=${number}`];
    });
    // Lignes hors du tableau (sans index, index > 11) : gardées.
    const kept = doc
      .getAll(GAME_SECTION, statsKey(table))
      .filter((entry) => entry.index === null || entry.index >= STAT_COUNT)
      .map((entry) => `${entry.key}=${entry.value}`);
    doc.replaceAll(GAME_SECTION, statsKey(table), [...lines, ...kept]);
  }
}

const STACK_KEY = "ConfigOverrideItemMaxQuantity";

export function readStackSizes(doc: IniDocument): ParsedEntries<ArkStackSize> {
  return readEntries(doc, STACK_KEY, (value) => {
    const itemClass = ueFieldText(value, "ItemClassString");
    const quantity = ueField(value, "Quantity");
    const max = ueFieldText(quantity ?? null, "MaxItemQuantity");
    if (!itemClass || max === undefined || !quantity) return null;
    // Seuls les champs connus de Quantity sont édités : une structure
    // Quantity avec d'autres champs reste illisible (gardée telle quelle).
    if (extraFields(quantity, ["MaxItemQuantity", "bIgnoreMultiplier"])) {
      return null;
    }
    return {
      itemClass,
      quantity: max,
      ignoreMultiplier:
        ueBool(ueFieldText(quantity, "bIgnoreMultiplier")) ?? false,
      extra: extraFields(value, ["ItemClassString", "Quantity"]),
    };
  });
}

export function writeStackSizes(
  doc: IniDocument,
  stacks: ArkStackSize[],
  unreadable: string[],
): void {
  const values = stacks.flatMap((stack) => {
    const itemClass = classText(STACK_KEY, stack.itemClass);
    const quantity = numberText(STACK_KEY, stack.quantity);
    // Ligne laissée vide : ignorée.
    if (itemClass === undefined && quantity === undefined) return [];
    if (itemClass === undefined || quantity === undefined) {
      throw new AppError("ARK_SETTING_INVALID", {
        key: STACK_KEY,
        value: `${stack.itemClass} ${stack.quantity}`,
      });
    }
    return [
      formatUeValue(
        withExtra(
          ueStruct([
            ["ItemClassString", ueText(itemClass, true)],
            [
              "Quantity",
              ueStruct([
                ["MaxItemQuantity", ueText(quantity)],
                ["bIgnoreMultiplier", ueText(boolText(stack.ignoreMultiplier))],
              ]),
            ],
          ]),
          stack.extra,
        ),
      ),
    ];
  });
  writeEntries(doc, STACK_KEY, values, unreadable);
}
