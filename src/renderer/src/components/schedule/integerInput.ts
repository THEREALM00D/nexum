// Champs nombre entier de la Planification. Un champ vidé garde `NaN` (pas
// de valeur de repli) : sinon il réaffichait aussitôt « 1 » et la saisie
// suivante donnait « 18 » au lieu de « 8 ». La valeur hors bornes bloque
// l'enregistrement (`isScheduleInvalid`).

/** Texte saisi → entier, ou `NaN` si le champ est vide. */
export function parseIntegerInput(text: string): number {
  return parseInt(text, 10);
}

/** Valeur affichée dans le champ : vide pour `NaN`. */
export function integerInputValue(value: number): number | "" {
  return Number.isNaN(value) ? "" : value;
}

export function isIntegerInRange(
  value: number,
  min: number,
  max: number,
): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}
