import { existsSync } from "fs";
import { join } from "path";
import type { GameType } from "../../shared/types";
import { GAME_TYPES, getGameServerConfig } from "../games/registry";

export function hasExpectedExe(path: string, gameType: GameType): boolean {
  return existsSync(join(path, getGameServerConfig(gameType).exeName));
}

/**
 * Devine le type de jeu d'un dossier serveur existant en cherchant son
 * exécutable à la racine (`exeName` de chaque `games/<jeu>/serverConfig.ts`,
 * source unique) — permet d'importer un serveur déjà installé sans repasser
 * par le flow SteamCMD. Les exe des serveurs diffèrent de ceux des clients
 * (RSDragonwildsServer.exe ≠ RSDragonwilds.exe) : le dossier du jeu lui-même
 * n'est pas pris pour un serveur.
 */
export function detectGameType(path: string): GameType | null {
  return GAME_TYPES.find((g) => hasExpectedExe(path, g)) ?? null;
}
