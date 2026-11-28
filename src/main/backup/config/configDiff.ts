import type { IpcContext } from "../../ipc/context";
import type { ConfigFileDiff } from "../../../shared/types";
import { lt } from "../../i18n/logStrings";
import { readConfigBackup } from "./configBackups";
import { readCurrentConfig } from "./configSnapshot";
import { maskSecrets, secretValues } from "./maskPasswords";

// Au-delà, ou binaire : pas de comparaison ligne à ligne.
const MAX_DIFF_BYTES = 512 * 1024;
const HIDDEN = "••••";

const isText = (content: Buffer | undefined) =>
  !content || (content.length <= MAX_DIFF_BYTES && !content.includes(0));

/**
 * Textes de la copie et de l'actuel, secrets masqués. ⚠️ Un secret changé
 * est marqué côté actuel (« •••• (modifié) ») : sinon les deux côtés
 * masqués étaient identiques et le changement disparaissait de la vue.
 */
function maskedPair(
  before: Buffer | undefined,
  now: Buffer | undefined,
): { backup: string | null; current: string | null } {
  const backupText = before?.toString("utf8") ?? null;
  const currentText = now?.toString("utf8") ?? null;
  const previous = secretValues(backupText ?? "");
  return {
    backup: backupText === null ? null : maskSecrets(backupText, () => HIDDEN),
    current:
      currentText === null
        ? null
        : maskSecrets(currentText, (key, value, occurrence) =>
            previous.get(key.toLowerCase())?.[occurrence] === value
              ? HIDDEN
              : `${HIDDEN} (${lt().secretChanged})`,
          ),
  };
}

/**
 * Copie et config actuelle, fichier par fichier, secrets masqués ici : ils
 * n'arrivent jamais au renderer.
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
    return tooLarge
      ? { file, backup: null, current: null, tooLarge }
      : { file, ...maskedPair(before, now), tooLarge };
  });
}
