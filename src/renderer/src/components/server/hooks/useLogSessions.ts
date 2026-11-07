import { useCallback, useEffect, useState } from "react";
import type { LogSession } from "@shared/types";
import { useServer } from "../../../context/ServerContext";

/**
 * Sessions de log conservées sur disque pour le serveur actif. `selected` =
 * nom du fichier d'une session terminée affichée, ou null pour la vue en
 * direct (session en cours).
 */
export function useLogSessions() {
  const { state } = useServer();
  const serverId = state.activeServer?.id;
  const [sessions, setSessions] = useState<LogSession[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [pastLines, setPastLines] = useState<string[]>([]);

  const refresh = useCallback(() => {
    if (!serverId) return;
    window.api.logs
      .listSessions(serverId)
      .then(setSessions)
      .catch(() => setSessions([]));
  }, [serverId]);

  // Changement de serveur : retour à la vue en direct.
  useEffect(() => {
    setSelected(null);
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!selected || !serverId) return;
    // Vide d'abord : la liste s'ouvre en bas du NOUVEAU log, pas de l'ancien
    setPastLines([]);
    window.api.logs
      .readSession(selected, serverId, true)
      .then((text) => setPastLines(text.split(/\r?\n/).filter(Boolean)))
      .catch(() => setPastLines([]));
  }, [selected, serverId]);

  /** Texte complet à exporter : fichier de la session choisie ou en cours. */
  // Session en cours : liste relue à chaque export, car une longue session
  // change de fichier tous les 20 Mo (l'ancienne liste pointerait sur le
  // fichier précédent).
  const loadFullLog = useCallback(async (): Promise<string> => {
    if (!serverId) return state.logs.join("\n");
    const file =
      selected ??
      (await window.api.logs.listSessions(serverId).catch(() => [])).find(
        (s) => s.current,
      )?.name;
    if (file) return window.api.logs.readSession(file, serverId);
    return state.logs.join("\n");
  }, [selected, serverId, state.logs]);

  // Session passée affichée en entier (liste virtualisée, fichier de 20 Mo
  // au plus : une session plus longue est découpée en plusieurs fichiers).
  const displayed = selected ? pastLines : state.logs;

  return {
    sessions,
    selected,
    setSelected,
    refresh,
    displayed,
    loadFullLog,
    openDir: () => serverId && window.api.logs.openDir(serverId),
  };
}
