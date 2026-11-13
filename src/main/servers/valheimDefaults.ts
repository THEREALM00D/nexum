import type { ValheimLaunchConfig, ValheimModifiers } from "../../shared/types";
import { inAllLanguages, lt } from "../i18n/logStrings";

const DEFAULT_MODIFIERS: ValheimModifiers = {
  combat: "",
  deathpenalty: "",
  resources: "",
  raids: "",
  portals: "",
};

// Nom vide = nom par défaut, dans la langue de Nexum au moment de la lecture
// (`valheimDefaultServerName`, main/i18n/logStrings.ts).
export const DEFAULT_VALHEIM_CONFIG: ValheimLaunchConfig = {
  name: "",
  world: "Dedicated",
  password: "",
  port: 2456,
  public: true,
  savedir: "",
  crossplay: false,
  logFile: "",
  customArgs: "",
  worldSeed: "",
  worldSize: "",
  modifierPreset: "",
  modifiers: DEFAULT_MODIFIERS,
  odinEyeUrl: "",
};

// Ancien nom par défaut, enregistré en français dans la config de chaque
// serveur jusqu'à la 0.22 : relu comme « nom par défaut » (vide).
const LEGACY_VALHEIM_NAME = "Mon Serveur Valheim";

function isDefaultValheimName(name: string): boolean {
  return (
    name === "" ||
    name === LEGACY_VALHEIM_NAME ||
    inAllLanguages("valheimDefaultServerName").includes(name)
  );
}

/** Config lue : le nom par défaut est résolu dans la langue courante. */
export function withValheimDefaults(
  stored?: Partial<ValheimLaunchConfig>,
): ValheimLaunchConfig {
  const valheim = { ...DEFAULT_VALHEIM_CONFIG, ...stored };
  if (isDefaultValheimName(valheim.name))
    valheim.name = lt().valheimDefaultServerName;
  return valheim;
}

/** Config enregistrée : le nom par défaut n'est jamais figé. */
export function storedValheimConfig(
  valheim: ValheimLaunchConfig,
): ValheimLaunchConfig {
  return isDefaultValheimName(valheim.name)
    ? { ...valheim, name: "" }
    : valheim;
}
