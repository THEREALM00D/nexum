import type { AppErrorCode } from "../../shared/types";
import { APP_ERRORS_FR } from "../../shared/appErrors/fr";
import { APP_ERRORS_EN } from "../../shared/appErrors/en";
import { getLanguage, type AppLanguage } from "../i18n/language";

// Message d'erreur destiné à l'utilisateur : le main n'a pas i18n, il renvoie
// donc un code (+ paramètres) que le renderer traduit dans la langue de l'UI
// (`appErrorMessage`). Même principe que les codes FW_ERROR du pare-feu.
const PREFIX = "@app:";

type Params = Record<string, string | number>;

export function appError(code: AppErrorCode, params?: Params): string {
  return PREFIX + JSON.stringify({ code, params });
}

/** À lever dans un `ipcMain.handle` : le message arrive tel quel au renderer. */
export class AppError extends Error {
  constructor(code: AppErrorCode, params?: Params) {
    super(appError(code, params));
  }
}

/**
 * Erreur réseau de Node (ECONNREFUSED, ENOTFOUND, ECONNRESET…) → code
 * traduisible. On garde l'hôte et le code système, utiles dans un rapport
 * de bug, sans le message anglais brut de Node.
 */
export function networkError(url: string | URL, err: unknown): AppError {
  let host = String(url);
  try {
    host = new URL(url).host;
  } catch {
    // URL illisible : affichée telle quelle
  }
  const e = err as NodeJS.ErrnoException | undefined;
  return new AppError("NETWORK_ERROR", {
    host,
    detail: e?.code ?? e?.message ?? "",
  });
}

const MESSAGES: Record<AppLanguage, Record<AppErrorCode, string>> = {
  fr: APP_ERRORS_FR,
  en: APP_ERRORS_EN,
};

interface DecodedError {
  message: string;
  /** Codes de l'erreur puis de ses paramètres codés, de l'extérieur vers l'intérieur. */
  codes: string[];
}

function decode(raw: string): DecodedError {
  const start = raw.indexOf(PREFIX);
  if (start === -1) return { message: raw, codes: [] };
  try {
    const { code, params } = JSON.parse(raw.slice(start + PREFIX.length)) as {
      code: string;
      params?: Params;
    };
    const codes = [code];
    const values: Record<string, string> = {};
    for (const [key, value] of Object.entries(params ?? {})) {
      const nested = decode(String(value));
      values[key] = nested.message;
      codes.push(...nested.codes);
    }
    const template = MESSAGES[getLanguage()][code as AppErrorCode];
    if (!template) {
      const list = Object.values(values).join(", ");
      return { message: list ? `${code} (${list})` : code, codes: [] };
    }
    const message = template.replace(
      /\{\{(\w+)\}\}/g,
      (placeholder, key: string) => values[key] ?? placeholder,
    );
    return { message, codes };
  } catch {
    return { message: raw, codes: [] };
  }
}

/**
 * Version lisible pour les logs du serveur : le même texte que la
 * notification du renderer (`src/shared/appErrors/`), dans la langue du
 * moment comme toutes les lignes `[Manager]`, suivi du code entre crochets
 * pour qu'un rapport de bug reste facile à chercher. Un paramètre qui est
 * lui-même une erreur codée (ex. `msg` de BACKUP_BEFORE_UPDATE_FAILED) est
 * traduit aussi et son code ajouté : `[BACKUP_BEFORE_UPDATE_FAILED > NETWORK_ERROR]`.
 * Un texte non codé est renvoyé tel quel.
 */
export function appErrorLogText(raw: string): string {
  const { message, codes } = decode(raw);
  return codes.length > 0 ? `${message} [${codes.join(" > ")}]` : message;
}
