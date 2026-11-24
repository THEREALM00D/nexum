import type { ArkSettingDef } from "../../../../shared/arkSettings";
import { AppError } from "../../../utils/appError";

const invalid = (key: string, value: string) =>
  new AppError("ARK_SETTING_INVALID", { key, value });

/**
 * Valeur saisie → texte écrit dans le fichier (ou l'option de lancement).
 * Booléens en True/False comme le serveur, nombres dans leurs bornes. Une
 * option de ligne de commande ne peut contenir ni espace ni guillemet : elle
 * casserait la ligne de commande.
 */
export function normalizeSettingValue(
  setting: Pick<
    ArkSettingDef,
    "key" | "type" | "file" | "min" | "max" | "options"
  >,
  raw: string,
): string {
  const value = raw.replace(/[\r\n]/g, "").trim();
  if (setting.file === "cli" && /[\s"]/.test(value)) {
    throw invalid(setting.key, value);
  }
  switch (setting.type) {
    case "bool":
    case "flag": {
      const lower = value.toLowerCase();
      if (lower !== "true" && lower !== "false")
        throw invalid(setting.key, value);
      return lower === "true" ? "True" : "False";
    }
    case "int":
    case "float": {
      const number = Number(value);
      const isValid =
        value !== "" &&
        Number.isFinite(number) &&
        (setting.type === "float" || Number.isInteger(number)) &&
        (setting.min === undefined || number >= setting.min) &&
        (setting.max === undefined || number <= setting.max);
      if (!isValid) throw invalid(setting.key, value);
      return value;
    }
    case "enum":
      if (!setting.options?.includes(value)) throw invalid(setting.key, value);
      return value;
    default:
      return value;
  }
}
