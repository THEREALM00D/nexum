import type {
  ArkNpcReplacement,
  ArkSpawnContainer,
  ArkSpawnLists,
  ArkSpawnMode,
  ArkSpawnWeight,
} from "../../../../../shared/types";
import type { IniDocument } from "../iniDocument";
import { ueField, ueFieldText, ueList, type UeValue } from "../ueStruct";
import { extraFields, readEntries, ueBool } from "./listEntries";

// Lecture des listes de spawn de Game.ini (écriture : spawns.ts).

export const CONTAINER_KEYS: Record<ArkSpawnMode, string> = {
  add: "ConfigAddNPCSpawnEntriesContainer",
  subtract: "ConfigSubtractNPCSpawnEntriesContainer",
  override: "ConfigOverrideNPCSpawnEntriesContainer",
};
export const WEIGHT_KEY = "DinoSpawnWeightMultipliers";
export const REPLACEMENT_KEY = "NPCReplacements";
const CONTAINER_FIELDS = [
  "NPCSpawnEntriesContainerClassString",
  "NPCSpawnEntries",
  "NPCSpawnLimits",
];
// Champs édités ; les autres (chances, décalages, niveaux, couleurs…) sont
// gardés tels quels dans `extra`.
const ENTRY_FIELDS = ["AnEntryName", "EntryWeight", "NPCsToSpawnStrings"];
const LIMIT_FIELDS = ["NPCClassString", "MaxPercentageOfDesiredNumToAllow"];
const WEIGHT_FIELDS = [
  "DinoNameTag",
  "SpawnWeightMultiplier",
  "OverrideSpawnLimitPercentage",
  "SpawnLimitPercentage",
];
const textOf = (value: UeValue) =>
  !Array.isArray(value) && value.kind === "scalar" ? value.text : "";
export const containerKeys = () =>
  Object.entries(CONTAINER_KEYS) as [ArkSpawnMode, string][];

function parseContainer(
  mode: ArkSpawnMode,
  value: UeValue,
): ArkSpawnContainer | null {
  const container = ueFieldText(value, "NPCSpawnEntriesContainerClassString");
  if (!container) return null;
  return {
    mode,
    container,
    entries: ueList(ueField(value, "NPCSpawnEntries")).map((entry) => ({
      name: ueFieldText(entry, "AnEntryName") ?? "",
      weight: ueFieldText(entry, "EntryWeight") ?? "",
      creatures: ueList(ueField(entry, "NPCsToSpawnStrings")).map(textOf),
      extra: extraFields(entry, ENTRY_FIELDS),
    })),
    limits: ueList(ueField(value, "NPCSpawnLimits")).map((limit) => ({
      creature: ueFieldText(limit, "NPCClassString") ?? "",
      maxPercentage:
        ueFieldText(limit, "MaxPercentageOfDesiredNumToAllow") ?? "",
      extra: extraFields(limit, LIMIT_FIELDS),
    })),
    extra: extraFields(value, CONTAINER_FIELDS),
  };
}

function parseWeight(value: UeValue): ArkSpawnWeight | null {
  const tag = ueFieldText(value, "DinoNameTag");
  if (!tag) return null;
  return {
    tag,
    weight: ueFieldText(value, "SpawnWeightMultiplier") ?? "",
    overrideLimit: ueBool(ueFieldText(value, "OverrideSpawnLimitPercentage")),
    limit: ueFieldText(value, "SpawnLimitPercentage") ?? "",
    extra: extraFields(value, WEIGHT_FIELDS),
  };
}

function parseReplacement(value: UeValue): ArkNpcReplacement | null {
  const from = ueFieldText(value, "FromClassName");
  const to = ueFieldText(value, "ToClassName");
  if (!from || !to) return null;
  return {
    from,
    to,
    extra: extraFields(value, ["FromClassName", "ToClassName"]),
  };
}

export function readSpawns(doc: IniDocument) {
  const unreadable: string[] = [];
  const containers: ArkSpawnContainer[] = [];
  for (const [mode, key] of containerKeys()) {
    const parsed = readEntries(doc, key, (value) =>
      parseContainer(mode, value),
    );
    containers.push(...parsed.items);
    unreadable.push(...parsed.unreadable);
  }
  const weights = readEntries(doc, WEIGHT_KEY, parseWeight);
  const replacements = readEntries(doc, REPLACEMENT_KEY, parseReplacement);
  unreadable.push(...weights.unreadable, ...replacements.unreadable);
  const spawns: ArkSpawnLists = {
    containers,
    weights: weights.items,
    replacements: replacements.items,
  };
  return { spawns, unreadable };
}
