import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import extractZip from "extract-zip";
import type {
  ServerArchiveImportChoice,
  ServerArchiveImportResult,
  ServerArchivePreview,
  ServerImportConflicts,
  TransferServerPaths,
} from "../../shared/types";
import type { IpcContext } from "../ipc/context";
import { getGameSavePath } from "../games/registry";
import {
  getGameTransferFiles,
  parseGameTransferMods,
  restoreGameTransferMods,
} from "../games/transferFiles";
import { AppError } from "../utils/appError";
import { CONFIG_DIR, MANIFEST, WORLD_DIR } from "./serverArchive";
import { existingConfigFiles, runningServerUsing } from "./importTargets";
import { copyWithBackup, copyWorld, writeFailed } from "./importFiles";
import {
  SERVER_FORMAT,
  checkHeader,
  configWithPaths,
  entryPaths,
  parseJson,
  parseServerEntry,
} from "./transferFormat";

// ZIP extrait ici entre l'aperçu et l'import (le dialogue laisse choisir les
// dossiers). Vidé à l'import, à l'annulation et au démarrage de Nexum.
const tempRoot = (ctx: IpcContext) =>
  join(ctx.app.getPath("userData"), "transfer-tmp");

const TOKEN = /^[0-9a-f-]{36}$/;
function tokenDir(ctx: IpcContext, token: string): string {
  // Le jeton revient du renderer : jamais un chemin arbitraire à supprimer
  if (!TOKEN.test(token)) throw new AppError("TRANSFER_FILE_INVALID");
  const extractDir = join(tempRoot(ctx), token);
  if (!existsSync(extractDir)) throw new AppError("TRANSFER_FILE_INVALID");
  return extractDir;
}

export function clearTransferTmp(ctx: IpcContext): void {
  rmSync(tempRoot(ctx), { recursive: true, force: true });
}

export function cancelServerImport(ctx: IpcContext, token: string): void {
  if (TOKEN.test(token))
    rmSync(join(tempRoot(ctx), token), { recursive: true, force: true });
}

function readManifest(extractDir: string) {
  const manifestPath = join(extractDir, MANIFEST);
  if (!existsSync(manifestPath)) throw new AppError("TRANSFER_FILE_INVALID");
  const root = checkHeader(
    parseJson(readFileSync(manifestPath, "utf-8")),
    SERVER_FORMAT,
  );
  const entry = parseServerEntry(root);
  return {
    entry,
    exportedAt: Number(root.exportedAt) || 0,
    includesPasswords: root.includesPasswords === true,
    mods: parseGameTransferMods(entry.server.gameType, root.mods),
  };
}

const entries = (folder: string): string[] =>
  existsSync(folder) ? readdirSync(folder) : [];

export async function previewServerArchive(
  ctx: IpcContext,
  zipPath: string,
): Promise<ServerArchivePreview> {
  const token = randomUUID();
  const extractDir = join(tempRoot(ctx), token);
  mkdirSync(extractDir, { recursive: true });
  try {
    // extract-zip refuse les chemins qui sortent du dossier (« zip slip »)
    await extractZip(zipPath, { dir: extractDir });
    const { entry, exportedAt, includesPasswords, mods } =
      readManifest(extractDir);
    return {
      token,
      name: entry.server.name,
      gameType: entry.server.gameType,
      exportedAt,
      includesPasswords,
      hasWorld: entries(join(extractDir, WORLD_DIR)).length > 0,
      configFiles: entries(join(extractDir, CONFIG_DIR)).length,
      mods: mods.length,
      paths: entryPaths(entry),
    };
  } catch (error) {
    rmSync(extractDir, { recursive: true, force: true });
    // ZIP illisible (pas un ZIP, tronqué) : même message qu'un manifest faux
    if (error instanceof AppError) throw error;
    throw new AppError("TRANSFER_FILE_INVALID");
  }
}

/** Ce que l'import toucherait dans ces dossiers (dialogue, avant l'import). */
export function serverImportConflicts(
  ctx: IpcContext,
  token: string,
  paths: TransferServerPaths,
): ServerImportConflicts {
  const extractDir = tokenDir(ctx, token);
  const { entry } = readManifest(extractDir);
  const { gameType } = entry.server;
  const serverPath = paths.path.trim();
  const config = configWithPaths(entry.config, paths);
  const savePath = getGameSavePath(gameType, serverPath, config);
  return {
    world: entries(join(extractDir, WORLD_DIR)).some((name) =>
      existsSync(join(savePath, name)),
    ),
    configFiles: existingConfigFiles(extractDir, gameType, serverPath, config),
    runningServer: runningServerUsing(ctx, gameType, serverPath, config),
  };
}

/**
 * Fichiers copiés d'abord, serveur créé en dernier : un échec de copie ne
 * laisse pas de serveur à moitié importé (un nouvel essai en créerait un
 * second). Refusé si un serveur lancé utilise ces dossiers.
 */
export function importServerArchive(
  ctx: IpcContext,
  choice: ServerArchiveImportChoice,
): ServerArchiveImportResult {
  const extractDir = tokenDir(ctx, choice.token);
  const { entry, mods } = readManifest(extractDir);
  const { gameType } = entry.server;
  const serverPath = choice.paths.path.trim();
  const config = configWithPaths(entry.config, choice.paths);

  const running = runningServerUsing(ctx, gameType, serverPath, config);
  if (running) throw new AppError("TRANSFER_TARGET_RUNNING", { name: running });

  let world: ServerArchiveImportResult["world"];
  try {
    // Cibles recalculées pour ce jeu : un nom inconnu sous config/ est ignoré.
    // Avant le monde : le dossier des mondes d'Enshrouded se lit dans son JSON.
    for (const file of getGameTransferFiles(gameType, serverPath, config)) {
      const source = join(extractDir, CONFIG_DIR, file.key);
      if (existsSync(source)) copyWithBackup(source, file.path);
    }
    const savePath = getGameSavePath(gameType, serverPath, config);
    world = copyWorld(extractDir, savePath, choice.replaceWorld);
  } catch (error) {
    throw writeFailed(error);
  }

  const server = ctx.servers.create({
    ...entry.server,
    name: choice.name,
    path: serverPath,
  });
  try {
    ctx.updateServerConfig(server.id, config);
    restoreGameTransferMods(gameType, ctx.getModsDataDir(server.id), mods);
  } catch (error) {
    ctx.servers.delete(server.id);
    ctx.removeServerConfig(server.id);
    throw writeFailed(error);
  }
  rmSync(extractDir, { recursive: true, force: true });
  return { serverId: server.id, world, pendingMods: mods.length };
}
