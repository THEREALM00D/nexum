import type { IpcContext } from "../../ipc/context";
import type { ConfigFileDiff } from "../../../shared/types";
import { readConfigBackup } from "./configBackups";
import { readCurrentConfig } from "./configSnapshot";
import { maskPasswords } from "./maskPasswords";

// Au-delà, ou binaire : pas de comparaison ligne à ligne.
const MAX_DIFF_BYTES = 512 * 1024;

const textOf = (content: Buffer | undefined) =>
  content === undefined ? null : maskPasswords(content.toString("utf8"));
const isText = (content: Buffer | undefined) =>
  !content || (content.length <= MAX_DIFF_BYTES && !content.includes(0));

/**
 * Copie et config actuelle, fichier par fichier, mots de passe masqués ici :
 * ils n'arrivent jamais au renderer.
 */
export function diffConfigBackup(
  ctx: IpcContext,
  serverId: string,
  id: unknown,
): ConfigFileDiff[] {
  const backup = readConfigBackup(ctx, serverId, id);
  const current = readCurrentConfig(ctx, serverId);
  const names = [...new Set([...backup.keys(), ...current.keys()])].sort();
  return names.map((file) => {
    const before = backup.get(file);
    const now = current.get(file);
    const tooLarge = !isText(before) || !isText(now);
    return {
      file,
      backup: tooLarge ? null : textOf(before),
      current: tooLarge ? null : textOf(now),
      tooLarge,
    };
  });
}
