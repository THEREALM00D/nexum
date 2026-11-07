/**
 * Lignes techniques d'un jeu masquées à l'écran (page Logs, en direct comme
 * pour une session passée). Le fichier de session reste BRUT et l'export
 * (Copier / Enregistrer) contient tout : seul l'affichage est allégé.
 *
 * Filtrer avant d'envoyer au renderer compte : le tampon d'affichage ne garde
 * que 500 lignes, et un bloc répété (Enshrouded : 4 lignes toutes les 30 s)
 * en chassait tout le démarrage en une heure.
 */

/** Bloc de plusieurs lignes à masquer, ouvert par `start`. */
export interface LogNoiseBlock {
  start: RegExp;
  /** Le bloc continue tant que les lignes suivantes correspondent. */
  body?: RegExp;
  /** Ou : le bloc se termine à cette ligne (incluse). */
  end?: RegExp;
  /** Garde-fou : jamais plus de lignes masquées d'affilée (fin jamais vue). */
  maxLines: number;
}

export interface LogNoiseRules {
  /** Lignes isolées à masquer. */
  lines: RegExp[];
  blocks: LogNoiseBlock[];
  /**
   * Messages connus que le jeu écrit sur stderr sans que ce soit une erreur
   * (Steam d'un serveur dédié) : écrits sans le préfixe `[ERR]`, donc pas en
   * rouge.
   */
  benignStderr: RegExp[];
}

// Horodatage ajouté par SessionLogStore aux lignes des fichiers de session.
const TIMESTAMP = /^\[\d{2}:\d{2}:\d{2}\] /;

const clean = (line: string) => line.replace(/\r$/, "").replace(TIMESTAMP, "");

/** Vrai si cette ligne de stderr est un message connu, pas une erreur. */
export function isBenignStderr(rules: LogNoiseRules, line: string): boolean {
  const text = clean(line);
  return rules.benignStderr.some((re) => re.test(text));
}

/**
 * Filtre à état (les blocs couvrent plusieurs lignes) : en créer un par
 * session. Renvoie vrai si la ligne doit être masquée.
 */
export function createNoiseFilter(
  rules: LogNoiseRules | undefined,
): (line: string) => boolean {
  if (!rules) return () => false;
  let block: LogNoiseBlock | null = null;
  let hidden = 0;

  return (line) => {
    const text = clean(line);
    if (block) {
      const current: LogNoiseBlock = block;
      if (hidden >= current.maxLines) {
        block = null;
      } else if (current.end) {
        hidden++;
        if (current.end.test(text)) block = null;
        return true;
      } else if (current.body?.test(text)) {
        hidden++;
        return true;
      } else {
        block = null;
      }
    }
    const opened = rules.blocks.find((b) => b.start.test(text));
    if (opened) {
      block = opened;
      hidden = 0;
      return true;
    }
    return rules.lines.some((re) => re.test(text));
  };
}

/** Lignes d'un fichier de session, sans les lignes techniques du jeu. */
export function filterNoise(
  rules: LogNoiseRules | undefined,
  text: string,
): string {
  if (!rules) return text;
  const hide = createNoiseFilter(rules);
  return text
    .split("\n")
    .filter((line) => !hide(line))
    .join("\n");
}
