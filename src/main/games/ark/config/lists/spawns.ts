import type {
  ArkSpawnContainer,
  ArkSpawnLists,
} from "../../../../../shared/types";
import type { IniDocument } from "../iniDocument";
import { formatUeValue, ueStruct, ueText } from "../ueStruct";
import {
  boolText,
  classText,
  numberText,
  quotedText,
  withExtra,
  writeEntries,
} from "./listEntries";
import {
  CONTAINER_KEYS,
  REPLACEMENT_KEY,
  WEIGHT_KEY,
  containerKeys,
} from "./spawnsRead";

// Écriture des listes de spawn : champs édités reconstruits, champs inconnus
// rattachés tels quels (`extra`).

const quoted = (value: string) => ueText(value, true);
const optional = (text: string | undefined) =>
  text === undefined ? undefined : ueText(text);

function formatContainer(container: ArkSpawnContainer): string | null {
  const key = CONTAINER_KEYS[container.mode];
  const className = classText(key, container.container);
  if (className === undefined) return null;
  const subtract = container.mode === "subtract";
  const spawnEntries = (container.entries ?? []).map((entry) => {
    const name = quotedText(entry.name);
    const creatures = (entry.creatures ?? []).flatMap((creature) => {
      const text = classText(key, creature);
      return text === undefined ? [] : [quoted(text)];
    });
    return withExtra(
      ueStruct([
        ["AnEntryName", subtract || !name ? undefined : quoted(name)],
        [
          "EntryWeight",
          subtract ? undefined : optional(numberText(key, entry.weight)),
        ],
        ["NPCsToSpawnStrings", creatures],
      ]),
      entry.extra,
    );
  });
  const limits = (container.limits ?? []).flatMap((limit) => {
    const creature = classText(key, limit.creature);
    if (creature === undefined) return [];
    const max = subtract
      ? undefined
      : optional(numberText(key, limit.maxPercentage));
    return [
      withExtra(
        ueStruct([
          ["NPCClassString", quoted(creature)],
          ["MaxPercentageOfDesiredNumToAllow", max],
        ]),
        limit.extra,
      ),
    ];
  });
  return formatUeValue(
    withExtra(
      ueStruct([
        ["NPCSpawnEntriesContainerClassString", quoted(className)],
        ["NPCSpawnEntries", spawnEntries],
        ["NPCSpawnLimits", limits.length > 0 ? limits : undefined],
      ]),
      container.extra,
    ),
  );
}

export function writeSpawns(
  doc: IniDocument,
  spawns: ArkSpawnLists,
  unreadable: string[],
): void {
  for (const [mode, key] of containerKeys()) {
    const values = (spawns.containers ?? [])
      .filter((container) => container.mode === mode)
      .flatMap((container) => formatContainer(container) ?? []);
    writeEntries(doc, key, values, unreadable);
  }
  const weights = (spawns.weights ?? []).flatMap((weight) => {
    const tag = classText(WEIGHT_KEY, weight.tag);
    if (tag === undefined) return [];
    const overrideLimit =
      weight.overrideLimit === null
        ? undefined
        : ueText(boolText(weight.overrideLimit));
    return [
      formatUeValue(
        withExtra(
          ueStruct([
            ["DinoNameTag", ueText(tag)],
            [
              "SpawnWeightMultiplier",
              optional(numberText(WEIGHT_KEY, weight.weight)),
            ],
            ["OverrideSpawnLimitPercentage", overrideLimit],
            [
              "SpawnLimitPercentage",
              optional(numberText(WEIGHT_KEY, weight.limit)),
            ],
          ]),
          weight.extra,
        ),
      ),
    ];
  });
  writeEntries(doc, WEIGHT_KEY, weights, unreadable);
  const replacements = (spawns.replacements ?? []).flatMap((replacement) => {
    const from = classText(REPLACEMENT_KEY, replacement.from);
    const to = classText(REPLACEMENT_KEY, replacement.to);
    if (from === undefined || to === undefined) return [];
    return [
      formatUeValue(
        withExtra(
          ueStruct([
            ["FromClassName", quoted(from)],
            ["ToClassName", quoted(to)],
          ]),
          replacement.extra,
        ),
      ),
    ];
  });
  writeEntries(doc, REPLACEMENT_KEY, replacements, unreadable);
}
