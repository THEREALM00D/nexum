import type {
  Server,
  ServerConfig,
  TransferServerPaths,
} from "../../shared/types";
import { DEFAULT_SERVER_CONFIG } from "../servers/ServerConfigStore";
import { GAME_TYPES } from "../games/registry";
import { AppError } from "../utils/appError";

// Version du format des deux fichiers (réglages et serveur). Un fichier d'une
// version plus récente est refusé (TRANSFER_FILE_TOO_NEW) : il peut contenir
// des champs que cette version ne sait pas appliquer.
export const TRANSFER_VERSION = 1;
export const SETTINGS_FORMAT = "nexum-settings";
export const SERVER_FORMAT = "nexum-server";

type ServerFields = Omit<Server, "id" | "createdAt" | "path">;

/** Un serveur dans un fichier d'export : sans id (un import en crée un neuf). */
export interface TransferServerEntry {
  server: ServerFields & { path: string };
  config: ServerConfig;
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const invalid = () => new AppError("TRANSFER_FILE_INVALID");

/** Vérifie format et version ; renvoie l'objet racine. */
export function checkHeader(raw: unknown, format: string): Obj {
  if (!isObj(raw) || raw.format !== format) throw invalid();
  if (typeof raw.version !== "number") throw invalid();
  if (raw.version > TRANSFER_VERSION)
    throw new AppError("TRANSFER_FILE_TOO_NEW");
  return raw;
}

export function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw invalid();
  }
}

/**
 * Garde seulement les clés connues de `defaults`, du même type : un fichier
 * modifié à la main ne peut pas glisser une valeur que le code ne sait pas
 * lire. Les clés absentes reprennent leur valeur par défaut à l'écriture
 * (`ServerConfigStore.update` fusionne).
 */
function pickLike<T extends Obj>(defaults: T, raw: unknown): Partial<T> {
  if (!isObj(raw)) return {};
  const out: Obj = {};
  for (const [key, def] of Object.entries(defaults)) {
    const value = raw[key];
    if (isObj(def)) out[key] = { ...def, ...pickLike(def, value) };
    else if (typeof value === typeof def) out[key] = value;
  }
  return out as Partial<T>;
}

export function parseServerEntry(raw: unknown): TransferServerEntry {
  if (!isObj(raw) || !isObj(raw.server)) throw invalid();
  const s = raw.server;
  if (typeof s.name !== "string" || typeof s.path !== "string") throw invalid();
  if (!GAME_TYPES.includes(s.gameType as Server["gameType"])) throw invalid();
  const config = {
    ...DEFAULT_SERVER_CONFIG,
    ...pickLike(DEFAULT_SERVER_CONFIG as unknown as Obj, raw.config),
  } as ServerConfig;
  return {
    server: {
      name: s.name,
      gameType: s.gameType as Server["gameType"],
      path: s.path,
      color: typeof s.color === "string" ? s.color : null,
      autoStart: s.autoStart === true,
      autoRestart: s.autoRestart === true,
    },
    config,
  };
}

/** Mots de passe stockés par Nexum (pas ceux des fichiers du jeu). */
export function stripPasswords(cfg: ServerConfig): ServerConfig {
  return {
    ...cfg,
    valheimConfig: { ...cfg.valheimConfig, password: "" },
    dragonwildsConfig: { ...cfg.dragonwildsConfig, adminPassword: "" },
  };
}

export function toServerEntry(
  server: Server,
  cfg: ServerConfig,
  includePasswords: boolean,
): TransferServerEntry {
  const { name, gameType, path, color, autoStart, autoRestart } = server;
  return {
    server: { name, gameType, path, color, autoStart, autoRestart },
    config: includePasswords ? cfg : stripPasswords(cfg),
  };
}

export const entryPaths = (e: TransferServerEntry): TransferServerPaths => ({
  path: e.server.path,
  backupDir: e.config.backup.backupDir,
  savedir: e.config.valheimConfig.savedir,
  logFile: e.config.valheimConfig.logFile,
});

/** Config de l'entrée avec les dossiers confirmés sur le nouveau PC. */
export const configWithPaths = (
  cfg: ServerConfig,
  paths: TransferServerPaths,
): ServerConfig => ({
  ...cfg,
  backup: { ...cfg.backup, backupDir: paths.backupDir.trim() },
  valheimConfig: {
    ...cfg.valheimConfig,
    savedir: paths.savedir.trim(),
    logFile: paths.logFile.trim(),
  },
});

/** Nom de fichier sûr pour Windows (nom du serveur dans le nom du ZIP). */
export const safeFileName = (name: string): string =>
  name.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").trim() || "server";

export const dateStamp = (): string => new Date().toISOString().slice(0, 10);
