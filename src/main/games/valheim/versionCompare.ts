/**
 * Compare deux versions de mods (`Majeur.Mineur.Patch`, format imposé par
 * Thunderstore et Hexium). Négatif si `a < b`, 0 si égales, positif si `a > b`.
 * Les parties absentes valent 0 ; une partie non numérique se compare comme
 * du texte (jamais vu en pratique, mais pas de plantage).
 */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(".");
  const pb = b.split(".");
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? "0";
    const y = pb[i] ?? "0";
    const nx = Number(x);
    const ny = Number(y);
    const diff =
      Number.isFinite(nx) && Number.isFinite(ny) ? nx - ny : x.localeCompare(y);
    if (diff !== 0) return diff;
  }
  return 0;
}
