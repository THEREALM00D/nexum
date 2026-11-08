// Palette des serveurs (main : couleur par défaut, migration ; renderer :
// choix de couleur). Ni vert, ni orange, ni rouge : ce sont les couleurs de
// statut. Texte Ink sur chaque couleur : contraste de 6,3:1 à 10,5:1.
export const SERVER_COLORS: readonly string[] = [
  "#5B9CF5",
  "#818CF8",
  "#B48CF2",
  "#F472B6",
  "#22D3EE",
  "#D4B483",
  "#94A3B8",
];

const channels = (hex: string): number[] =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

export function isServerColor(hex: string): boolean {
  return SERVER_COLORS.some((c) => c.toLowerCase() === hex.toLowerCase());
}

/** Couleur de la palette la plus proche (distance RVB). */
export function closestServerColor(hex: string): string {
  const from = channels(hex);
  if (hex.length !== 7 || from.some(Number.isNaN)) return SERVER_COLORS[0];
  const distance = (color: string) =>
    channels(color).reduce((sum, v, i) => sum + (v - from[i]) ** 2, 0);
  return SERVER_COLORS.reduce((best, c) =>
    distance(c) < distance(best) ? c : best,
  );
}
