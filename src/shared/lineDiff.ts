export type DiffLineKind = "same" | "removed" | "added";

export interface DiffLine {
  kind: DiffLineKind;
  text: string;
}

/**
 * Au-delà (lignes restantes après le début et la fin communs), pas de LCS :
 * tout l'ancien retiré, tout le nouveau ajouté. 4 M cases = 16 Mo.
 */
const MAX_CELLS = 4_000_000;

const linesOf = (text: string | null) =>
  text === null
    ? []
    : text.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n");

/** Plus longue sous-suite commune de deux blocs de lignes, en lignes de diff. */
function lcsDiff(old: string[], now: string[]): DiffLine[] {
  if (old.length * now.length > MAX_CELLS)
    return [
      ...old.map((text): DiffLine => ({ kind: "removed", text })),
      ...now.map((text): DiffLine => ({ kind: "added", text })),
    ];
  // lengths[oldIndex * width + nowIndex] = LCS de old[oldIndex..] et now[nowIndex..].
  const width = now.length + 1;
  const lengths = new Uint32Array((old.length + 1) * width);
  for (let oldIndex = old.length - 1; oldIndex >= 0; oldIndex--)
    for (let nowIndex = now.length - 1; nowIndex >= 0; nowIndex--)
      lengths[oldIndex * width + nowIndex] =
        old[oldIndex] === now[nowIndex]
          ? lengths[(oldIndex + 1) * width + nowIndex + 1] + 1
          : Math.max(
              lengths[(oldIndex + 1) * width + nowIndex],
              lengths[oldIndex * width + nowIndex + 1],
            );
  const result: DiffLine[] = [];
  let oldIndex = 0;
  let nowIndex = 0;
  while (oldIndex < old.length && nowIndex < now.length) {
    if (old[oldIndex] === now[nowIndex]) {
      result.push({ kind: "same", text: old[oldIndex] });
      oldIndex++;
      nowIndex++;
    } else if (
      lengths[(oldIndex + 1) * width + nowIndex] >=
      lengths[oldIndex * width + nowIndex + 1]
    )
      result.push({ kind: "removed", text: old[oldIndex++] });
    else result.push({ kind: "added", text: now[nowIndex++] });
  }
  while (oldIndex < old.length)
    result.push({ kind: "removed", text: old[oldIndex++] });
  while (nowIndex < now.length)
    result.push({ kind: "added", text: now[nowIndex++] });
  return result;
}

/**
 * Diff ligne à ligne entre l'ancien et le nouveau texte (`null` = fichier
 * absent). Le début et la fin communs sont retirés avant la LCS : un gros
 * fichier de config où une ligne change ne coûte presque rien.
 */
export function diffLines(
  before: string | null,
  after: string | null,
): DiffLine[] {
  const old = linesOf(before);
  const now = linesOf(after);
  let start = 0;
  while (start < old.length && start < now.length && old[start] === now[start])
    start++;
  let end = 0;
  while (
    end < old.length - start &&
    end < now.length - start &&
    old[old.length - 1 - end] === now[now.length - 1 - end]
  )
    end++;
  const same = (text: string): DiffLine => ({ kind: "same", text });
  return [
    ...old.slice(0, start).map(same),
    ...lcsDiff(
      old.slice(start, old.length - end),
      now.slice(start, now.length - end),
    ),
    ...old.slice(old.length - end).map(same),
  ];
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
