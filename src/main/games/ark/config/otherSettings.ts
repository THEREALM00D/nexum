import type { ArkUnknownSetting } from "../../../../shared/types";
import {
  ARK_SETTINGS,
  GAME_SECTION,
  GUS_SECTION,
  type ArkSettingDef,
} from "../../../../shared/arkSettings";
import type { ArkIniFile } from "./arkIniFile";
import {
  GENERAL_TAB_KEYS,
  LIST_EDITOR_KEYS,
  RAW_ONLY_LIST_KEYS,
} from "./listKeys";
import { isModSection } from "./modSections";

// Réglages « autres » de l'onglet Réglages de jeu : clés inconnues des
// sections du jeu (ajoutées par une mise à jour, écrites à la main) et clés
// des sections de mods ([ArkadeEssentials], [Shiny]…), un groupe par
// section. Les clés répétées ou indexées sont des listes : éditeur brut.

export type IniFileKind = "gus" | "game";

const GAME_SECTIONS: Record<IniFileKind, string> = {
  gus: GUS_SECTION,
  game: GAME_SECTION,
};

const lower = (keys: string[]) => new Set(keys.map((key) => key.toLowerCase()));
const catalogKeys = (file: IniFileKind) =>
  ARK_SETTINGS.filter((setting) => setting.file === file).map(
    (setting) => setting.key,
  );
const KNOWN_KEYS: Record<IniFileKind, Set<string>> = {
  gus: lower([...catalogKeys("gus"), ...GENERAL_TAB_KEYS]),
  game: lower([
    ...catalogKeys("game"),
    ...LIST_EDITOR_KEYS,
    ...RAW_ONLY_LIST_KEYS,
  ]),
};
// Sections du jeu : identifiant UE. Sections de mods : noms plus libres
// (`Mod.Option`, `Some-Key`), mais jamais `:` (séparateur des ids).
const GAME_KEY = /^[A-Za-z_][A-Za-z0-9_]*$/;
const MOD_KEY = /^[A-Za-z0-9_.-]+$/;

const isGameSection = (kind: IniFileKind, section: string) =>
  section.toLowerCase() === GAME_SECTIONS[kind].toLowerCase();

/** Clé modifiable comme « autre » dans cette section. */
function isOtherKey(kind: IniFileKind, section: string, key: string): boolean {
  if (isGameSection(kind, section)) {
    // ⚠️ Jamais une clé connue (catalogue sous une autre casse, onglet
    // Général, liste) : écrite en texte libre, elle échapperait à sa
    // validation ou effacerait une liste.
    return GAME_KEY.test(key) && !KNOWN_KEYS[kind].has(key.toLowerCase());
  }
  return isModSection(section) && MOD_KEY.test(key);
}

/** Réglages « autres » d'un fichier : section du jeu puis sections de mods. */
export function otherSettings(
  file: ArkIniFile,
  kind: IniFileKind,
): ArkUnknownSetting[] {
  const sections = [
    GAME_SECTIONS[kind],
    ...file.doc.sections().filter(isModSection),
  ];
  return sections.flatMap((section) =>
    file.doc.keys(section).flatMap((key) => {
      if (!isOtherKey(kind, section, key)) return [];
      if (file.doc.getAll(section, key).length > 1) return [];
      return [
        {
          id: `${kind}:${section}:${key}`,
          file: kind,
          section,
          key,
          value: file.doc.get(section, key) ?? "",
        },
      ];
    }),
  );
}

/** Définition d'un réglage « autre » d'après son id, null s'il n'en est pas un. */
export function otherSettingDef(id: string): ArkSettingDef | null {
  const [kind, ...rest] = id.split(":");
  const key = rest.pop() ?? "";
  const section = rest.join(":");
  if (kind !== "gus" && kind !== "game") return null;
  if (!isOtherKey(kind, section, key)) return null;
  return {
    key,
    file: kind,
    section,
    type: "string",
    default: "",
    group: "admin",
  };
}
