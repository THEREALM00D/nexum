import {
  createWriteStream,
  existsSync,
  readdirSync,
  renameSync,
  rmSync,
} from "fs";
import { join } from "path";
import type { IpcContext } from "../ipc/context";
import { getGameSavePath } from "../games/registry";
import {
  getGameTransferFiles,
  getGameTransferMods,
  getGameWorldFilter,
} from "../games/transferFiles";
import { AppError } from "../utils/appError";
import {
  SERVER_FORMAT,
  TRANSFER_VERSION,
  toServerEntry,
} from "./transferFormat";

/** Le ZIP lu à l'import : `manifest.json`, `world/`, `config/<key>`. */
export const MANIFEST = "manifest.json";
export const WORLD_DIR = "world";
export const CONFIG_DIR = "config";

/**
 * « Déplacer un serveur » : sa config Nexum, son monde, les fichiers de
 * config du jeu et (Valheim) les codes de ses mods, dans un ZIP. Serveur
 * arrêté seulement : un monde copié pendant une écriture du jeu serait
 * incohérent (même règle que la restauration d'une sauvegarde).
 */
export async function writeServerArchive(
  ctx: IpcContext,
  serverId: string,
  includePasswords: boolean,
  outPath: string,
): Promise<void> {
  const server = ctx.servers.list().find((s) => s.id === serverId);
  if (!server) throw new AppError("SERVER_NOT_FOUND", { id: serverId });
  const status = ctx.serverManagers
    .entries()
    .find((e) => e.serverId === serverId)
    ?.manager.getStatus();
  if (status && status !== "stopped" && status !== "crashed")
    throw new AppError("STOP_BEFORE_EXPORT");

  const cfg = ctx.getServerConfig(serverId);
  const manifest = {
    format: SERVER_FORMAT,
    version: TRANSFER_VERSION,
    appVersion: ctx.app.getVersion(),
    exportedAt: Date.now(),
    includesPasswords: includePasswords,
    ...toServerEntry(server, cfg, includePasswords),
    mods: getGameTransferMods(
      server.gameType,
      server.path,
      ctx.getModsDataDir(serverId),
    ),
  };

  // archiver est ESM pur : import dynamique (voir BackupManager.create)
  const { ZipArchive } = await import("archiver");
  const archive = new ZipArchive({ zlib: { level: 6 } });
  archive.append(JSON.stringify(manifest, null, 2), { name: MANIFEST });

  const savePath = getGameSavePath(server.gameType, server.path, cfg);
  if (existsSync(savePath)) {
    const keep = getGameWorldFilter(server.gameType, cfg);
    for (const entry of readdirSync(savePath, { withFileTypes: true })) {
      if (!keep(entry.name)) continue;
      const src = join(savePath, entry.name);
      const name = `${WORLD_DIR}/${entry.name}`;
      if (entry.isDirectory()) archive.directory(src, name);
      else archive.file(src, { name });
    }
  }
  for (const f of getGameTransferFiles(server.gameType, server.path, cfg)) {
    if (!existsSync(f.path)) continue;
    const name = `${CONFIG_DIR}/${f.key}`;
    if (f.dir) archive.directory(f.path, name);
    else archive.file(f.path, { name });
  }

  // .tmp puis renommage : jamais de ZIP à moitié écrit sous le nom choisi
  const tempPath = `${outPath}.tmp`;
  try {
    await new Promise<void>((resolve, reject) => {
      const output = createWriteStream(tempPath);
      // "finish" est plus fiable que "close" sur Windows
      output.on("finish", resolve);
      output.on("error", reject);
      archive.on("error", reject);
      archive.pipe(output);
      archive.finalize();
    });
    renameSync(tempPath, outPath);
  } catch (err) {
    rmSync(tempPath, { force: true });
    throw err;
  }
}
