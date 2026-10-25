import type { EnshroudedSettings, EnshroudedUserGroup } from "@shared/types";

// enshrouded_server.json (clés gérées) + arguments de Nexum, voir
// main/games/enshrouded/handlers/config.ts.
export const enshroudedConfigService = {
  readConfig: (): Promise<EnshroudedSettings> =>
    window.api.enshroudedconfig.read(),
  writeConfig: (
    settings: EnshroudedSettings,
  ): Promise<{ success: boolean; error?: string }> =>
    window.api.enshroudedconfig.write(settings),
  readGroups: (): Promise<EnshroudedUserGroup[]> =>
    window.api.enshrouded.getGroups(),
  writeGroups: (
    groups: EnshroudedUserGroup[],
  ): Promise<{ success: boolean; error?: string }> =>
    window.api.enshrouded.setGroups(groups),
};
