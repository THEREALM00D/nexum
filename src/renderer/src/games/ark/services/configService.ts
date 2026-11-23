import type { ArkSettings } from "@shared/types";

type WriteResult = { success: boolean; error?: string };

const readConfig = (): Promise<ArkSettings> => window.api.arkconfig.read();
const writeConfig = (
  settings: Record<string, string | number | boolean>,
): Promise<WriteResult> => window.api.arkconfig.write(settings);

// GameUserSettings.ini + ligne de commande (vue fusionnée côté main, voir
// games/ark/handlers/config.ts).
export const arkConfigService = {
  readConfig,
  writeConfig,
  /** RCON : arrêt propre, sauvegarde à chaud, annonces, joueurs. */
  isRconEnabled: async (): Promise<boolean> =>
    (await readConfig()).RCONEnabled === true,
  /** Refusé serveur lancé (CONFIG_LOCKED) : il réécrit l'INI à l'arrêt. */
  enableRcon: async (): Promise<WriteResult> =>
    writeConfig({ ...(await readConfig()), RCONEnabled: true }),
};
