import type {
  ArkEngramAutoUnlock,
  ArkEngramLists,
  ArkEngramOverride,
} from "../../../../../shared/types";
import { GAME_SECTION } from "../../../../../shared/arkSettings";
import type { IniDocument } from "../iniDocument";
import {
  formatUeValue,
  ueFieldText,
  ueStruct,
  ueText,
  type UeValue,
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
} from "./listEntries";

// Engrammes par nom de classe. OverrideEngramEntries (par index) n'est pas
// édité ici : il reste tel quel (éditeur brut).
const OVERRIDE_KEY = "OverrideNamedEngramEntries";
const AUTO_UNLOCK_KEY = "EngramEntryAutoUnlocks";
const LEVEL_POINTS_KEY = "OverridePlayerLevelEngramPoints";
const ONLY_SPECIFIED_KEY = "bOnlyAllowSpecifiedEngrams";

const OVERRIDE_FIELDS = [
  "EngramClassName",
  "EngramHidden",
  "EngramPointsCost",
  "EngramLevelRequirement",
  "RemoveEngramPreReq",
];

function parseOverride(value: UeValue): ArkEngramOverride | null {
  const engramClass = ueFieldText(value, "EngramClassName");
  if (!engramClass) return null;
  return {
    engramClass,
    hidden: ueBool(ueFieldText(value, "EngramHidden")),
    pointsCost: ueFieldText(value, "EngramPointsCost") ?? "",
    levelRequirement: ueFieldText(value, "EngramLevelRequirement") ?? "",
    removePrereq: ueBool(ueFieldText(value, "RemoveEngramPreReq")),
    extra: extraFields(value, OVERRIDE_FIELDS),
  };
}

function parseAutoUnlock(value: UeValue): ArkEngramAutoUnlock | null {
  const engramClass = ueFieldText(value, "EngramClassName");
  const level = ueFieldText(value, "LevelToAutoUnlock");
  if (!engramClass || level === undefined) return null;
  return {
    engramClass,
    level,
    extra: extraFields(value, ["EngramClassName", "LevelToAutoUnlock"]),
  };
}

export function readEngrams(doc: IniDocument) {
  const overrides = readEntries(doc, OVERRIDE_KEY, parseOverride);
  const autoUnlocks = readEntries(doc, AUTO_UNLOCK_KEY, parseAutoUnlock);
  const engrams: ArkEngramLists = {
    overrides: overrides.items,
    autoUnlocks: autoUnlocks.items,
    levelPoints: doc
      .getAll(GAME_SECTION, LEVEL_POINTS_KEY)
      .map((entry) => entry.value),
    onlyAllowSpecified:
      ueBool(doc.get(GAME_SECTION, ONLY_SPECIFIED_KEY)) ?? false,
  };
  return {
    engrams,
    unreadable: [...overrides.unreadable, ...autoUnlocks.unreadable],
  };
}

const optional = (text: string | undefined) =>
  text === undefined ? undefined : ueText(text);
const optionalBool = (value: boolean | null) =>
  value === null ? undefined : ueText(boolText(value));

/**
 * Points d'engramme, un par niveau dans l'ordre. Lignes vides en fin de
 * liste ignorées ; une ligne vide au milieu vaut 0 (sinon les niveaux
 * suivants seraient décalés).
 */
function levelPointLines(levelPoints: string[]): string[] {
  const lines = [...(levelPoints ?? [])];
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
  return lines.map(
    (points) =>
      `${LEVEL_POINTS_KEY}=${numberText(LEVEL_POINTS_KEY, points) ?? "0"}`,
  );
}

export function writeEngrams(
  doc: IniDocument,
  engrams: ArkEngramLists,
  unreadable: string[],
): void {
  const overrides = (engrams.overrides ?? []).flatMap((entry) => {
    const engramClass = classText(OVERRIDE_KEY, entry.engramClass);
    if (engramClass === undefined) return [];
    return [
      formatUeValue(
        withExtra(
          ueStruct([
            ["EngramClassName", ueText(engramClass, true)],
            ["EngramHidden", optionalBool(entry.hidden)],
            [
              "EngramPointsCost",
              optional(numberText(OVERRIDE_KEY, entry.pointsCost)),
            ],
            [
              "EngramLevelRequirement",
              optional(numberText(OVERRIDE_KEY, entry.levelRequirement)),
            ],
            ["RemoveEngramPreReq", optionalBool(entry.removePrereq)],
          ]),
          entry.extra,
        ),
      ),
    ];
  });
  writeEntries(doc, OVERRIDE_KEY, overrides, unreadable);

  const autoUnlocks = (engrams.autoUnlocks ?? []).flatMap((entry) => {
    const engramClass = classText(AUTO_UNLOCK_KEY, entry.engramClass);
    if (engramClass === undefined) return [];
    const level = numberText(AUTO_UNLOCK_KEY, entry.level) ?? "0";
    return [
      formatUeValue(
        withExtra(
          ueStruct([
            ["EngramClassName", ueText(engramClass, true)],
            ["LevelToAutoUnlock", ueText(level)],
          ]),
          entry.extra,
        ),
      ),
    ];
  });
  writeEntries(doc, AUTO_UNLOCK_KEY, autoUnlocks, unreadable);

  doc.replaceAll(
    GAME_SECTION,
    LEVEL_POINTS_KEY,
    levelPointLines(engrams.levelPoints),
  );

  if (engrams.onlyAllowSpecified) {
    doc.set(GAME_SECTION, ONLY_SPECIFIED_KEY, "True");
  } else {
    doc.remove(GAME_SECTION, ONLY_SPECIFIED_KEY);
  }
}
