import { join, relative, sep } from "path";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "fs";
import type { IpcContext } from "../../ipc/context";
import { getGameTransferFiles } from "../../games/transferFiles";

/** Fichiers de config d'un serveur, par nom dans une copie (`key` ou `key/chemin`). */
export type ConfigSnapshot = Map<string, Buffer>;

// Garde-fou : un dossier de config de mods anormalement gros n'est pas
// recopié à chaque sauvegarde (BepInEx/config fait quelques Ko d'habitude).
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Les fichiers de config du jeu (mêmes que « Changer de PC »). */
export function configTargets(ctx: IpcContext, serverId: string) {
  const server = ctx.servers.list().find((item) => item.id === serverId);
  const serverPath = ctx.getServerPath(serverId);
  if (!server || !serverPath) return [];
  return getGameTransferFiles(
    server.gameType,
    serverPath,
    ctx.getServerConfig(serverId),
  );
}

function readFolder(
  root: string,
  folder: string,
  key: string,
  snapshot: ConfigSnapshot,
): void {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) readFolder(root, path, key, snapshot);
    // `.backup` : copie laissée par backupBeforeWrite, pas de la config.
    else if (
      entry.isFile() &&
      !entry.name.endsWith(".backup") &&
      statSync(path).size <= MAX_FILE_BYTES
    ) {
      const name = relative(root, path).split(sep).join("/");
      snapshot.set(`${key}/${name}`, readFileSync(path));
    }
  }
}

/** Config actuelle du serveur (fichiers absents ignorés). */
export function readCurrentConfig(
  ctx: IpcContext,
  serverId: string,
): ConfigSnapshot {
  const snapshot: ConfigSnapshot = new Map();
  for (const target of configTargets(ctx, serverId)) {
    if (!existsSync(target.path)) continue;
    if (target.isDirectory)
      readFolder(target.path, target.path, target.key, snapshot);
    else if (statSync(target.path).size <= MAX_FILE_BYTES)
      snapshot.set(target.key, readFileSync(target.path));
  }
  return snapshot;
}

/** Fichiers d'une copie (dossier), par nom relatif avec « / ». */
export function readSnapshotFolder(folder: string): ConfigSnapshot {
  const snapshot: ConfigSnapshot = new Map();
  if (!existsSync(folder)) return snapshot;
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile())
        snapshot.set(
          relative(folder, path).split(sep).join("/"),
          readFileSync(path),
        );
    }
  };
  walk(folder);
  return snapshot;
}

export function sameSnapshot(first: ConfigSnapshot, second: ConfigSnapshot) {
  if (first.size !== second.size) return false;
  for (const [name, content] of first)
    if (!second.get(name)?.equals(content)) return false;
  return true;
}

/** Noms dont le contenu diffère entre deux copies (ajoutés et retirés compris). */
export function changedFiles(
  newer: ConfigSnapshot,
  older: ConfigSnapshot | null,
): string[] {
  if (!older) return [...newer.keys()];
  const names = new Set([...newer.keys(), ...older.keys()]);
  return [...names].filter(
    (name) => !newer.get(name)?.equals(older.get(name) ?? Buffer.alloc(0)),
  );
}

/**
 * Chemin réel d'un nom de copie (`key` ou `key/chemin` d'un dossier), null
 * si la clé n'est plus une cible du jeu ou si le chemin sort du dossier.
 */
export function targetPathOf(
  ctx: IpcContext,
  serverId: string,
  name: string,
): string | null {
  const [key, ...rest] = name.split("/");
  const target = configTargets(ctx, serverId).find((item) => item.key === key);
  if (!target) return null;
  if (!target.isDirectory) return rest.length === 0 ? target.path : null;
  if (rest.length === 0 || rest.some((part) => part === ".." || part === ""))
    return null;
  return join(target.path, ...rest);
}

export const ensureFolder = (folder: string) =>
  mkdirSync(folder, { recursive: true });
