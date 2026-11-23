import { isModId } from "../launchConfig";

// `-mods=1,2,3` écrit à la main dans les arguments perso (avant la page Mods,
// ou copié d'un script de lancement). Sans casse, comme le serveur.
const MODS_ARG = /^-mods=(.*)$/i;

/**
 * Sépare les `-mods=` des arguments perso du reste. Les ID invalides sont
 * ignorés : un ID inconnu empêche le serveur de démarrer (vérifié).
 */
export function splitArgsMods(customArgs: string): {
  ids: number[];
  rest: string[];
} {
  const ids: number[] = [];
  const rest: string[] = [];
  for (const arg of customArgs.trim().split(/\s+/).filter(Boolean)) {
    const match = arg.match(MODS_ARG);
    if (!match) {
      rest.push(arg);
      continue;
    }
    for (const part of match[1].split(",")) {
      const id = Number(part.trim());
      if (isModId(id) && !ids.includes(id)) ids.push(id);
    }
  }
  return { ids, rest };
}
