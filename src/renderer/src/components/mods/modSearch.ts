// Comparaison sans casse ni espaces/tirets/soulignés, comme la recherche de
// l'onglet Parcourir : « azu auto » trouve « Azumatt-AzuAutoStore ».
const normalize = (text: string) => text.toLowerCase().replace(/[\s\-_]+/g, "");

/** Chaque mot de la recherche apparaît dans un des textes (nom, auteur, ID…). */
export function matchesModSearch(texts: string[], query: string): boolean {
  const haystack = normalize(texts.join(" "));
  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(normalize(word)));
}
