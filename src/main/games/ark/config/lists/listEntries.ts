import { GAME_SECTION } from "../../../../../shared/arkSettings";
import { AppError } from "../../../../utils/appError";
import type { IniDocument } from "../iniDocument";
import {
  formatUeValue,
  parseUeValue,
  type UeStruct,
  type UeValue,
} from "../ueStruct";

export interface ParsedEntries<Item> {
  items: Item[];
  /** Lignes complètes illisibles : réécrites telles quelles. */
  unreadable: string[];
}

const baseKeyOf = (line: string) =>
  line
    .slice(0, line.indexOf("="))
    .replace(/\[\d+\]$/, "")
    .trim()
    .toLowerCase();

/**
 * Entrées d'une clé de liste de Game.ini (`Key=(…)` répété). Une entrée
 * illisible n'est jamais perdue : elle est renvoyée pour être réécrite.
 */
export function readEntries<Item>(
  doc: IniDocument,
  key: string,
  parse: (value: UeValue) => Item | null,
): ParsedEntries<Item> {
  const items: Item[] = [];
  const unreadable: string[] = [];
  for (const entry of doc.getAll(GAME_SECTION, key)) {
    const value = parseUeValue(entry.value);
    const item = value ? parse(value) : null;
    if (item) items.push(item);
    else unreadable.push(`${entry.key}=${entry.value}`);
  }
  return { items, unreadable };
}

/** Remplace toutes les entrées d'une clé (illisibles, même `Key[n]=`, gardées à la fin). */
export function writeEntries(
  doc: IniDocument,
  key: string,
  values: string[],
  unreadable: string[] = [],
): void {
  const wanted = key.toLowerCase();
  const keep = unreadable.filter((line) => baseKeyOf(line) === wanted);
  doc.replaceAll(GAME_SECTION, key, [
    ...values.map((value) => `${key}=${value}`),
    ...keep,
  ]);
}

/**
 * Champs d'une structure que Nexum n'édite pas (`NPCsToSpawnPercentageChance`,
 * `ColorSets`…), gardés en texte pour être rattachés tels quels à
 * l'écriture : sinon les enregistrer depuis l'onglet Listes les effaçait.
 */
export function extraFields(
  value: UeValue,
  known: string[],
): string | undefined {
  if (Array.isArray(value) || value.kind !== "struct") return undefined;
  const lower = known.map((name) => name.toLowerCase());
  const fields = value.fields.filter(
    (field) => !lower.includes(field.name.toLowerCase()),
  );
  return fields.length > 0
    ? formatUeValue({ kind: "struct", fields })
    : undefined;
}

/** Ajoute à une structure les champs gardés par `extraFields`. */
export function withExtra(
  struct: UeStruct,
  extra: string | undefined,
): UeStruct {
  const parsed = extra ? parseUeValue(extra) : null;
  if (!parsed || Array.isArray(parsed) || parsed.kind !== "struct")
    return struct;
  return { kind: "struct", fields: [...struct.fields, ...parsed.fields] };
}

/** Booléen UE (True/False, sans casse), null si absent ou illisible. */
export function ueBool(text: string | undefined): boolean | null {
  if (text === undefined) return null;
  const lower = text.toLowerCase();
  return lower === "true" ? true : lower === "false" ? false : null;
}

export const boolText = (value: boolean) => (value ? "True" : "False");

/**
 * Nombre saisi (virgule décimale acceptée). Vide → undefined (champ non
 * écrit) ; invalide → erreur codée : jamais retiré en silence.
 */
export function numberText(field: string, value: string): string | undefined {
  const trimmed = (value ?? "").trim().replace(",", ".");
  if (trimmed === "") return undefined;
  if (!Number.isFinite(Number(trimmed))) {
    throw new AppError("ARK_SETTING_INVALID", { key: field, value });
  }
  return trimmed;
}

/** Nom de classe UE : lettres, chiffres, « _ » et « . » (sans guillemets). */
export const isClassName = (value: string) => /^[\w.]+$/.test(value.trim());

/**
 * Classe saisie : vide → undefined (ligne vide ignorée), invalide → erreur
 * codée plutôt qu'une entrée retirée en silence.
 */
export function classText(field: string, value: string): string | undefined {
  const trimmed = (value ?? "").trim();
  if (trimmed === "") return undefined;
  if (!isClassName(trimmed)) {
    throw new AppError("ARK_SETTING_INVALID", { key: field, value });
  }
  return trimmed;
}

/** Texte libre écrit entre guillemets : sans `"` (il fermerait la chaîne). */
export const quotedText = (value: string) =>
  (value ?? "").replace(/"/g, "").trim();
