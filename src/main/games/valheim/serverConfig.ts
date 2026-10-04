import { join } from "path";
import { homedir } from "os";
import type { ValheimLaunchConfig } from "../../../shared/types";

export const valheimServerConfig = {
  exeName: "valheim_server.exe",

  // Le script officiel (start_headless_server.bat) fait `set SteamAppId=892970`
  // avant de lancer le serveur. Sans cette variable ni `steam_appid.txt` dans
  // le dossier (absent de certaines installs faites via la bibliothèque
  // Steam), le serveur s'arrête quelques secondes après le démarrage.
  env: { SteamAppId: "892970" } as Record<string, string>,

  // Valheim stocke ses mondes hors de `serverPath` : dossier custom (savedir)
  // ou %LOCALAPPDATA_LOW%/IronGate/Valheim/worlds_local par défaut.
  getSavePath(cfg: ValheimLaunchConfig): string {
    const base =
      cfg.savedir ||
      join(homedir(), "AppData", "LocalLow", "IronGate", "Valheim");
    return join(base, "worlds_local");
  },

  buildArgs(cfg: ValheimLaunchConfig): string[] {
    const args = ["-nographics", "-batchmode"];
    args.push("-name", cfg.name, "-world", cfg.world);
    args.push("-port", String(cfg.port));
    args.push("-public", cfg.public ? "1" : "0");
    if (cfg.password) args.push("-password", cfg.password);
    if (cfg.savedir) args.push("-savedir", cfg.savedir);
    if (cfg.crossplay) args.push("-crossplay");
    if (cfg.logFile) args.push("-logFile", cfg.logFile);
    if (cfg.worldSeed) args.push("-worldseed", cfg.worldSeed);
    if (cfg.worldSize) args.push("-worldsize", cfg.worldSize);
    // -preset DOIT précéder les -modifier individuels : "Setting a preset
    // will overwrite any other previous modifiers. If combined with a
    // preset [individual modifiers] should be set after" (manuel officiel).
    // C'est aussi le seul moyen documenté de forcer un monde déjà créé (avec
    // des modificateurs déjà persistés) à revenir à "Normal" — un
    // -modifier individuel vide/omis ne réinitialise pas ce qui existe déjà.
    if (cfg.modifierPreset) args.push("-preset", cfg.modifierPreset);
    if (cfg.modifiers) {
      const entries: Array<[string, string]> = [
        ["combat", cfg.modifiers.combat],
        ["deathpenalty", cfg.modifiers.deathpenalty],
        ["resources", cfg.modifiers.resources],
        ["raids", cfg.modifiers.raids],
        ["portals", cfg.modifiers.portals],
      ];
      for (const [key, val] of entries) {
        if (val) args.push("-modifier", key, val);
      }
    }
    const custom = cfg.customArgs.trim();
    if (custom) args.push(...custom.split(/\s+/));
    return args;
  },

  getStopConfig() {
    return {
      restApiEnabled: false,
      restApiPort: 0,
      adminPassword: "",
      shutdownWaittime: 0,
      shutdownMessage: "",
      // Pas d'API REST, mais le manuel officiel recommande explicitement un
      // CTRL+C pour un arrêt propre plutôt qu'un kill direct (risque de
      // sauvegarde corrompue sinon).
      gracefulSignal: true,
    };
  },
};
