import { useEffect, useState } from "react";
import type { ValheimWorldInfo } from "@shared/types";

/**
 * Scanne worlds_local (défaut ou savedir custom) pour proposer les mondes
 * déjà présents sur disque — utile pour importer un serveur déjà installé
 * sans retaper le nom exact du monde.
 */
export function useExistingWorlds(savedir: string): ValheimWorldInfo[] {
  const [worlds, setWorlds] = useState<ValheimWorldInfo[]>([]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      window.api.valheim
        .listExistingWorlds(savedir)
        .then((list) => {
          if (!cancelled) setWorlds(list);
        })
        .catch(() => {
          if (!cancelled) setWorlds([]);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [savedir]);

  return worlds;
}
