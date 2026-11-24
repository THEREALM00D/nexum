import { join } from "path";
import type { ArkLaunchConfig } from "../../../shared/types";
import type { StopConfig } from "../../server/ServerManager";
import type { GamePort } from "../ports";
import { readRconSettings } from "./gameUserSettingsIni";
import { splitArgsMods } from "./mods/argsMods";
import { launchOptionArgs } from "./config/launchOptions";

export const arkServerConfig = {
  // Lancé directement, sans lanceur (vérifié). Chemin relatif au dossier
  // du serveur : ServerManager et detectGameType font un join().
  exeName: join("ShooterGame", "Binaries", "Win64", "ArkAscendedServer.exe"),

  // Un dossier par carte : <Carte>.ark + copies de retour arrière du jeu.
  // Avec ?AltSaveDirectoryName=X : Saved/X/<Carte> (vérifié). Carte et
  // dossier validés à la lecture de la config (sanitizeArkLaunch).
  getSavePath(serverPath: string, launchConfig: ArkLaunchConfig): string {
    return join(
      serverPath,
      "ShooterGame",
      "Saved",
      launchConfig.saveDirectory || "SavedArks",
      launchConfig.map,
    );
  },

  // Sauvegardes et transfert : sans les copies complètes que le jeu garde
  // à côté du monde (4 × <Carte>_<date>.arkrbf + <Carte>_AntiCorruptionBackup.bak,
  // soit ~6× la taille du monde).
  keepWorldFile(entryName: string): boolean {
    return !/\.(arkrbf|bak)$/i.test(entryName);
  },

  // stdout est vide et stderr ne reçoit que le débogage de GameAnalytics :
  // Nexum suit le log du jeu, renommé en ShooterGame-backup-<date>.log à
  // chaque démarrage.
  getLogFilePath(serverPath: string): string {
    return join(serverPath, "ShooterGame", "Saved", "Logs", "ShooterGame.log");
  },

  // ⚠️ ShooterGame.log recopie la ligne de commande en entier : les mots de
  // passe restent dans GameUserSettings.ini. -WinLiveMaxPlayers est le seul
  // réglage des joueurs max pris en compte (?MaxPlayers et l'INI non).
  buildArgs(launchConfig: ArkLaunchConfig): string[] {
    const custom = splitArgsMods(launchConfig.customArgs);
    const launchOptions = launchOptionArgs(
      launchConfig.launchOptions,
      custom.rest,
    );
    const options = [
      launchConfig.map,
      "listen",
      `Port=${launchConfig.port}`,
      `QueryPort=${launchConfig.queryPort}`,
      `RCONPort=${launchConfig.rconPort}`,
      ...(launchConfig.saveDirectory
        ? [`AltSaveDirectoryName=${launchConfig.saveDirectory}`]
        : []),
      ...launchOptions.queryOptions,
    ];
    const args = [
      options.join("?"),
      `-WinLiveMaxPlayers=${launchConfig.maxPlayers}`,
    ];
    if (!launchConfig.battlEye) args.push("-NoBattlEye");
    // Un seul -mods= : ceux de la liste (activés, dans l'ordre), puis ceux
    // encore écrits dans les arguments perso (la page Mods propose de les
    // déplacer dans la liste).
    const modIds = launchConfig.mods
      .filter((mod) => mod.enabled)
      .map((mod) => mod.id);
    for (const id of custom.ids) if (!modIds.includes(id)) modIds.push(id);
    if (modIds.length > 0) args.push(`-mods=${modIds.join(",")}`);
    // Options de l'onglet Réglages de jeu, puis les arguments perso.
    args.push(...launchOptions.dashArgs, ...custom.rest);
    return args;
  },

  // RCON (DoExit) est le seul arrêt propre : il sauvegarde puis quitte.
  // CTRL+Pause est ignoré et taskkill tue sans sauvegarder (vérifié) : sans
  // RCON, arrêt direct, perte max = AutoSavePeriodMinutes (15 min).
  getStopConfig(serverPath: string, launchConfig: ArkLaunchConfig): StopConfig {
    const rcon = readRconSettings(serverPath, launchConfig.rconPort);
    return rcon.enabled
      ? { rcon: { port: rcon.port, password: rcon.password } }
      : {};
  },

  // Le port de requête n'est pas utilisé par la liste des serveurs (EOS),
  // mais deux serveurs ARK ne peuvent pas partager le même.
  getPorts(launchConfig: ArkLaunchConfig): GamePort[] {
    return [
      {
        port: launchConfig.port,
        protocol: "UDP",
        label: "game",
        forward: true,
      },
      {
        port: launchConfig.queryPort,
        protocol: "UDP",
        label: "query",
        forward: false,
      },
      {
        port: launchConfig.rconPort,
        protocol: "TCP",
        label: "rcon",
        forward: false,
      },
    ];
  },
};
