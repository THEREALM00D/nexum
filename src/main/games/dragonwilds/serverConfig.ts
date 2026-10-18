import { join } from "path";
import type { DragonwildsLaunchConfig } from "../../../shared/types";
import type { GamePort } from "../ports";

export const DRAGONWILDS_DEFAULT_PORT = 7777;
// compose.yaml officiel : « Beacon is RSDW_PORT + 1111 ».
export const DRAGONWILDS_BEACON_OFFSET = 1111;

export const dragonwildsServerConfig = {
  // Lanceur racine : il lance
  // RSDragonwilds/Binaries/Win64/RSDragonwildsServer-Win64-Shipping.exe,
  // reste vivant tant qu'il tourne et renvoie son code de sortie (vérifié
  // sur la build 1.0.1.1). ⚠️ Le guide Jagex parle de `RSDragonwilds.exe` :
  // c'est l'exécutable du client du jeu.
  exeName: "RSDragonwildsServer.exe",

  // Les mondes sont dans le dossier du serveur. Le serveur charge celui dont
  // le nom inscrit dans la sauvegarde vaut DefaultWorldName (voir saveHeader).
  getSavePath(serverPath: string): string {
    return join(serverPath, "RSDragonwilds", "Saved", "SaveGames");
  },

  // stdout ne reçoit que les lignes Display/Warning/Error (~10 % du log, sans
  // « listening on port », le monde chargé…) : Nexum suit le fichier complet.
  // À chaque démarrage, copié en RSDragonwilds-backup-<date>.log puis vidé
  // (même fichier réutilisé, voir LogFileTailer).
  getLogFilePath(serverPath: string): string {
    return join(
      serverPath,
      "RSDragonwilds",
      "Saved",
      "Logs",
      "RSDragonwilds.log",
    );
  },

  // -Port / -BeaconPort : arguments du script officiel (entry.sh du dépôt
  // runescape/rsdw-dedicated), vérifiés sous Windows. Pas de -log : il ouvre
  // une fenêtre console sans rien apporter (le fichier de log est complet).
  buildArgs(cfg: DragonwildsLaunchConfig): string[] {
    const args = [`-Port=${cfg.port}`, `-BeaconPort=${cfg.beaconPort}`];
    const custom = cfg.customArgs.trim();
    if (custom) args.push(...custom.split(/\s+/));
    return args;
  },

  getStopConfig() {
    // Aucun arrêt propre possible sous Windows (testé) : CTRL+C est ignoré,
    // CTRL+Break et la fermeture de la console demandent l'arrêt du moteur
    // puis le processus meurt aussitôt, sans sauvegarder. Le serveur
    // sauvegarde de lui-même toutes les 5 min (dom.StateSaveFrequencyMins).
    return {
      restApiEnabled: false,
      restApiPort: 0,
      adminPassword: "",
      shutdownWaittime: 0,
      shutdownMessage: "",
    };
  },

  // UDP uniquement (aucun port TCP ouvert, vérifié).
  getPorts(cfg: DragonwildsLaunchConfig): GamePort[] {
    return [
      { port: cfg.port, protocol: "UDP", label: "game", forward: true },
      { port: cfg.beaconPort, protocol: "UDP", label: "beacon", forward: true },
    ];
  },
};
