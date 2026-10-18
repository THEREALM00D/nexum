import type { AppErrorCode } from "../../shared/types";

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
 * Version lisible pour les logs du serveur (non traduits, comme toutes les
 * lignes `[Manager]`) : le code suivi de ses paramètres.
 */
export function appErrorLogText(raw: string): string {
  const i = raw.indexOf(PREFIX);
  if (i === -1) return raw;
  try {
    const { code, params } = JSON.parse(raw.slice(i + PREFIX.length)) as {
      code: string;
      params?: Params;
    };
    const values = params ? Object.values(params).join(", ") : "";
    return values ? `${code} (${values})` : code;
  } catch {
    return raw;
  }
}
