import type { ExistingServerImport } from "../../../types";
import LaunchImportPanel from "./LaunchImportPanel";
import { isLaunchImportState } from "./useLaunchImport";

/** Reprise d'un serveur ARK déjà installé : ligne de lancement de l'ancien outil. */
export const arkExistingServer: ExistingServerImport = {
  Panel: LaunchImportPanel,
  apply: async (serverId, state) => {
    if (!isLaunchImportState(state)) return;
    const result = await window.api.arkLaunchImport.apply(
      serverId,
      state.line,
      state.saveDirectory,
    );
    if (!result.success) throw new Error(result.error);
  },
};
