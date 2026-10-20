import type { TFunction } from "i18next";

const PREFIX = "@app:";
// Ajouté par Electron devant le message d'une erreur levée dans
// `ipcMain.handle` : « Error invoking remote method 'x': Error: … ».
const IPC_PREFIX = /^Error invoking remote method '[^']*': (?:\w*Error: )?/;

/**
 * Traduit une erreur renvoyée par le main (`appError` / `AppError`, voir
 * main/utils/appError.ts). Le préfixe est cherché n'importe où : une erreur
 * levée dans `ipcMain.handle` arrive précédée de « Error invoking remote
 * method … ». Un paramètre qui est lui-même une erreur codée est traduit
 * aussi. Tout autre texte est affiché tel quel, sans le préfixe d'Electron.
 */
export function appErrorMessage(
  t: TFunction,
  raw: string | undefined,
  fallback?: string,
): string {
  if (!raw) return fallback ?? t("common.error");
  const i = raw.indexOf(PREFIX);
  if (i === -1) return raw.replace(IPC_PREFIX, "") || (fallback ?? raw);
  try {
    const { code, params } = JSON.parse(raw.slice(i + PREFIX.length)) as {
      code: string;
      params?: Record<string, string | number>;
    };
    const translated = Object.fromEntries(
      Object.entries(params ?? {}).map(([k, v]) => [
        k,
        typeof v === "string" ? appErrorMessage(t, v, v) : v,
      ]),
    );
    return t(`appErrors.${code}`, { ...translated, defaultValue: code });
  } catch {
    return raw;
  }
}

/** Erreur attrapée dans un `catch` (rejet d'un appel `window.api`…). */
export function errorMessage(
  t: TFunction,
  e: unknown,
  fallback?: string,
): string {
  const raw = e instanceof Error ? e.message : e == null ? "" : String(e);
  return appErrorMessage(t, raw, fallback);
}
