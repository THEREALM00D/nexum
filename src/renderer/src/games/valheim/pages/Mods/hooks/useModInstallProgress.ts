import { useEffect, useState } from "react";
import type { ModInstallProgress } from "@shared/types";
import { useServer } from "../../../../../context/ServerContext";

/**
 * Dernière progression envoyée par le main pendant une installation (mod,
 * BepInEx, profil, mods en attente, série) **sur le serveur de la page** :
 * une installation encore en cours sur un autre serveur est ignorée.
 * Effacée quand plus rien n'est en cours (`busy` faux), sinon l'installation
 * suivante commencerait par l'étape de la précédente.
 *
 * La position dans une série (`batch`) vient toujours du main, y compris
 * pour « Tout mettre à jour » (passée à `installMod`) : ⚠️ la tenir ici
 * faisait la course avec le premier événement du mod suivant.
 */
export function useModInstallProgress(
  busy: boolean,
): ModInstallProgress | null {
  const { state } = useServer();
  const activeServerId = state.activeServerId;
  const [progress, setProgress] = useState<ModInstallProgress | null>(null);

  useEffect(
    () =>
      window.api.valheim.mods.onProgress((received, serverId) => {
        if (serverId === activeServerId) setProgress(received);
      }),
    [activeServerId],
  );

  useEffect(() => {
    if (!busy) setProgress(null);
  }, [busy]);

  return progress;
}
