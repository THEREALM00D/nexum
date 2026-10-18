import type { DragonwildsSettings } from "@shared/types";

// DedicatedServer.ini + ports / mot de passe admin / args (vue fusionnée
// côté main, voir games/dragonwilds/handlers/config.ts).
export const dragonwildsConfigService = {
  readConfig: (): Promise<DragonwildsSettings> =>
    window.api.dragonwildsconfig.read(),
  writeConfig: (
    settings: Record<string, string | number | boolean>,
  ): Promise<{ success: boolean; error?: string }> =>
    window.api.dragonwildsconfig.write(settings as DragonwildsSettings),
};
