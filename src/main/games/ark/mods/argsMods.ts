import { parseModIds } from "./modIds";

// `-mods=1,2,3` et `-passivemods=4,5` écrits à la main dans les arguments
// perso (avant la page Mods, ou copiés d'un script). Sans casse, comme le
// serveur.
const MODS_ARG = /^-(mods|passivemods)=(.*)$/i;

/**
 * Sépare les `-mods=` et `-passivemods=` des arguments perso du reste. Les ID
 * invalides sont ignorés : un ID inconnu empêche le serveur de démarrer
 * (vérifié). Un ID déjà dans `-mods=` n'est pas repris en passif.
 */
export function splitArgsMods(customArgs: string): {
  ids: number[];
  passiveIds: number[];
  rest: string[];
} {
  const ids: number[] = [];
  const passiveIds: number[] = [];
  const rest: string[] = [];
  for (const arg of customArgs.trim().split(/\s+/).filter(Boolean)) {
    const match = arg.match(MODS_ARG);
    if (!match) {
      rest.push(arg);
      continue;
    }
    const target = match[1].toLowerCase() === "mods" ? ids : passiveIds;
    for (const id of parseModIds(match[2]).ids)
      if (!target.includes(id)) target.push(id);
  }
  return {
    ids,
    passiveIds: passiveIds.filter((id) => !ids.includes(id)),
    rest,
  };
}
