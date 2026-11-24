import {
  ARK_SETTINGS,
  type ArkSettingDef,
} from "../../../../shared/arkSettings";
import { normalizeSettingValue } from "./settingValue";

const CLI_SETTINGS = new Map(
  ARK_SETTINGS.filter((setting) => setting.file === "cli").map((setting) => [
    setting.key,
    setting,
  ]),
);

/**
 * Options de lancement enregistrées (config.json modifié à la main, import
 * d'un autre PC) : seulement celles du catalogue, avec une valeur valide.
 */
export function sanitizeLaunchOptions(stored: unknown): Record<string, string> {
  if (!stored || typeof stored !== "object") return {};
  const options: Record<string, string> = {};
  for (const [key, raw] of Object.entries(stored as Record<string, unknown>)) {
    const setting = CLI_SETTINGS.get(key);
    if (!setting || typeof raw !== "string") continue;
    try {
      const value = normalizeSettingValue(setting, raw);
      if (setting.type !== "flag" || value === "True") options[key] = value;
    } catch {
      // Valeur invalide : option ignorée.
    }
  }
  return options;
}

const argName = (arg: string) =>
  arg.replace(/^[-?]/, "").split("=")[0].toLowerCase();

/**
 * Options de lancement → arguments (`-Option`, `-Option=valeur`) et options
 * `?Option=valeur` de l'URL de carte. Une option déjà écrite dans les
 * arguments perso n'est pas répétée : celle de l'utilisateur gagne.
 */
export function launchOptionArgs(
  options: Record<string, string>,
  customArgs: string[],
): { dashArgs: string[]; queryOptions: string[] } {
  const custom = new Set(customArgs.map(argName));
  const dashArgs: string[] = [];
  const queryOptions: string[] = [];
  for (const [key, value] of Object.entries(options)) {
    const setting: ArkSettingDef | undefined = CLI_SETTINGS.get(key);
    if (!setting || custom.has(key.toLowerCase())) continue;
    if (setting.cliForm === "query") {
      queryOptions.push(`${key}=${value}`);
    } else {
      dashArgs.push(setting.type === "flag" ? `-${key}` : `-${key}=${value}`);
    }
  }
  return { dashArgs, queryOptions };
}
