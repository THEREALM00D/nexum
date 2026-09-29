import { existsSync } from "fs";
import { join } from "path";
import type { GameType } from "../../shared/types";
import { getGameServerConfig } from "../games/registry";

// Ordre de détection — l'exécutable attendu vient de `exeName` dans chaque
// `games/<jeu>/serverConfig.ts` (source unique).
const GAME_TYPES: GameType[] = ["palworld", "valheim", "astroneer"];

export function hasExpectedExe(path: string, gameType: GameType): boolean {
  return existsSync(join(path, getGameServerConfig(gameType).exeName));
}

/**
 * Devine le type de jeu d'un dossier serveur existant en cherchant son
 * exécutable à la racine — permet d'importer un serveur déjà installé sans
 * repasser par le flow SteamCMD.
 */
export function detectGameType(path: string): GameType | null {
  return GAME_TYPES.find((g) => hasExpectedExe(path, g)) ?? null;
}
