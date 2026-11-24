import {
  closeSync,
  existsSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  statSync,
} from "fs";
import { extname, join } from "path";
import type { ArkLaunchLineSource } from "../../../../shared/types";
import { AppError } from "../../../utils/appError";
import { launchesServer } from "./parseLaunchLine";

// ShooterGame.log écrit la ligne de commande complète au démarrage
// (`Commandline: …`, vérifié) : l'ancien serveur n'a pas besoin d'être
// relancé. Elle est dans les premières lignes : lecture du début seulement
// (un log peut faire des centaines de Mo).
const HEAD_BYTES = 512 * 1024;
const COMMAND_LINE = /Commandline:\s*(.+)$/m;
const LOG_FILE = /^ShooterGame(-backup-.*)?\.log$/i;
const SCRIPT_EXTENSIONS = [".bat", ".cmd"];

function readHead(path: string): string {
  const handle = openSync(path, "r");
  try {
    const buffer = Buffer.alloc(HEAD_BYTES);
    const length = readSync(handle, buffer, 0, HEAD_BYTES, 0);
    return buffer.subarray(0, length).toString("utf8");
  } finally {
    closeSync(handle);
  }
}

/** Date de modification, null si le fichier a disparu ou est illisible. */
function modifiedAt(path: string): number | null {
  try {
    return statSync(path).mtimeMs;
  } catch {
    return null;
  }
}

/**
 * Ligne du log le plus récent qui en contient une, null sinon. Un log
 * illisible (renommé par le serveur pendant la lecture) est sauté.
 */
export function launchLineFromLogs(
  serverPath: string,
): ArkLaunchLineSource | null {
  const logs = join(serverPath, "ShooterGame", "Saved", "Logs");
  if (!existsSync(logs)) return null;
  const files = readdirSync(logs)
    .filter((name) => LOG_FILE.test(name))
    .map((name) => ({
      path: join(logs, name),
      modifiedAt: modifiedAt(join(logs, name)),
    }))
    .filter((file): file is { path: string; modifiedAt: number } =>
      Number.isFinite(file.modifiedAt),
    )
    .sort((left, right) => right.modifiedAt - left.modifiedAt);
  for (const file of files) {
    try {
      const match = readHead(file.path).match(COMMAND_LINE);
      if (match) {
        return {
          line: match[1].trim(),
          file: file.path,
          modifiedAt: file.modifiedAt,
        };
      }
    } catch {
      // Fichier verrouillé ou disparu : on passe au suivant.
    }
  }
  return null;
}

/** UTF-8, sinon Windows-1252 (encodage par défaut des .bat écrits à la main). */
function decodeScript(bytes: Buffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

/**
 * Ligne qui lance vraiment ArkAscendedServer dans un .bat / .cmd : l'exe
 * suivi d'une carte valide (pas `taskkill /IM ArkAscendedServer.exe`). Les
 * lignes continuées par `^` sont recollées. Aucune trouvée : `line` vide.
 */
export function launchLineFromScript(path: unknown): ArkLaunchLineSource {
  if (
    typeof path !== "string" ||
    !SCRIPT_EXTENSIONS.includes(extname(path).toLowerCase())
  ) {
    throw new AppError("FILE_NOT_FOUND", { path: String(path) });
  }
  let text: string;
  try {
    text = decodeScript(readFileSync(path)).replace(/^﻿/, "");
  } catch {
    throw new AppError("FILE_NOT_FOUND", { path });
  }
  const line = text
    .replace(/\^\r?\n/g, " ")
    .split(/\r?\n/)
    .find(
      (candidate) =>
        !/^\s*(rem\b|::)/i.test(candidate) && launchesServer(candidate),
    );
  return {
    line: line?.trim() ?? "",
    file: path,
    modifiedAt: modifiedAt(path) ?? Date.now(),
  };
}
