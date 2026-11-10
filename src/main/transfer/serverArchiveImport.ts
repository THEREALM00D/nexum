import { randomUUID } from "crypto";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "fs";
import { join } from "path";
import extractZip from "extract-zip";
import type {
  PendingMod,
  ServerArchiveImportChoice,
  ServerArchiveImportResult,
  ServerArchivePreview,
  ServerConfig,
  TransferServerPaths,
} from "../../shared/types";
import type { IpcContext } from "../ipc/context";
import { getGameSavePath } from "../games/registry";
import { getGameTransferFiles } from "../games/transferFiles";
import { REGISTRIES } from "../games/valheim/registries";
import { writePendingMods } from "../games/valheim/pendingMods";
import { backupBeforeWrite } from "../utils/ini";
import { AppError } from "../utils/appError";
import { CONFIG_DIR, MANIFEST, WORLD_DIR } from "./serverArchive";
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
const tmpRoot = (ctx: IpcContext) =>
  join(ctx.app.getPath("userData"), "transfer-tmp");

const TOKEN = /^[0-9a-f-]{36}$/;
function tokenDir(ctx: IpcContext, token: string): string {
  // Le jeton revient du renderer : jamais un chemin arbitraire à supprimer
  if (!TOKEN.test(token)) throw new AppError("TRANSFER_FILE_INVALID");
  const dir = join(tmpRoot(ctx), token);
  if (!existsSync(dir)) throw new AppError("TRANSFER_FILE_INVALID");
  return dir;
}

export function clearTransferTmp(ctx: IpcContext): void {
  rmSync(tmpRoot(ctx), { recursive: true, force: true });
}

export function cancelServerImport(ctx: IpcContext, token: string): void {
  if (TOKEN.test(token))
    rmSync(join(tmpRoot(ctx), token), { recursive: true, force: true });
}

function parsePendingMods(raw: unknown): PendingMod[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((m) =>
    typeof m?.code === "string" && REGISTRIES.includes(m?.registry)
      ? [{ code: m.code, registry: m.registry, enabled: m.enabled !== false }]
      : [],
  );
}

function readManifest(dir: string) {
  const file = join(dir, MANIFEST);
  if (!existsSync(file)) throw new AppError("TRANSFER_FILE_INVALID");
  const root = checkHeader(
    parseJson(readFileSync(file, "utf-8")),
    SERVER_FORMAT,
  );
  return {
    entry: parseServerEntry(root),
    exportedAt: Number(root.exportedAt) || 0,
    includesPasswords: root.includesPasswords === true,
    mods: parsePendingMods(root.mods),
  };
}

const entries = (dir: string): string[] =>
  existsSync(dir) ? readdirSync(dir) : [];

export async function previewServerArchive(
  ctx: IpcContext,
  zipPath: string,
): Promise<ServerArchivePreview> {
  const token = randomUUID();
  const dir = join(tmpRoot(ctx), token);
  mkdirSync(dir, { recursive: true });
  try {
    // extract-zip refuse les chemins qui sortent du dossier (« zip slip »)
    await extractZip(zipPath, { dir });
    const { entry, exportedAt, includesPasswords, mods } = readManifest(dir);
    return {
      token,
      name: entry.server.name,
      gameType: entry.server.gameType,
      exportedAt,
      includesPasswords,
      hasWorld: entries(join(dir, WORLD_DIR)).length > 0,
      configFiles: entries(join(dir, CONFIG_DIR)).length,
      mods: mods.length,
      paths: entryPaths(entry),
    };
  } catch (err) {
    rmSync(dir, { recursive: true, force: true });
    // ZIP illisible (pas un ZIP, tronqué) : même message qu'un manifest faux
    if (err instanceof AppError) throw err;
    throw new AppError("TRANSFER_FILE_INVALID");
  }
}

/** Fichier ou dossier copié, avec `.backup` de tout fichier déjà présent. */
function copyWithBackup(src: string, dest: string): void {
  if (statSync(src).isDirectory()) {
    mkdirSync(dest, { recursive: true });
    for (const name of readdirSync(src))
      copyWithBackup(join(src, name), join(dest, name));
    return;
  }
  backupBeforeWrite(dest);
  copyFileSync(src, dest);
}

const targetSavePath = (
  gameType: ServerArchivePreview["gameType"],
  paths: TransferServerPaths,
  cfg: ServerConfig,
) => getGameSavePath(gameType, paths.path.trim(), configWithPaths(cfg, paths));

/** Des fichiers du monde importé existent déjà dans le dossier cible ? */
export function serverWorldConflict(
  ctx: IpcContext,
  token: string,
  paths: TransferServerPaths,
): boolean {
  const dir = tokenDir(ctx, token);
  const { entry } = readManifest(dir);
  const save = targetSavePath(entry.server.gameType, paths, entry.config);
  return entries(join(dir, WORLD_DIR)).some((n) => existsSync(join(save, n)));
}

export function importServerArchive(
  ctx: IpcContext,
  choice: ServerArchiveImportChoice,
): ServerArchiveImportResult {
  const dir = tokenDir(ctx, choice.token);
  const { entry, mods } = readManifest(dir);
  const { gameType } = entry.server;
  const serverPath = choice.paths.path.trim();
  const cfg = configWithPaths(entry.config, choice.paths);

  const server = ctx.servers.create({
    ...entry.server,
    name: choice.name,
    path: serverPath,
  });
  ctx.updateServerConfig(server.id, cfg);

  // Cibles recalculées pour ce jeu : un nom inconnu sous config/ est ignoré.
  // Avant le monde : le dossier des mondes d'Enshrouded se lit dans son JSON.
  for (const f of getGameTransferFiles(gameType, serverPath, cfg)) {
    const src = join(dir, CONFIG_DIR, f.key);
    if (existsSync(src)) copyWithBackup(src, f.path);
  }

  const worldEntries = entries(join(dir, WORLD_DIR));
  let world: ServerArchiveImportResult["world"] = "none";
  if (worldEntries.length > 0) {
    const save = getGameSavePath(gameType, serverPath, cfg);
    const conflict = worldEntries.some((n) => existsSync(join(save, n)));
    if (conflict && !choice.replaceWorld) {
      world = "skipped";
    } else {
      mkdirSync(save, { recursive: true });
      for (const n of worldEntries)
        cpSync(join(dir, WORLD_DIR, n), join(save, n), {
          recursive: true,
          force: true,
        });
      world = "copied";
    }
  }

  writePendingMods(ctx.getModsDataDir(server.id), mods);
  rmSync(dir, { recursive: true, force: true });
  return { serverId: server.id, world, pendingMods: mods.length };
}
