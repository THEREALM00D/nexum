import { existsSync } from "fs";
import { dirname, isAbsolute, relative, resolve, sep } from "path";

/**
 * Dossier sur lequel ouvrir le sélecteur : le chemin du champ, résolu depuis
 * `basePath` s'il est relatif (`./savegame`), sinon son premier parent qui
 * existe (un dossier pas encore créé ouvrirait l'emplacement par défaut).
 */
export function startFolder(
  path: string | undefined,
  basePath?: string,
): string | undefined {
  const trimmed = path?.trim();
  if (!trimmed) return undefined;
  if (!isAbsolute(trimmed) && !basePath) return undefined;
  let current = basePath ? resolve(basePath, trimmed) : resolve(trimmed);
  while (!existsSync(current)) {
    const parent = dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
  return current;
}

/**
 * Dossier choisi réécrit relativement à `basePath` s'il est dedans
 * (`./savegame/sub`, séparateurs `/` comme le JSON d'Enshrouded), absolu sinon.
 */
export function relativeToBase(picked: string, basePath: string): string {
  const pickedPath = resolve(picked);
  // Sous Windows, `relative` compare sans casse et garde celle du chemin choisi
  const relativePath = relative(resolve(basePath), pickedPath);
  if (relativePath === "") return ".";
  const outside =
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath);
  if (outside) return pickedPath;
  return `./${relativePath.split(sep).join("/")}`;
}
