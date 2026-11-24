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
  isClassName,
  numberText,
  readEntries,
  ueBool,
  writeEntries,
} from "./listEntries";

// Engrammes par nom de classe. OverrideEngramEntries (par index) n'est pas
// édité ici : il reste tel quel (éditeur brut).
const OVERRIDE_KEY = "OverrideNamedEngramEntries";
const AUTO_UNLOCK_KEY = "EngramEntryAutoUnlocks";
const LEVEL_POINTS_KEY = "OverridePlayerLevelEngramPoints";
const ONLY_SPECIFIED_KEY = "bOnlyAllowSpecifiedEngrams";

function parseOverride(value: UeValue): ArkEngramOverride | null {
  const engramClass = ueFieldText(value, "EngramClassName");
  if (!engramClass) return null;
  return {
    engramClass,
    hidden: ueBool(ueFieldText(value, "EngramHidden")),
    pointsCost: ueFieldText(value, "EngramPointsCost") ?? "",
    levelRequirement: ueFieldText(value, "EngramLevelRequirement") ?? "",
    removePrereq: ueBool(ueFieldText(value, "RemoveEngramPreReq")),
  };
}

function parseAutoUnlock(value: UeValue): ArkEngramAutoUnlock | null {
  const engramClass = ueFieldText(value, "EngramClassName");
  const level = ueFieldText(value, "LevelToAutoUnlock");
  return engramClass && level !== undefined ? { engramClass, level } : null;
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

export function writeEngrams(
  doc: IniDocument,
  engrams: ArkEngramLists,
  unreadable: string[],
): void {
  const overrides = engrams.overrides.flatMap((entry) => {
    if (!isClassName(entry.engramClass)) return [];
    return [
      formatUeValue(
        ueStruct([
          ["EngramClassName", ueText(entry.engramClass.trim(), true)],
          ["EngramHidden", optionalBool(entry.hidden)],
          ["EngramPointsCost", optional(numberText(entry.pointsCost))],
          [
            "EngramLevelRequirement",
            optional(numberText(entry.levelRequirement)),
          ],
          ["RemoveEngramPreReq", optionalBool(entry.removePrereq)],
        ]),
      ),
    ];
  });
  writeEntries(doc, OVERRIDE_KEY, overrides, unreadable);

  const autoUnlocks = engrams.autoUnlocks.flatMap((entry) => {
    const level = numberText(entry.level);
    if (!isClassName(entry.engramClass) || level === undefined) return [];
    return [
      formatUeValue(
        ueStruct([
          ["EngramClassName", ueText(entry.engramClass.trim(), true)],
          ["LevelToAutoUnlock", ueText(level)],
        ]),
      ),
    ];
  });
  writeEntries(doc, AUTO_UNLOCK_KEY, autoUnlocks, unreadable);

  // Un point par niveau, dans l'ordre. Lignes vides ignorées ; une valeur
  // invalide garde sa place (0) pour ne pas décaler les niveaux suivants.
  doc.replaceAll(
    GAME_SECTION,
    LEVEL_POINTS_KEY,
    engrams.levelPoints
      .filter((points) => points.trim() !== "")
      .map((points) => `${LEVEL_POINTS_KEY}=${numberText(points) ?? "0"}`),
  );

  if (engrams.onlyAllowSpecified)
    doc.set(GAME_SECTION, ONLY_SPECIFIED_KEY, "True");
  else doc.remove(GAME_SECTION, ONLY_SPECIFIED_KEY);
}
