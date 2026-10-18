import type { TFunction } from "i18next";

const PREFIX = "@app:";

/**
 * Traduit une erreur renvoyée par le main (`appError` / `AppError`, voir
 * main/utils/appError.ts). Le préfixe est cherché n'importe où : une erreur
 * levée dans `ipcMain.handle` arrive précédée de « Error invoking remote
 * method … ». Tout autre texte est affiché tel quel.
 */
export function appErrorMessage(
  t: TFunction,
  raw: string | undefined,
  fallback?: string,
): string {
  if (!raw) return fallback ?? t("common.error");
  const i = raw.indexOf(PREFIX);
  if (i === -1) return raw;
  try {
    const { code, params } = JSON.parse(raw.slice(i + PREFIX.length)) as {
      code: string;
      params?: Record<string, string | number>;
    };
    return t(`appErrors.${code}`, { ...params, defaultValue: code });
  } catch {
    return raw;
  }
}
