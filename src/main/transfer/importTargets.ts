import { existsSync, readdirSync } from "fs";
import { basename, join, relative, resolve } from "path";
import type { GameType, ServerConfig } from "../../shared/types";
import type { IpcContext } from "../ipc/context";
import { getGameSavePath } from "../games/registry";
import { getGameTransferFiles } from "../games/transferFiles";
import { CONFIG_DIR } from "./serverArchive";

// Chemins Windows : insensibles à la casse, séparateurs et `\` final normalisés
const pathKey = (path: string) => resolve(path.trim()).toLowerCase();

/** Ce qu'un serveur lit et écrit : son dossier, son monde, ses fichiers de config. */
function serverTargets(
  gameType: GameType,
  serverPath: string,
  config: ServerConfig,
): string[] {
  return [
    serverPath,
    getGameSavePath(gameType, serverPath, config),
    ...getGameTransferFiles(gameType, serverPath, config).map(
      (file) => file.path,
    ),
  ].map(pathKey);
}

/**
 * Nom du serveur lancé qui utilise un des dossiers ou fichiers de l'import,
 * sinon null. Valheim : le `savedir` par défaut (listes, `worlds_local`) est
 * partagé par tous les serveurs qui ne le changent pas.
 */
export function runningServerUsing(
  ctx: IpcContext,
  gameType: GameType,
  serverPath: string,
  config: ServerConfig,
): string | null {
  const targets = new Set(serverTargets(gameType, serverPath, config));
  for (const { serverId, manager } of ctx.serverManagers.entries()) {
    const status = manager.getStatus();
    if (status === "stopped" || status === "crashed") continue;
    const server = ctx.servers
      .list()
      .find((candidate) => candidate.id === serverId);
    if (!server) continue;
    const theirs = serverTargets(
      server.gameType,
      server.path,
      ctx.getServerConfig(serverId),
    );
    if (theirs.some((t) => targets.has(t))) return server.name;
  }
  return null;
}

/** Fichiers de config du ZIP qui remplaceront un fichier déjà présent (avec `.backup`). */
export function existingConfigFiles(
  extractDir: string,
  gameType: GameType,
  serverPath: string,
  config: ServerConfig,
): string[] {
  return getGameTransferFiles(gameType, serverPath, config)
    .filter((file) => {
      if (
        !existsSync(join(extractDir, CONFIG_DIR, file.key)) ||
        !existsSync(file.path)
      )
        return false;
      return !file.isDirectory || readdirSync(file.path).length > 0;
    })
    .map((file) =>
      file.isDirectory ? relative(serverPath, file.path) : basename(file.path),
    );
}
