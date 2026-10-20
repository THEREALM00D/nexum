// Types partagés entre main, preload et renderer.
// Tout ce qui transite via IPC doit avoir le même type des deux côtés.

// --- Serveurs ---
export type GameType = "palworld" | "valheim" | "astroneer" | "dragonwilds";

export interface Server {
  id: string;
  name: string;
  gameType: GameType;
  path: string;
  color: string | null;
  createdAt: number;
  // Démarré automatiquement à l'ouverture de Nexum (cf. autoStartServers)
  autoStart?: boolean;
}

// « Lancer Nexum au démarrage de Windows » — `supported` faux en dev
export interface LaunchAtLoginState {
  supported: boolean;
  enabled: boolean;
}

// Configuration par-serveur (launch args, backup, restart) — stockée séparément
// de `Server` pour garder le type Server simple et pouvoir hot-reload la config
// sans toucher au serveur lui-même.
export interface ServerConfig {
  launchArgs: LaunchArgsConfig;
  valheimConfig: ValheimLaunchConfig;
  astroneerConfig: AstroneerLaunchConfig;
  dragonwildsConfig: DragonwildsLaunchConfig;
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

/**
 * Fichier de log d'une session de serveur (démarrage → arrêt), conservé sur
 * disque (`{userData}/servers/<id>/logs/`).
 */
export interface LogSession {
  /** Nom du fichier, ex. `2026-10-07_14-32-05.log` (identifiant de la session). */
  name: string;
  startedAt: number;
  sizeBytes: number;
  /** Le serveur s'est arrêté seul avec une erreur (fichier `.crashed.log`). */
  crashed: boolean;
  /** Session en cours (le serveur tourne encore). */
  current: boolean;
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
  /** Faite automatiquement avant une mise à jour du jeu ou des mods. */
  beforeUpdate: boolean;
}

export interface BackupConfig {
  backupDir: string;
  backupKeep: number;
  backupIntervalMinutes: number;
  /** Sauvegarde du monde avant chaque mise à jour du jeu ou des mods. */
  backupBeforeUpdate: boolean;
}

// --- Scheduler ---
export interface RestartConfig {
  enabled: boolean;
  time: string; // "HH:MM" 24h
  warningMinutes: number;
  message: string;
  /** Met le jeu à jour (SteamCMD) au moment du redémarrage s'il y a une mise à jour. */
  updateGame: boolean;
}

// --- Firewall ---
// Règle de pare-feu nommée, pour les opérations groupées (une seule invite UAC)
export interface FirewallNamedRule {
  name: string;
  port: number;
  protocol: "TCP" | "UDP";
}

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
  /** Installé via la bibliothèque Steam : c'est Steam qui le met à jour. */
  steamLibrary: boolean;
}

/**
 * Envoyé au renderer (`server:gameUpdateAvailable`) quand la vérification
 * faite au démarrage d'un serveur trouve une version plus récente du jeu.
 */
export interface GameUpdateNotice {
  serverId: string;
  installedBuild: string;
  latestBuild: string;
  steamLibrary: boolean;
}

/** Mods Valheim à mettre à jour, trouvés au démarrage du serveur. */
export interface ModUpdateNotice {
  serverId: string;
  /** Mods actifs avec une version plus récente. */
  updates: number;
  /** Mods actifs dépréciés par leur auteur sur leur registre. */
  deprecated: number;
}

/** Infos pour rejoindre un serveur (carte « Rejoindre le serveur »). */
export interface JoinInfo {
  /** IPv4 de ce PC sur le réseau local, pour les joueurs du même réseau. */
  localIp: string | null;
  /** Port de jeu à donner aux joueurs. */
  port: number;
  /** Port(s) UDP à rediriger sur la box, ex. "2456-2458". */
  portRange: string;
  /** Valheim lancé avec -crossplay : on rejoint aussi par code. */
  crossplay: boolean;
  /** Nom à chercher dans la liste des mondes du jeu (Dragonwilds). */
  searchName?: string;
}

// --- Mise à jour de Nexum lui-même (electron-updater, releases GitHub) ---
/** Cause d'une erreur de mise à jour, traduite côté renderer. */
export type AppUpdateErrorKind =
  "network" | "rateLimit" | "timeout" | "unknown";

export type AppUpdateStatus =
  /** Aucune vérification encore faite depuis le lancement. */
  | { state: "idle" }
  | { state: "checking" }
  /** Dernière vérification : déjà à la dernière version (`checkedAt` = timestamp ms). */
  | { state: "upToDate"; checkedAt: number }
  | { state: "available"; version: string }
  | { state: "downloading"; percent: number }
  | { state: "downloaded"; version: string }
  | { state: "error"; kind: AppUpdateErrorKind; message: string }
  /** Fichiers de la release pas encore tous en ligne (déploiement en cours côté GitHub Actions) — pas une vraie erreur. */
  | { state: "unavailable" }
  /** `yarn dev` : pas d'app-update.yml packagé, la vérification est impossible. */
  | { state: "devMode" };

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

// --- Erreurs du main traduites côté renderer ---
// Le main renvoie `@app:{"code":…,"params":…}` (main/utils/appError.ts), le
// renderer l'affiche dans la langue de l'UI (renderer/src/utils/appErrorMessage.ts,
// textes dans i18n/__i18n__ → `appErrors`).
export type AppErrorCode =
  | "NO_SERVER_PATH"
  // Serveurs et processus
  | "NO_ACTIVE_SERVER"
  | "SERVER_NOT_FOUND"
  | "UNKNOWN_GAME"
  | "SERVER_ALREADY_RUNNING"
  | "SERVER_NOT_RUNNING"
  | "SERVER_EXE_NOT_FOUND"
  | "SERVER_STOP_TIMEOUT"
  // Sauvegardes
  | "STOP_BEFORE_RESTORE"
  | "BACKUP_SOURCE_NOT_FOUND"
  | "BACKUP_TIMEOUT"
  | "BACKUP_FILE_NOT_FOUND"
  | "BACKUP_CORRUPTED"
  // Palworld (API REST)
  | "PAL_API_DISABLED"
  | "PAL_API_HTTP"
  | "PAL_API_TIMEOUT"
  | "PAL_API_UNREACHABLE"
  // Réseau / téléchargements (registres de mods, SteamCMD, IP publique)
  | "NETWORK_ERROR"
  | "HTTP_ERROR"
  | "INVALID_RESPONSE"
  | "TOO_MANY_REDIRECTS"
  | "DOWNLOAD_TIMEOUT"
  | "PUBLIC_IP_FAILED"
  | "STEAMCMD_FAILED"
  | "STEAMCMD_EXTRACT_FAILED"
  // Fichiers
  | "FILE_NOT_FOUND"
  | "INVALID_FILE_NAME"
  // Mods Valheim
  | "MOD_NOT_FOUND"
  | "MOD_CODE_INVALID"
  | "BEPINEX_VERSION_UNAVAILABLE"
  | "BEPINEX_ZIP_INVALID"
  | "PROFILE_NO_R2X"
  | "PROFILE_EMPTY"
  | "PROFILE_UNRESOLVED"
  | "PROFILE_UNEXPECTED_RESPONSE"
  | "PROFILE_INVALID_CODE"
  | "PROFILE_UNKNOWN_FORMAT"
  | "MODPACK_NO_MODS"
  | "MODPACK_NO_CODE"
  | "PORT_CONFLICT"
  | "VALHEIM_PASSWORD_IN_NAME"
  | "VALHEIM_PASSWORD_TOO_SHORT"
  | "DW_OWNER_ID_MISSING"
  | "DW_OWNER_ID_INVALID"
  | "CONFIG_LOCKED"
  | "PORT_INVALID"
  | "PORTS_SAME"
  | "STOP_BEFORE_WORLD_CHANGE"
  | "WORLD_NOT_FOUND"
  | "NOT_A_WORLD_SAVE"
  | "BACKUP_BEFORE_UPDATE_FAILED"
  | "ODIN_EYE_NO_URL"
  | "ODIN_EYE_INVALID_URL"
  | "ODIN_EYE_UNREACHABLE"
  | "ODIN_EYE_TIMEOUT"
  | "ODIN_EYE_HTTP"
  | "ODIN_EYE_NO_ENDPOINT";

// --- RuneScape: Dragonwilds ---
// Ports passés en arguments (-Port / -BeaconPort), le reste vit dans
// DedicatedServer.ini (voir DragonwildsSettings).
export interface DragonwildsLaunchConfig {
  port: number;
  beaconPort: number;
  /**
   * Le serveur retire AdminPassword de DedicatedServer.ini après l'avoir lu :
   * Nexum le garde ici et le réécrit dans le fichier avant chaque démarrage.
   */
  adminPassword: string;
  customArgs: string;
}

// Vue fusionnée de la page Config : clés de DedicatedServer.ini (chaînes
// brutes) + Port / BeaconPort / AdminPassword / customArgs de la config de
// lancement.
export type DragonwildsSettings = Record<string, string | number>;

/** Sauvegarde de monde (.sav) — solo (client du jeu) ou du serveur. */
export interface DragonwildsWorld {
  /**
   * Nom inscrit dans la sauvegarde : c'est lui que le serveur cherche
   * (DefaultWorldName), pas le nom du fichier.
   */
  worldName: string;
  fileName: string;
  path: string;
  sizeBytes: number;
  lastModified: number;
}

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

/** Résultat du partage du modpack d'un serveur Valheim (code r2modman/Gale). */
export interface ModpackShare {
  /** Code à coller dans Gale / r2modman (Importer un profil → code). */
  code: string;
  /** Mods inclus (BepInExPack compris). */
  modCount: number;
  /** Mods installés à la main, sans code de registre : non inclus. */
  skippedManual: number;
  /** Le pack contient des mods Hexium : r2modman ne sait pas les installer. */
  includesHexium: boolean;
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
