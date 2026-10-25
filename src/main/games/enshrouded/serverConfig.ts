import { resolve } from "path";
import type { EnshroudedLaunchConfig } from "../../../shared/types";
import type { GamePort } from "../ports";
import { DEFAULT_SETTINGS, readSettings } from "./serverJson";

/** Réglages du fichier, valeurs par défaut si illisible (pas d'exception ici). */
function safeSettings(serverPath: string) {
  try {
    return readSettings(serverPath);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const enshroudedServerConfig = {
  // Un seul processus (pas de lanceur), console à lui. Le client du jeu
  // s'appelle enshrouded.exe : préfixe `enshrouded_server` pour l'adoption.
  exeName: "enshrouded_server.exe",

  // `saveDirectory` est relatif au dossier du serveur (./savegame par
  // défaut) : world0.ksd + savegame/backup/ (copies tournantes du jeu).
  getSavePath(serverPath: string): string {
    const dir = safeSettings(serverPath).saveDirectory || "./savegame";
    return resolve(serverPath, dir);
  },

  // Le serveur ne lit aucun argument documenté (« Cmd-Parameters: » vide
  // dans son log) : toute la config est dans enshrouded_server.json.
  buildArgs(cfg: EnshroudedLaunchConfig): string[] {
    const custom = cfg.customArgs.trim();
    return custom ? custom.split(/\s+/) : [];
  },

  getStopConfig() {
    // Vérifié : CTRL+C est ignoré, `taskkill` sans /F refusé, mais
    // CTRL+Pause déclenche un arrêt propre (« Trigger gameflow shutdown,
    // exit: Ctrl_Break », monde sauvegardé, code 0).
    return {
      restApiEnabled: false,
      restApiPort: 0,
      adminPassword: "",
      shutdownWaittime: 0,
      shutdownMessage: "",
      gracefulSignal: "ctrlBreak" as const,
    };
  },

  // Seul port fixe : queryPort en UDP (le reste est éphémère, vérifié avec
  // Get-NetUDPEndpoint / Get-NetTCPConnection sur le processus).
  getPorts(serverPath: string): GamePort[] {
    const port =
      Number(safeSettings(serverPath).queryPort) || DEFAULT_SETTINGS.queryPort;
    return [{ port, protocol: "UDP", label: "query", forward: true }];
  },
};
