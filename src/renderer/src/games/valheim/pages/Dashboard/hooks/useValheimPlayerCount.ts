import { useMemo } from "react";

// Lignes émises par la session PlayFab à chaque connexion/déconnexion — elles
// n'existent qu'avec -crossplay, ex :
// `Session "X" with join code Y and IP Z is active with 0 player(s)`,
// `Player joined server "X" that has join code Y, now 1 player(s)`,
// `Player connection lost server "X" that has join code Y, now 1 player(s)`.
const PLAYER_COUNT_RE = /(?:is active with|now) (\d+) player/;

/**
 * Nombre de joueurs connectés : Odin-Eye en priorité (fiable crossplay ou non,
 * et même pour un serveur adopté dont les logs sont perdus), sinon dernière
 * valeur lue dans les logs crossplay. `null` si aucune source disponible.
 */
export function useValheimPlayerCount(
  logs: string[],
  odinEyeCount: number | null,
): number | null {
  const logCount = useMemo(() => {
    for (let i = logs.length - 1; i >= 0; i--) {
      const match = logs[i].match(PLAYER_COUNT_RE);
      if (match) return Number(match[1]);
    }
    return null;
  }, [logs]);

  return odinEyeCount ?? logCount;
}
