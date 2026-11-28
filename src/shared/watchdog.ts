// Surveillance d'un serveur (dialogue du serveur, transfert entre PC) :
// bornes et valeurs proposées, partagées par le main et le renderer.

/** Minutes avant de relancer un démarrage bloqué (1er démarrage d'ARK avec mods : long). */
export const DEFAULT_STUCK_MINUTES = 20;
export const STUCK_MINUTES_RANGE = [1, 120] as const;
export const RAM_LIMIT_RANGE = [1, 512] as const;

/**
 * Limite de RAM proposée : 2 × la RAM conseillée du jeu (ARK ~10 Go au repos :
 * une limite sous sa consommation normale le redémarrait en boucle), sinon
 * 16 Go.
 */
export function defaultRamLimitGb(recommendedGb: number | undefined): number {
  if (!recommendedGb) return 16;
  return Math.min(RAM_LIMIT_RANGE[1], recommendedGb * 2);
}

/** Entier dans les bornes (valeur lue d'un fichier ou d'un formulaire). */
export function inWatchdogRange(
  value: unknown,
  [min, max]: readonly [number, number],
): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  );
}
