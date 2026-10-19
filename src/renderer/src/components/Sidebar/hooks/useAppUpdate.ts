import { useCallback, useEffect, useRef, useState } from "react";
import type { AppUpdateStatus } from "@shared/types";

// Durée minimale d'affichage de « Vérification… » après un clic : la réponse
// de GitHub arrive souvent en quelques centaines de ms, trop vite pour que
// l'utilisateur voie que son clic a été pris en compte.
const MIN_CHECKING_MS = 700;

/**
 * Suit le statut de l'auto-updater (electron-updater) : vérification faite
 * automatiquement au démarrage par le main process, téléchargement et
 * installation restent déclenchés depuis l'UI. Le statut initial est relu
 * dans le main (`getStatus`) : une vue montée après coup (page Paramètres)
 * affiche le vrai état.
 */
export function useAppUpdate() {
  const [currentVersion, setCurrentVersion] = useState("");
  const [status, setStatus] = useState<AppUpdateStatus>({ state: "idle" });
  // Vrai tant que la version et le statut du main ne sont pas lus : sinon
  // « v » vide et l'état « idle » s'affichent avant les vraies valeurs.
  const [loading, setLoading] = useState(true);
  const checkClickedAt = useRef(0);
  const latest = useRef<AppUpdateStatus>(status);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    Promise.all([
      window.api.update.getCurrentVersion().then(setCurrentVersion),
      window.api.update.getStatus().then((s) => {
        latest.current = s;
        setStatus(s);
      }),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
    const unsubscribe = window.api.update.onStatus((s) => {
      latest.current = s;
      const wait = checkClickedAt.current + MIN_CHECKING_MS - Date.now();
      if (s.state !== "checking" && wait > 0) {
        clearTimeout(timer);
        timer = setTimeout(() => setStatus(latest.current), wait);
      } else {
        setStatus(s);
      }
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const check = useCallback(() => {
    checkClickedAt.current = Date.now();
    void window.api.update.check();
  }, []);

  return {
    currentVersion,
    status,
    loading,
    check,
    // Les échecs remontent par le statut "error" (envoyé par le main).
    download: () => void window.api.update.download().catch(() => {}),
    install: () => void window.api.update.install(),
  };
}
