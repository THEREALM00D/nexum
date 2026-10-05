import { useCallback, useLayoutEffect, useRef } from "react";

// Marge (px) sous laquelle on considère l'utilisateur « en bas » du log.
const BOTTOM_THRESHOLD = 24;

/**
 * Défilement automatique d'une zone de log vers la dernière ligne, seulement
 * si l'utilisateur y est déjà : remonter dans le log met le suivi en pause,
 * redescendre tout en bas le relance.
 *
 * Agit sur `scrollTop` du conteneur et jamais via `scrollIntoView`, qui fait
 * aussi défiler tous les parents (toute la page du Dashboard quand la fenêtre
 * est petite, ce qui cachait les boutons pendant le démarrage du serveur).
 *
 * `trigger` : valeur qui change à chaque nouvelle ligne (le tableau de logs).
 */
export function useStickToBottom(trigger: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    atBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && atBottom.current) el.scrollTop = el.scrollHeight;
  }, [trigger]);

  return { ref, onScroll };
}
