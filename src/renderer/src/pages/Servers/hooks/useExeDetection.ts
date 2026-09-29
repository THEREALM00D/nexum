import { useEffect, useState } from "react";
import type { GameType } from "@shared/types";

export type ExeStatus = "idle" | "checking" | "found" | "missing";

/**
 * Vérifie que l'exécutable attendu pour le jeu sélectionné existe bien au
 * chemin donné — permet de repérer une erreur de dossier/jeu avant de
 * valider (utile notamment pour importer un serveur déjà installé).
 */
export function useExeDetection(
  active: boolean,
  path: string,
  gameType: GameType,
): ExeStatus {
  const [status, setStatus] = useState<ExeStatus>("idle");

  useEffect(() => {
    if (!active || !path.trim()) {
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const found = await window.api.servers.hasExpectedExe(path, gameType);
        if (!cancelled) setStatus(found ? "found" : "missing");
      } catch {
        if (!cancelled) setStatus("idle");
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active, path, gameType]);

  return status;
}
