import { GAME_SECTION } from "../../../../../shared/arkSettings";
import type { IniDocument } from "../iniDocument";
import { parseUeValue, type UeValue } from "../ueStruct";

export interface ParsedEntries<Item> {
  items: Item[];
  /** Lignes complètes illisibles : réécrites telles quelles. */
  unreadable: string[];
}

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

/** Remplace toutes les entrées d'une clé (illisibles gardées à la fin). */
export function writeEntries(
  doc: IniDocument,
  key: string,
  values: string[],
  unreadable: string[] = [],
): void {
  const keep = unreadable.filter((line) =>
    line.toLowerCase().startsWith(`${key.toLowerCase()}=`),
  );
  doc.replaceAll(GAME_SECTION, key, [
    ...values.map((value) => `${key}=${value}`),
    ...keep,
  ]);
}

/** Booléen UE (True/False, sans casse), null si absent ou illisible. */
export function ueBool(text: string | undefined): boolean | null {
  if (text === undefined) return null;
  const lower = text.toLowerCase();
  return lower === "true" ? true : lower === "false" ? false : null;
}

export const boolText = (value: boolean) => (value ? "True" : "False");

/** Nombre saisi : gardé seulement s'il est valide. */
export function numberText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed !== "" && Number.isFinite(Number(trimmed))
    ? trimmed
    : undefined;
}

/** Nom de classe UE : lettres, chiffres, « _ » et « . » (sans guillemets). */
export const isClassName = (value: string) => /^[\w.]+$/.test(value.trim());
