import { join } from "path";
import type {
  ArkCraftingCost,
  ArkEngramLists,
  ArkGameLists,
  ArkListName,
  ArkPerLevelStats,
  ArkSpawnLists,
  ArkStackSize,
} from "../../../../../shared/types";
import { GAME_INI_REL_PATH } from "../../gameUserSettingsIni";
import { readArkIni, writeArkIni } from "../arkIniFile";
import { readEngrams, writeEngrams } from "./engrams";
import { writeSpawns } from "./spawns";
import { readSpawns } from "./spawnsRead";
import { readCraftingCosts, writeCraftingCosts } from "./craftingCosts";
import {
  readStackSizes,
  readStats,
  writeStackSizes,
  writeStats,
} from "./statsAndStacks";

const gameIniPath = (serverPath: string) => join(serverPath, GAME_INI_REL_PATH);

/** Les listes éditables de Game.ini, et les entrées illisibles. */
export function readGameLists(serverPath: string): ArkGameLists {
  const { doc } = readArkIni(gameIniPath(serverPath));
  const stacks = readStackSizes(doc);
  const engrams = readEngrams(doc);
  const spawns = readSpawns(doc);
  const craftingCosts = readCraftingCosts(doc);
  return {
    stats: readStats(doc),
    stackSizes: stacks.items,
    engrams: engrams.engrams,
    spawns: spawns.spawns,
    craftingCosts: craftingCosts.items,
    unreadable: [
      ...stacks.unreadable,
      ...engrams.unreadable,
      ...spawns.unreadable,
      ...craftingCosts.unreadable,
    ],
  };
}

/**
 * Remplace une liste dans Game.ini (copie `.backup` avant). Les entrées
 * illisibles du fichier sont relues ici et réécrites telles quelles : le
 * renderer ne les renvoie pas.
 */
export function writeGameList(
  serverPath: string,
  list: ArkListName,
  data: unknown,
): void {
  const path = gameIniPath(serverPath);
  const file = readArkIni(path);
  const { doc } = file;
  switch (list) {
    case "stats":
      writeStats(doc, data as ArkPerLevelStats);
      break;
    case "stackSizes":
      writeStackSizes(
        doc,
        asArray<ArkStackSize>(data),
        readStackSizes(doc).unreadable,
      );
      break;
    case "engrams":
      writeEngrams(doc, data as ArkEngramLists, readEngrams(doc).unreadable);
      break;
    case "spawns":
      writeSpawns(doc, data as ArkSpawnLists, readSpawns(doc).unreadable);
      break;
    case "craftingCosts":
      writeCraftingCosts(
        doc,
        asArray<ArkCraftingCost>(data),
        readCraftingCosts(doc).unreadable,
      );
      break;
  }
  writeArkIni(path, file);
}

const asArray = <Item>(data: unknown): Item[] =>
  Array.isArray(data) ? (data as Item[]) : [];
