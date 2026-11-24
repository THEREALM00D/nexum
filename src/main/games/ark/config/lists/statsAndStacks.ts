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
  isClassName,
  numberText,
  readEntries,
  ueBool,
  writeEntries,
  type ParsedEntries,
} from "./listEntries";

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
      const number = numberText(value ?? "");
      return number === undefined || index >= STAT_COUNT
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
    if (!itemClass || max === undefined) return null;
    return {
      itemClass,
      quantity: max,
      ignoreMultiplier:
        ueBool(ueFieldText(quantity ?? null, "bIgnoreMultiplier")) ?? false,
    };
  });
}

export function writeStackSizes(
  doc: IniDocument,
  stacks: ArkStackSize[],
  unreadable: string[],
): void {
  const values = stacks.flatMap((stack) => {
    const quantity = numberText(stack.quantity);
    if (!isClassName(stack.itemClass) || quantity === undefined) return [];
    return [
      formatUeValue(
        ueStruct([
          ["ItemClassString", ueText(stack.itemClass.trim(), true)],
          [
            "Quantity",
            ueStruct([
              ["MaxItemQuantity", ueText(quantity)],
              ["bIgnoreMultiplier", ueText(boolText(stack.ignoreMultiplier))],
            ]),
          ],
        ]),
      ),
    ];
  });
  writeEntries(doc, STACK_KEY, values, unreadable);
}
