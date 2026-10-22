import { getLanguage } from "./language";

// Textes écrits par le main dans les logs d'un serveur et dans le journal
// d'installation, dans la langue de l'interface au moment où la ligne est
// écrite (une session reste donc dans la langue choisie à ce moment-là).
// Le préfixe `[Manager]` n'est pas traduit : la page Logs s'en sert pour
// colorer les lignes de Nexum. `EN` a le type de `FR` : une clé oubliée ne
// compile pas.

const FR = {
  // Démarrage / arrêt (ServerManager)
  adoptedDetected: (pid: number) => `Processus existant détecté (PID ${pid}).`,
  adoptedWithLogFile:
    "Serveur lancé avant l'ouverture de Nexum : suite du log lue dans le fichier de log du jeu.",
  adoptedNoOutput:
    "Serveur lancé avant l'ouverture de Nexum : sa sortie n'est pas récupérable, seules les lignes de Nexum sont enregistrées pour cette session.",
  adoptedGone: (pid: number) => `Processus adopté (PID ${pid}) disparu.`,
  starting: (exe: string) => `Démarrage du serveur (${exe})...`,
  args: (args: string) => `Arguments : ${args}`,
  processStarted: "Processus démarré.",
  exited: (code: number | null) =>
    `Le serveur s'est arrêté (code ${code ?? "?"}).`,
  gameCrashed: (hex: string, name: string | null) =>
    `Le serveur du jeu a planté (${hex}${name ? `, ${name}` : ""}) : c'est une erreur du jeu lui-même, pas de Nexum. Les dernières lignes ci-dessus montrent ce qu'il faisait.`,
  crashNames: {
    "0xC0000005": "violation d'accès",
    "0xC00000FD": "dépassement de pile",
    "0xC0000374": "corruption du tas",
    "0xC0000409": "arrêt d'urgence du programme",
  } as Record<string, string>,
  consoleClosed: (hex: string) =>
    `Le serveur a été fermé depuis sa console (${hex} : CTRL+C, CTRL+Pause ou fermeture de la fenêtre), pas par Nexum.`,
  processError: (msg: string) => `Erreur du processus : ${msg}`,
  announceSent: (msg: string) => `Annonce envoyée : ${msg}`,
  saving: "Sauvegarde en cours...",
  saved: "Sauvegarde terminée.",
  shutdownSent: (s: number) => `Arrêt demandé à l'API (attente ${s} s).`,
  apiUnavailable: (err: string) => `API indisponible : ${err}`,
  notResponding: "Le processus ne répond pas, arrêt forcé via taskkill...",
  waitingGraceful: (s: number) => `Attente de l'arrêt propre (${s} s)...`,
  forceKill: "Arrêt forcé via taskkill...",
  ctrlC: "Envoi d'un arrêt propre (CTRL+C)...",
  stoppingAdopted: "Arrêt du processus adopté...",
  stopping: "Arrêt du serveur...",

  // Démarrage (startServer)
  activeMods: (count: number, list: string) =>
    `Mods actifs (${count}) : ${list}`,
  noActiveMods: "Aucun mod actif.",
  autoStarted: "Démarré automatiquement à l'ouverture de Nexum.",
  autoStartFailed: (err: string) => `Démarrage automatique impossible : ${err}`,

  // Relance après un plantage (crashRestart)
  autoRestarting: (seconds: number, attempt: number, max: number) =>
    `Relance automatique dans ${seconds} s (tentative ${attempt}/${max}).`,
  autoRestarted: (attempt: number, max: number) =>
    `Relancé automatiquement après un plantage (tentative ${attempt}/${max}).`,
  autoRestartFailed: (err: string) => `Relance automatique impossible : ${err}`,
  autoRestartGaveUp: (max: number, minutes: number) =>
    `Relance automatique abandonnée : ${max} plantages en moins de ${minutes} min. Consultez les logs des sessions plantées, puis démarrez le serveur à la main.`,

  // Vérifications au démarrage
  gameUpToDate: (build: string) => `Serveur à jour (build ${build}).`,
  gameUpdateAvailable: (installed: string, latest: string) =>
    `Mise à jour du serveur disponible (build installé ${installed}, dernier build ${latest}) : les joueurs qui ont mis le jeu à jour ne pourront pas se connecter. `,
  gameUpdateHowSteam:
    "Serveur installé via la bibliothèque Steam : mettez-le à jour depuis Steam.",
  gameUpdateHowNexum: "Mettez-le à jour depuis la page Installation de Nexum.",
  modsUpToDate: (count: number) => `Mods à jour (${count} vérifiés).`,
  modUpdates: (count: number, list: string) =>
    `${count} mod(s) ont une mise à jour : ${list}. Mettez-les à jour depuis la page Mods (serveur arrêté).`,
  modsDeprecated: (count: number, list: string) =>
    `${count} mod(s) dépréciés par leur auteur : ${list}.`,

  // Sauvegarde avant mise à jour
  backupNoWorld: "Aucun monde à sauvegarder avant la mise à jour.",
  backupBeforeUpdate: "Sauvegarde du monde avant la mise à jour...",
  backupCreated: (name: string) => `Sauvegarde créée : ${name}`,

  // Redémarrage planifié
  autoUpdateSkippedSteam:
    "Mise à jour automatique ignorée : serveur installé via la bibliothèque Steam, c'est Steam qui le met à jour.",
  autoUpdateSkippedNoSteamCmd:
    "Mise à jour automatique ignorée : SteamCMD n'est pas installé.",
  gameUpToDateRestart: "Jeu à jour : simple redémarrage.",
  updateBackupFailed: (err: string) =>
    `Mise à jour du jeu annulée, la sauvegarde a échoué : ${err}. Le serveur a redémarré sur la version installée.`,
  updatedByScheduledRestart: (from: string, to: string) =>
    `Jeu mis à jour par le redémarrage planifié (build ${from} → ${to}).`,
  updateFailed: (err: string) =>
    `Échec de la mise à jour du jeu (${err}) : le serveur a redémarré sur la version installée.`,
  scheduledRestartWithUpdate: (from: string, to: string) =>
    `Redémarrage planifié avec mise à jour du jeu (build ${from} → ${to}).`,
  updateCancelledNotStopped: (err: string) =>
    `Mise à jour annulée, le serveur ne s'est pas arrêté : ${err}`,
  startFailedAfterUpdate: (err: string) =>
    `Démarrage impossible après la mise à jour : ${err}`,

  // Fichiers de session (SessionLogStore)
  sessionFileFull: (file: string) =>
    `Taille maximale du fichier atteinte (20 Mo) : la session continue dans ${file}.`,
  sessionContinued: (file: string) =>
    `Suite de la session (fichier précédent : ${file}).`,

  // Journal d'installation (SteamCMD)
  steamCmdAlreadyInstalled: "SteamCMD est déjà installé.",
  steamCmdDownloading: "Téléchargement de SteamCMD...",
  steamCmdExtracting: "Extraction de SteamCMD...",
  steamCmdInstalled: "SteamCMD installé.",
  installingApp: (appId: string | number, path: string) =>
    `Installation de l'application ${appId} dans : ${path}`,
  serverInstalled: "Serveur installé / mis à jour.",
};

const EN: typeof FR = {
  adoptedDetected: (pid) => `Existing process detected (PID ${pid}).`,
  adoptedWithLogFile:
    "Server started before Nexum was opened: the rest of the log is read from the game's log file.",
  adoptedNoOutput:
    "Server started before Nexum was opened: its output can't be recovered, only Nexum's lines are recorded for this session.",
  adoptedGone: (pid) => `Adopted process (PID ${pid}) is gone.`,
  starting: (exe) => `Starting server (${exe})...`,
  args: (args) => `Args: ${args}`,
  processStarted: "Process started.",
  exited: (code) => `Server exited with code ${code ?? "?"}.`,
  gameCrashed: (hex, name) =>
    `The game server crashed (${hex}${name ? `, ${name}` : ""}): this is an error in the game itself, not in Nexum. The last lines above show what it was doing.`,
  crashNames: {
    "0xC0000005": "access violation",
    "0xC00000FD": "stack overflow",
    "0xC0000374": "heap corruption",
    "0xC0000409": "fail fast",
  },
  consoleClosed: (hex) =>
    `The server was closed from its console (${hex}: CTRL+C, CTRL+Break or closing the window), not by Nexum.`,
  processError: (msg) => `Process error: ${msg}`,
  announceSent: (msg) => `Announcement sent: ${msg}`,
  saving: "Saving...",
  saved: "Save complete.",
  shutdownSent: (s) => `Shutdown requested through the API (waiting ${s} s).`,
  apiUnavailable: (err) => `API unavailable: ${err}`,
  notResponding:
    "The process isn't responding, forcing it to stop (taskkill)...",
  waitingGraceful: (s) => `Waiting for a clean shutdown (${s} s)...`,
  forceKill: "Forcing the stop (taskkill)...",
  ctrlC: "Sending a clean stop signal (CTRL+C)...",
  stoppingAdopted: "Stopping the adopted process...",
  stopping: "Stopping the server...",

  activeMods: (count, list) => `Active mods (${count}): ${list}`,
  noActiveMods: "No active mods.",
  autoStarted: "Started automatically when Nexum opened.",
  autoStartFailed: (err) => `Automatic start failed: ${err}`,

  autoRestarting: (seconds, attempt, max) =>
    `Restarting automatically in ${seconds} s (attempt ${attempt}/${max}).`,
  autoRestarted: (attempt, max) =>
    `Restarted automatically after a crash (attempt ${attempt}/${max}).`,
  autoRestartFailed: (err) => `Automatic restart failed: ${err}`,
  autoRestartGaveUp: (max, minutes) =>
    `Automatic restart stopped: ${max} crashes in less than ${minutes} min. Check the logs of the crashed sessions, then start the server manually.`,

  gameUpToDate: (build) => `Server up to date (build ${build}).`,
  gameUpdateAvailable: (installed, latest) =>
    `Server update available (installed build ${installed}, latest build ${latest}): players who updated their game won't be able to join. `,
  gameUpdateHowSteam:
    "Server installed through the Steam library: update it from Steam.",
  gameUpdateHowNexum: "Update it from Nexum's Installation page.",
  modsUpToDate: (count) => `Mods up to date (${count} checked).`,
  modUpdates: (count, list) =>
    `${count} mod(s) have an update: ${list}. Update them from the Mods page (server stopped).`,
  modsDeprecated: (count, list) =>
    `${count} mod(s) deprecated by their author: ${list}.`,

  backupNoWorld: "No world to back up before the update.",
  backupBeforeUpdate: "Backing up the world before the update...",
  backupCreated: (name) => `Backup created: ${name}`,

  autoUpdateSkippedSteam:
    "Automatic update skipped: the server was installed through the Steam library, Steam updates it.",
  autoUpdateSkippedNoSteamCmd:
    "Automatic update skipped: SteamCMD is not installed.",
  gameUpToDateRestart: "Game up to date: plain restart.",
  updateBackupFailed: (err) =>
    `Game update cancelled, the backup failed: ${err}. The server restarted on the installed version.`,
  updatedByScheduledRestart: (from, to) =>
    `Game updated by the scheduled restart (build ${from} → ${to}).`,
  updateFailed: (err) =>
    `Game update failed (${err}): the server restarted on the installed version.`,
  scheduledRestartWithUpdate: (from, to) =>
    `Scheduled restart with a game update (build ${from} → ${to}).`,
  updateCancelledNotStopped: (err) =>
    `Update cancelled, the server didn't stop: ${err}`,
  startFailedAfterUpdate: (err) => `Couldn't start after the update: ${err}`,

  sessionFileFull: (file) =>
    `Maximum file size reached (20 MB): the session continues in ${file}.`,
  sessionContinued: (file) => `Session continued (previous file: ${file}).`,

  steamCmdAlreadyInstalled: "SteamCMD already installed.",
  steamCmdDownloading: "Downloading SteamCMD...",
  steamCmdExtracting: "Extracting SteamCMD...",
  steamCmdInstalled: "SteamCMD installed successfully.",
  installingApp: (appId, path) => `Installing app ${appId} to: ${path}`,
  serverInstalled: "Server installed/updated successfully!",
};

/** Textes dans la langue courante de l'interface. */
export function lt(): typeof FR {
  return getLanguage() === "en" ? EN : FR;
}

/**
 * Fin du processus du serveur. Un processus Windows tué par une exception
 * sort avec un code NTSTATUS (3221225477 = 0xC0000005) : il est affiché en
 * hexadécimal et nommé, pour qu'on voie tout de suite que c'est le jeu qui a
 * planté, pas Nexum. Exception : 0xC000013A (STATUS_CONTROL_C_EXIT) n'est
 * pas un plantage, c'est la console du jeu qui a été fermée (Dragonwilds :
 * CTRL+Pause ou fermeture de la fenêtre).
 */
export function exitText(code: number | null, crashed: boolean): string {
  const t = lt();
  if (!crashed || code === null || code < 0xc0000000) return t.exited(code);
  const hex = `0x${code.toString(16).toUpperCase()}`;
  if (hex === "0xC000013A") return t.consoleClosed(hex);
  return t.gameCrashed(hex, t.crashNames[hex] ?? null);
}

/** Ligne de log de Nexum (préfixe `[Manager]`, non traduit). */
export function managerLine(text: string): string {
  return `[Manager] ${text}`;
}
