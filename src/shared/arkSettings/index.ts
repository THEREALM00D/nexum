import { CLI_SETTINGS } from "./cli";
import { GAME_SETTINGS } from "./game";
import { GUS_SETTINGS, MOTD_SETTINGS } from "./gus";
import type { ArkSettingDef } from "./types";

export * from "./types";

/** Tous les réglages éditables, dans l'ordre d'affichage de chaque groupe. */
export const ARK_SETTINGS: ArkSettingDef[] = [
  ...GUS_SETTINGS,
  ...MOTD_SETTINGS,
  ...GAME_SETTINGS,
  ...CLI_SETTINGS,
];

/** Identifiant unique d'un réglage (une même clé peut exister dans deux fichiers). */
export const arkSettingId = (setting: ArkSettingDef): string =>
  `${setting.file}:${setting.section}:${setting.key}`;

export const ARK_SETTINGS_BY_ID = new Map(
  ARK_SETTINGS.map((setting) => [arkSettingId(setting), setting]),
);
