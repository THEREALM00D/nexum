// Types partagés entre main, preload et renderer.
// Tout ce qui transite via IPC doit avoir le même type des deux côtés.

// --- Serveurs ---
export type GameType = "palworld" | "valheim" | "astroneer";

export interface Server {
  id: string;
  name: string;
  gameType: GameType;
  path: string;
  color: string | null;
  createdAt: number;
}

// Configuration par-serveur (launch args, backup, restart) — stockée séparément
// de `Server` pour garder le type Server simple et pouvoir hot-reload la config
// sans toucher au serveur lui-même.
export interface ServerConfig {
  launchArgs: LaunchArgsConfig;
  valheimConfig: ValheimLaunchConfig;
  astroneerConfig: AstroneerLaunchConfig;
  backup: BackupConfig;
  restart: RestartConfig;
}

// Payload émis par le main vers le renderer pour chaque ligne de log
// produite par un serveur. Inclut le `serverId` pour permettre au renderer
// de filtrer/agréger les logs multi-serveurs (Phase 5).
export interface ServerLogEvent {
  serverId: string;
  line: string;
}

export interface SystemStats {
  cpu: number; // %
  ram: number; // %
  ramUsed: number; // GB
  ramTotal: number; // GB
  ramUsedByGame: number; // GB
  serverUptime: number; // seconds
  uptime: number; // seconds
}

export type ServerStatus =
  "stopped" | "starting" | "running" | "stopping" | "crashed";

// --- Palworld REST API ---
export interface PalServerInfo {
  version: string;
  servername: string;
  description: string;
  worldguid: string;
}

export interface PalPlayer {
  name: string;
  accountName: string;
  playerId: string;
  userId: string;
  ip: string;
  ping: number;
  location_x: number;
  location_y: number;
  level: number;
  building_count: number;
}

export interface PalMetrics {
  serverfps: number;
  currentplayernum: number;
  serverframetime: number;
  maxplayernum: number;
  uptime: number;
  basecampnum: number;
  days: number;
}

// --- Backups ---
export interface BackupEntry {
  name: string;
  path: string;
  size: number;
  createdAt: number;
}

export interface BackupConfig {
  backupDir: string;
  backupKeep: number;
  backupIntervalMinutes: number;
}

// --- Scheduler ---
export interface RestartConfig {
  enabled: boolean;
  time: string; // "HH:MM" 24h
  warningMinutes: number;
  message: string;
}

// --- Firewall ---
export interface FirewallRuleStatus {
  name: string;
  port: number;
  protocol: "TCP" | "UDP";
  active: boolean;
}

// --- Update check ---
export interface UpdateCheckResult {
  upToDate: boolean;
  installedBuild: string | null;
  requiredBuild: string | null;
}

// --- Mise à jour de ServerForge lui-même (electron-updater, releases GitHub) ---
export type AppUpdateStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available"; version: string }
  | { state: "downloading"; percent: number }
  | { state: "downloaded"; version: string }
  | { state: "error"; message: string }
  /** Fichiers de la release pas encore tous en ligne (déploiement en cours côté GitHub Actions) — pas une vraie erreur. */
  | { state: "unavailable" };

// --- Launch arguments (PalServer.exe) ---
export interface LaunchArgsConfig {
  publicLobby: boolean;
  performanceFlags: boolean;
  customArgs: string;
}

// --- Launch arguments (valheim_server.exe) ---
// Valeurs validées contre le manuel officiel "Valheim Dedicated Server
// Instruction Manual" (Iron Gate) — Valheim ignore silencieusement toute
// valeur -modifier non reconnue (pas d'erreur, pas de log), donc une valeur
// inventée ici se traduirait par un modificateur qui ne s'applique jamais.
export interface ValheimModifiers {
  combat: "veryhard" | "hard" | "easy" | "veryeasy" | "";
  deathpenalty: "hardcore" | "hard" | "easy" | "veryeasy" | "casual" | "";
  resources: "most" | "muchmore" | "more" | "less" | "muchless" | "";
  raids: "muchmore" | "more" | "less" | "muchless" | "none" | "";
  portals: "veryhard" | "hard" | "casual" | "";
}

// Monde Valheim détecté sur disque (dossier worlds_local) — utilisé pour
// proposer les mondes déjà existants (import d'un serveur déjà installé)
// au lieu de retaper le nom exact à la main.
export interface ValheimWorldInfo {
  name: string;
  lastModified: number;
}

export interface ValheimLaunchConfig {
  name: string;
  world: string;
  password: string;
  port: number;
  public: boolean;
  savedir: string;
  crossplay: boolean;
  logFile: string;
  customArgs: string;
  worldSeed: string;
  worldSize: "small" | "medium" | "large" | "yolo" | "";
  // -preset : force le reset de TOUS les modificateurs d'un monde existant
  // ("Setting a preset will overwrite any other previous modifiers" — manuel
  // officiel), contrairement à un -modifier individuel vide qui n'écrase pas
  // ce qui est déjà persisté dans le monde. C'est le seul moyen documenté de
  // revenir à "Normal" sur un monde qui a déjà des modificateurs appliqués.
  modifierPreset:
    | "Normal"
    | "Casual"
    | "Easy"
    | "Hard"
    | "Hardcore"
    | "Immersive"
    | "Hammer"
    | "";
  modifiers: ValheimModifiers;
  // Base URL du plugin BepInEx Odin-Eye (ex: "http://127.0.0.1:21618"),
  // configurée manuellement par l'utilisateur (HttpServerAddress dans
  // org.bepinex.plugins.odineye.cfg). Vide = suivi des joueurs désactivé.
  odinEyeUrl: string;
}

// --- Odin-Eye REST API (plugin BepInEx tiers, Valheim) ---
// Pas d'authentification à ce jour côté plugin — ne jamais exposer ce port
// publiquement (même logique que l'avertissement Palworld).
// Forme réelle du plugin v1.0.0.0 (champs en PascalCase, IDs en chaînes, ex:
// SteamId "Steam_7656119…") — la doc en ligne montre du camelCase et des
// nombres, qui ne correspondent pas à ce que le plugin renvoie.
export interface OdinEyePlayer {
  Id: string;
  CharacterId: string;
  SteamId: string;
  Name: string;
  Health: number;
  MaxHealth: number;
  Stamina: number;
}

// --- Launch arguments (AstroServer.exe) ---
// Astroneer se configure quasi entièrement via Engine.ini / AstroServerSettings.ini
// (voir AstroneerSettings ci-dessous) — customArgs reste pour parité avec les autres jeux.
export interface AstroneerLaunchConfig {
  customArgs: string;
}

// --- Config INI Astroneer (Engine.ini + AstroServerSettings.ini fusionnés) ---
export type AstroneerSettings = Record<string, string | number | boolean>;

// --- Mods Valheim ---
// Registres de mods supportés — Hexium expose une API "compatible Thunderstore"
// (mêmes endpoints /c/{communauté}/api/v1/package/, même champ owner au lieu de
// namespace) donc les deux sont traités par le même client, voir ModRegistryClient.
export type ModRegistry = "thunderstore" | "hexium";

export interface ValheimMod {
  modId: number;
  fileId: number;
  name: string;
  version: string;
  author: string;
  summary: string;
  installedAt: number;
  enabled: boolean;
  installDir: string; // nom du dossier dans BepInEx/plugins/
  pictureUrl?: string;
  /** Date de publication de cette version sur le registre d'origine (unix seconds). */
  publishedAt?: number;
  source?: ModRegistry | "manual";
  // "Auteur-Nom-Version" — nom historique conservé (persisté dans mods.json),
  // vaut pour Thunderstore ET Hexium ; `source` dit lequel interpréter.
  thunderstoreCode?: string;
}

export interface ValheimModConfigFile {
  name: string;
  size: number;
  mtime: number;
}

export interface ThunderstoreModInfo {
  mod_id: number;
  name: string;
  summary: string;
  picture_url?: string;
  version: string;
  author: string;
  endorsement_count: number;
  updated_timestamp: number;
  registry: ModRegistry;
  /** Package marqué déprécié par son auteur sur ce registre. */
  deprecated?: boolean;
}

export interface ThunderstoreModVersion {
  file_id: number;
  file_name: string;
  version: string;
  size_kb: number;
  category_name: string;
  description: string;
  uploaded_timestamp: number;
}

export interface ModUpdate {
  installedCode: string;
  latestCode: string;
  latestVersion: string;
  name: string;
  author: string;
  /** Registre à utiliser pour installer cette mise à jour. */
  registry: ModRegistry;
  /** true si `registry` diffère du registre sur lequel le mod est actuellement installé (ex: mod déprécié sur Thunderstore, toujours maintenu sur Hexium). */
  sourceChanged: boolean;
}

export interface ModUpdateCheck {
  updates: ModUpdate[];
  /** `thunderstoreCode` des mods installés dont le package est déprécié sur leur registre d'origine. */
  deprecatedCodes: string[];
}

// --- Historique des joueurs ---
export interface PlayerSession {
  joinAt: number;
  leaveAt: number | null;
}

export interface PlayerHistoryEntry {
  userId: string;
  playerId: string;
  name: string;
  firstSeen: number;
  lastSeen: number;
  lastIp: string;
  totalPlaytimeMs: number;
  sessionCount: number;
  online: boolean;
  currentSessionStart: number | null;
  sessions: PlayerSession[];
}
