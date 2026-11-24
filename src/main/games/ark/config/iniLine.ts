// Lecture d'une ligne d'INI d'ARK pour `IniDocument` : sections et clés en
// minuscules (le jeu ignore la casse), `Key[3]` gardé avec son index.

export const SECTION_RE = /^\s*\[([^\]]+)\]\s*$/;
export const ENTRY_RE = /^\s*([^;=\s][^=]*?)\s*=(.*)$/;
export const INDEX_RE = /^(.*?)\[(\d+)\]$/;

export interface Line {
  text: string;
  /** Section où se trouve la ligne (en minuscules), "" avant la 1re. */
  section: string;
  /** Clé complète (`Key` ou `Key[3]`), en minuscules ; null hors entrée. */
  key: string | null;
}

export interface IniEntry {
  /** Clé telle qu'écrite dans le fichier (casse et index compris). */
  key: string;
  /** Index de `Key[n]`, null pour une clé simple ou répétée. */
  index: number | null;
  value: string;
}

export const normalize = (name: string) => name.trim().toLowerCase();
export const baseKey = (key: string) =>
  normalize(key.match(INDEX_RE)?.[1] ?? key);

export function parseLine(text: string, section: string): Line {
  const header = text.match(SECTION_RE);
  if (header) return { text, section: normalize(header[1]), key: null };
  const entry = text.match(ENTRY_RE);
  return { text, section, key: entry ? normalize(entry[1]) : null };
}

/** Entrée d'une ligne `Key=valeur` (clé avec la casse du fichier). */
export function entryOf(text: string): IniEntry {
  const match = text.match(ENTRY_RE);
  const key = match?.[1] ?? "";
  const index = key.match(INDEX_RE);
  return {
    key,
    index: index ? Number(index[2]) : null,
    value: (match?.[2] ?? "").trim(),
  };
}
