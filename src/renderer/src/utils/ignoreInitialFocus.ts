/**
 * À l'affichage de la fenêtre, Electron donne le focus au premier élément
 * atteignable, comme une tabulation : le bouton Réduire montrait son contour
 * clavier à chaque lancement. Ce focus-là est retiré tant que ni le clavier
 * ni la souris n'ont servi.
 */
export function ignoreInitialFocus(): void {
  const stop = () => {
    document.removeEventListener("focusin", onFocus, true);
    document.removeEventListener("keydown", stop, true);
    document.removeEventListener("pointerdown", stop, true);
  };
  const onFocus = (e: FocusEvent) => {
    stop();
    if (e.target instanceof HTMLElement) e.target.blur();
  };
  document.addEventListener("focusin", onFocus, true);
  document.addEventListener("keydown", stop, true);
  document.addEventListener("pointerdown", stop, true);
}
