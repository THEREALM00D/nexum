export type DiffLineKind = "same" | "removed" | "added";

export interface DiffLine {
  kind: DiffLineKind;
  text: string;
}

/** Au-delà, pas de LCS (n × m cases) : tout l'ancien retiré, tout le nouveau ajouté. */
const MAX_CELLS = 4_000_000;

const linesOf = (text: string | null) =>
  text === null
    ? []
    : text.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n");

/**
 * Diff ligne à ligne (plus longue sous-suite commune) entre l'ancien et le
 * nouveau texte. Suffit pour des fichiers de config (quelques centaines de
 * lignes). `null` = fichier absent.
 */
export function diffLines(
  before: string | null,
  after: string | null,
): DiffLine[] {
  const old = linesOf(before);
  const now = linesOf(after);
  if (old.length * now.length > MAX_CELLS)
    return [
      ...old.map((text): DiffLine => ({ kind: "removed", text })),
      ...now.map((text): DiffLine => ({ kind: "added", text })),
    ];
  // lengths[i][j] = LCS de old[i..] et now[j..].
  const lengths = Array.from({ length: old.length + 1 }, () =>
    new Array<number>(now.length + 1).fill(0),
  );
  for (let i = old.length - 1; i >= 0; i--)
    for (let j = now.length - 1; j >= 0; j--)
      lengths[i][j] =
        old[i] === now[j]
          ? lengths[i + 1][j + 1] + 1
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < old.length && j < now.length) {
    if (old[i] === now[j]) {
      result.push({ kind: "same", text: old[i] });
      i++;
      j++;
    } else if (lengths[i + 1][j] >= lengths[i][j + 1])
      result.push({ kind: "removed", text: old[i++] });
    else result.push({ kind: "added", text: now[j++] });
  }
  while (i < old.length) result.push({ kind: "removed", text: old[i++] });
  while (j < now.length) result.push({ kind: "added", text: now[j++] });
  return result;
}

/** Nombre de blocs modifiés (lignes retirées ou ajoutées qui se suivent). */
export function countChanges(lines: DiffLine[]): number {
  let count = 0;
  let inChange = false;
  for (const line of lines) {
    const changed = line.kind !== "same";
    if (changed && !inChange) count++;
    inChange = changed;
  }
  return count;
}
