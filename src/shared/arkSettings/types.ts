// Catalogue des réglages ARK: Survival Ascended éditables dans l'onglet
// « Réglages de jeu ». Construit depuis le wiki (ark.wiki.gg, qui mélange ASA
// et ASE) et gardé seulement si le nom est dans ArkAscendedServer.exe ou si
// le wiki le marque ASA (voir src/main/games/ark/CLAUDE.md).

export type ArkSettingGroup =
  | "rates"
  | "players"
  | "creatures"
  | "breeding"
  | "structures"
  | "rules"
  | "tribes"
  | "world"
  | "crafting"
  | "transfers"
  | "features"
  | "admin"
  | "interface"
  | "launch";

/** `flag` : option de ligne de commande sans valeur (présente ou non). */
export type ArkSettingType =
  "bool" | "int" | "float" | "string" | "flag" | "enum";

/** gus = GameUserSettings.ini, game = Game.ini, cli = ligne de commande. */
export type ArkSettingFile = "gus" | "game" | "cli";

export interface ArkSettingDef {
  key: string;
  file: ArkSettingFile;
  /** Section INI ("" pour la ligne de commande). */
  section: string;
  type: ArkSettingType;
  /** Valeur du jeu quand le réglage est absent ("" = inconnue). */
  default: string;
  group: ArkSettingGroup;
  min?: number;
  max?: number;
  /** Valeurs permises (`enum`). */
  options?: string[];
  /** Ligne de commande : `-Option=valeur` (dash) ou `?Option=valeur` (query). */
  cliForm?: "dash" | "query";
}

export const GUS_SECTION = "ServerSettings";
export const GAME_SECTION = "/Script/ShooterGame.ShooterGameMode";

export const ARK_SETTING_GROUPS: ArkSettingGroup[] = [
  "rates",
  "players",
  "creatures",
  "breeding",
  "structures",
  "rules",
  "tribes",
  "world",
  "crafting",
  "transfers",
  "features",
  "admin",
  "interface",
  "launch",
];

type Extra = Pick<ArkSettingDef, "min" | "max" | "options" | "cliForm">;
export type SettingRow = [
  key: string,
  type: ArkSettingType,
  defaultValue: string,
  extra?: Extra,
];

/** Rangées compactes d'un groupe → définitions complètes. */
export function settingsOf(
  file: ArkSettingFile,
  section: string,
  group: ArkSettingGroup,
  rows: SettingRow[],
): ArkSettingDef[] {
  return rows.map(([key, type, defaultValue, extra]) => ({
    key,
    file,
    section,
    type,
    default: defaultValue,
    group,
    ...extra,
  }));
}
