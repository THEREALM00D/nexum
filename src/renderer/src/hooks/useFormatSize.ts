import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { formatSize } from "../utils/format";

/** `formatSize` dans la langue de l'app (unités et séparateur décimal). */
export function useFormatSize(): (bytes: number) => string {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "fr";
  return useCallback(
    (bytes: number) =>
      formatSize(bytes, locale, {
        b: t("common.units.b"),
        kb: t("common.units.kb"),
        mb: t("common.units.mb"),
        gb: t("common.units.gb"),
      }),
    [locale, t],
  );
}
