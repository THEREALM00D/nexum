// Masquage des secrets d'un fichier de config avant de l'envoyer au renderer
// (vue des différences) : mots de passe, jetons, clés d'API, webhooks
// (réglages de mods BepInEx). Les valeurs ne quittent jamais le main.

const SECRET = /password|token|secret|webhook|api_?key/i;
const INI_KEY = /\b([\w.]+)(\s*=\s*)/g;
const JSON_PAIR = /("([^"\\\r\n]*)"\s*:\s*)"((?:[^"\\\r\n]|\\.)*)"/g;

/**
 * Reçoit la clé, la valeur et son rang parmi les clés du même nom ; renvoie
 * le texte affiché à la place de la valeur (jamais appelé pour une valeur vide).
 */
export type HideValue = (
  key: string,
  value: string,
  occurrence: number,
) => string;

/** Fin d'une valeur INI non entre guillemets : `,` ou `)` dans `(…)`, sinon la fin de ligne. */
function plainValueEnd(line: string, start: number): number {
  let depth = 0;
  for (let index = 0; index < start; index++) {
    if (line[index] === "(") depth++;
    else if (line[index] === ")") depth = Math.max(0, depth - 1);
  }
  if (depth === 0) return line.length;
  const stop = line.slice(start).search(/[,)]/);
  return stop < 0 ? line.length : start + stop;
}

/** Fin d'une valeur entre guillemets (guillemet fermant compris), `\"` géré. */
function quotedValueEnd(line: string, start: number): number {
  for (let index = start + 1; index < line.length; index++) {
    if (line[index] === "\\") index++;
    else if (line[index] === '"') return index + 1;
  }
  return line.length;
}

function maskIniLine(
  line: string,
  hide: HideValue,
  count: (key: string) => number,
): string {
  let result = "";
  let last = 0;
  INI_KEY.lastIndex = 0;
  for (let match = INI_KEY.exec(line); match; match = INI_KEY.exec(line)) {
    const key = match[1];
    const start = match.index + match[0].length;
    if (!SECRET.test(key) || start < last) continue;
    const quoted = line[start] === '"';
    const end = quoted
      ? quotedValueEnd(line, start)
      : plainValueEnd(line, start);
    const value = quoted
      ? line.slice(start + 1, end - 1)
      : line.slice(start, end).trimEnd();
    if (!value) continue;
    const shown = hide(key, value, count(key));
    result += line.slice(last, start) + (quoted ? `"${shown}"` : shown);
    last = quoted ? end : start + value.length;
    INI_KEY.lastIndex = last;
  }
  return result + line.slice(last);
}

/** Masque les secrets d'un texte INI ou JSON (`hide` décide du texte affiché). */
export function maskSecrets(text: string, hide: HideValue): string {
  const seen = new Map<string, number>();
  const count = (key: string) => {
    const lower = key.toLowerCase();
    const occurrence = seen.get(lower) ?? 0;
    seen.set(lower, occurrence + 1);
    return occurrence;
  };
  const json = text.replace(
    JSON_PAIR,
    (match, prefix: string, key: string, value: string) =>
      SECRET.test(key) && value
        ? `${prefix}"${hide(key, value, count(key))}"`
        : match,
  );
  return json
    .split("\n")
    .map((line) => maskIniLine(line, hide, count))
    .join("\n");
}

/** Valeurs des secrets d'un texte, par clé (sans casse) puis par rang. */
export function secretValues(text: string): Map<string, string[]> {
  const values = new Map<string, string[]>();
  maskSecrets(text, (key, value) => {
    const lower = key.toLowerCase();
    values.set(lower, [...(values.get(lower) ?? []), value]);
    return "";
  });
  return values;
}
