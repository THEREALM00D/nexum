import type {
  ArkNpcReplacement,
  ArkSpawnContainer,
  ArkSpawnLists,
  ArkSpawnMode,
  ArkSpawnWeight,
} from "../../../../../shared/types";
import type { IniDocument } from "../iniDocument";
import {
  formatUeValue,
  ueField,
  ueFieldText,
  ueList,
  ueStruct,
  ueText,
  type UeValue,
} from "../ueStruct";
import {
  boolText,
  isClassName,
  numberText,
  readEntries,
  ueBool,
  writeEntries,
} from "./listEntries";

const CONTAINER_KEYS: Record<ArkSpawnMode, string> = {
  add: "ConfigAddNPCSpawnEntriesContainer",
  subtract: "ConfigSubtractNPCSpawnEntriesContainer",
  override: "ConfigOverrideNPCSpawnEntriesContainer",
};
const WEIGHT_KEY = "DinoSpawnWeightMultipliers";
const REPLACEMENT_KEY = "NPCReplacements";
const textOf = (value: UeValue) =>
  !Array.isArray(value) && value.kind === "scalar" ? value.text : "";

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
    })),
    limits: ueList(ueField(value, "NPCSpawnLimits")).map((limit) => ({
      creature: ueFieldText(limit, "NPCClassString") ?? "",
      maxPercentage:
        ueFieldText(limit, "MaxPercentageOfDesiredNumToAllow") ?? "",
    })),
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
  };
}

function parseReplacement(value: UeValue): ArkNpcReplacement | null {
  const from = ueFieldText(value, "FromClassName");
  const to = ueFieldText(value, "ToClassName");
  return from && to ? { from, to } : null;
}

export function readSpawns(doc: IniDocument) {
  const unreadable: string[] = [];
  const containers: ArkSpawnContainer[] = [];
  for (const [mode, key] of Object.entries(CONTAINER_KEYS) as [
    ArkSpawnMode,
    string,
  ][]) {
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

const classText = (value: string) => ueText(value.trim(), true);
const optional = (text: string | undefined) =>
  text === undefined ? undefined : ueText(text);

function formatContainer(container: ArkSpawnContainer): string | null {
  if (!isClassName(container.container)) return null;
  const subtract = container.mode === "subtract";
  const entries = container.entries.map((entry) =>
    ueStruct([
      [
        "AnEntryName",
        subtract || !entry.name ? undefined : ueText(entry.name, true),
      ],
      [
        "EntryWeight",
        subtract ? undefined : optional(numberText(entry.weight)),
      ],
      [
        "NPCsToSpawnStrings",
        entry.creatures.filter(isClassName).map(classText),
      ],
    ]),
  );
  const limits = container.limits
    .filter((limit) => isClassName(limit.creature))
    .map((limit) =>
      ueStruct([
        ["NPCClassString", classText(limit.creature)],
        [
          "MaxPercentageOfDesiredNumToAllow",
          subtract ? undefined : optional(numberText(limit.maxPercentage)),
        ],
      ]),
    );
  return formatUeValue(
    ueStruct([
      ["NPCSpawnEntriesContainerClassString", classText(container.container)],
      ["NPCSpawnEntries", entries],
      ["NPCSpawnLimits", limits.length > 0 ? limits : undefined],
    ]),
  );
}

export function writeSpawns(
  doc: IniDocument,
  spawns: ArkSpawnLists,
  unreadable: string[],
): void {
  for (const [mode, key] of Object.entries(CONTAINER_KEYS) as [
    ArkSpawnMode,
    string,
  ][]) {
    const values = spawns.containers
      .filter((container) => container.mode === mode)
      .flatMap((container) => formatContainer(container) ?? []);
    writeEntries(doc, key, values, unreadable);
  }
  const weights = spawns.weights.flatMap((weight) => {
    if (!isClassName(weight.tag)) return [];
    return [
      formatUeValue(
        ueStruct([
          ["DinoNameTag", ueText(weight.tag.trim())],
          ["SpawnWeightMultiplier", optional(numberText(weight.weight))],
          [
            "OverrideSpawnLimitPercentage",
            weight.overrideLimit === null
              ? undefined
              : ueText(boolText(weight.overrideLimit)),
          ],
          ["SpawnLimitPercentage", optional(numberText(weight.limit))],
        ]),
      ),
    ];
  });
  writeEntries(doc, WEIGHT_KEY, weights, unreadable);
  const replacements = spawns.replacements.flatMap((replacement) =>
    isClassName(replacement.from) && isClassName(replacement.to)
      ? [
          formatUeValue(
            ueStruct([
              ["FromClassName", classText(replacement.from)],
              ["ToClassName", classText(replacement.to)],
            ]),
          ),
        ]
      : [],
  );
  writeEntries(doc, REPLACEMENT_KEY, replacements, unreadable);
}
