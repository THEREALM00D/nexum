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
  autoRestarting: (attempt: number, max: number) =>
    `Redémarrage automatique... (tentative ${attempt}/${max})`,
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
  autoRestarting: (attempt, max) =>
    `Auto-restarting... (attempt ${attempt}/${max})`,
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

/** Ligne de log de Nexum (préfixe `[Manager]`, non traduit). */
export function managerLine(text: string): string {
  return `[Manager] ${text}`;
}
