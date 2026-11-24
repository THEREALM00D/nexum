// Découpe d'une ligne de lancement d'ARK telle qu'on la trouve dans
// `ShooterGame.log` (`Commandline: …`), un .bat ou un collage. Formes vues
// sur de vraies installs : `"Astraeos_WP"?SessionName="[Freeport] Astraeos"
// -port=7777`, `"TheIsland_WP?listen?SessionName=Import Test A" -port=7790`,
// chemin de l'exe en tête, `-ClusterDirOverride="E:\…"`.

import { ARK_MAP_NAME } from "../launchConfig";

export interface QueryOption {
  key: string;
  /** null pour `?listen` (option sans `=`). */
  value: string | null;
}

export interface DashOption {
  /** Nom sans le `-`, tel qu'écrit. */
  name: string;
  value: string | null;
  /** Jeton complet, guillemets retirés (repris tel quel s'il est inconnu). */
  raw: string;
}

export interface ParsedLaunchLine {
  /** Carte telle qu'écrite ("" si la ligne n'en a pas). */
  map: string;
  query: QueryOption[];
  dash: DashOption[];
  /** Jetons ni carte ni `-option` (gardés comme arguments perso). */
  other: string[];
}

const EXE_NAME = /(^|[\\/])ArkAscendedServer(\.exe)?$/i;

/**
 * Jetons séparés par des espaces hors guillemets ; un guillemet regroupe
 * sans compter dans le jeton (`SessionName="A B"` → `SessionName=A B`).
 */
export function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quoted = false;
  let started = false;
  for (const char of line.replace(/[\r\n]+/g, " ")) {
    if (char === '"') {
      quoted = !quoted;
      started = true;
    } else if (/\s/.test(char) && !quoted) {
      if (started) tokens.push(current);
      current = "";
      started = false;
    } else {
      current += char;
      started = true;
    }
  }
  if (started) tokens.push(current);
  return tokens;
}

/** Arguments après l'exe s'il est sur la ligne (log, .bat), sinon tous. */
function serverArgs(tokens: string[]): string[] {
  const exeIndex = tokens.findIndex((token) => EXE_NAME.test(token.trim()));
  return exeIndex === -1 ? tokens : tokens.slice(exeIndex + 1);
}

/**
 * Ligne de script qui lance vraiment le serveur : l'exe suivi d'une carte
 * valide. Écarte `taskkill /IM ArkAscendedServer.exe`, `echo Starting
 * ArkAscendedServer`… qui précèdent souvent le lancement dans un .bat.
 */
export function launchesServer(line: string): boolean {
  const tokens = tokenize(line);
  if (!tokens.some((token) => EXE_NAME.test(token.trim()))) return false;
  return ARK_MAP_NAME.test(parseLaunchLine(line).map);
}

function splitOption(text: string): { key: string; value: string | null } {
  const equals = text.indexOf("=");
  return equals === -1
    ? { key: text.trim(), value: null }
    : { key: text.slice(0, equals).trim(), value: text.slice(equals + 1) };
}

export function parseLaunchLine(line: string): ParsedLaunchLine {
  const parsed: ParsedLaunchLine = { map: "", query: [], dash: [], other: [] };
  let mapSeen = false;
  for (const token of serverArgs(tokenize(line))) {
    if (token.startsWith("-")) {
      const { key, value } = splitOption(token.slice(1));
      parsed.dash.push({ name: key, value, raw: token });
    } else if (!mapSeen && token !== "") {
      // Carte + options `?` : toujours le 1er argument hors `-`.
      mapSeen = true;
      const [map, ...options] = token.split("?");
      parsed.map = map.trim();
      for (const option of options) {
        if (option.trim() !== "") parsed.query.push(splitOption(option));
      }
    } else if (token !== "") {
      parsed.other.push(token);
    }
  }
  return parsed;
}
