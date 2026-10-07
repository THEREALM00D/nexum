import { useCallback, useEffect, useState } from "react";
import type { LogSession } from "@shared/types";
import { useServer } from "../../../context/ServerContext";

// Au-delà, une session passée n'affiche que ses dernières lignes (un fichier
// peut faire 20 Mo) ; Copier / Enregistrer exportent toujours le fichier entier.
export const MAX_DISPLAYED_LINES = 2000;

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
    window.api.logs
      .readSession(selected, serverId)
      .then((text) => setPastLines(text.split(/\r?\n/).filter(Boolean)))
      .catch(() => setPastLines([]));
  }, [selected, serverId]);

  /** Texte complet à exporter : fichier de la session choisie ou en cours. */
  const loadFullLog = useCallback(async (): Promise<string> => {
    const file = selected ?? sessions.find((s) => s.current)?.name;
    if (file && serverId) return window.api.logs.readSession(file, serverId);
    return state.logs.join("\n");
  }, [selected, sessions, serverId, state.logs]);

  const displayed = selected
    ? pastLines.slice(-MAX_DISPLAYED_LINES)
    : state.logs;

  return {
    sessions,
    selected,
    setSelected,
    refresh,
    displayed,
    truncated: selected !== null && pastLines.length > MAX_DISPLAYED_LINES,
    loadFullLog,
    openDir: () => serverId && window.api.logs.openDir(serverId),
  };
}
