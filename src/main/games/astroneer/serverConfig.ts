import { join } from "path";
import type { AstroneerLaunchConfig } from "../../../shared/types";

export const astroneerServerConfig = {
  // Lanceur racine documenté ; il spawn AstroServer-Win64-Shipping.exe.
  exeName: "AstroServer.exe",

  // Sauvegardes stockées à l'intérieur du dossier serveur, comme Palworld.
  getSavePath(serverPath: string): string {
    return join(serverPath, "Astro", "Saved", "SaveGames");
  },

  buildArgs(cfg: AstroneerLaunchConfig): string[] {
    const custom = cfg.customArgs.trim();
    return custom ? custom.split(/\s+/) : [];
  },

  getStopConfig() {
    // Astroneer n'a pas d'API d'administration exposée par Nexum
    // (MVP sans RCON) — arrêt toujours brutal, comme Valheim.
    return {
      restApiEnabled: false,
      restApiPort: 0,
      adminPassword: "",
      shutdownWaittime: 0,
      shutdownMessage: "",
    };
  },
};
