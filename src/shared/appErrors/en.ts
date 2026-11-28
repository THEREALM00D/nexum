import type { AppErrorCode } from "../types";

// Voir `fr.ts`.
export const APP_ERRORS_EN: Record<AppErrorCode, string> = {
  NO_SERVER_PATH: "No server folder configured.",
  NO_ACTIVE_SERVER: "No server selected. Pick one in the sidebar.",
  SERVER_NOT_FOUND: "This server no longer exists ({{id}}).",
  UNKNOWN_GAME: "Unknown game: {{game}}",
  SERVER_ALREADY_RUNNING: "The server is already running.",
  BULK_ACTION_RUNNING: "An action on all servers is already running.",
  REMOTE_ADMIN_UNAVAILABLE:
    "Command unavailable: enable the server's RCON or REST API (Configuration page).",
  SERVER_NOT_RUNNING: "The server is not running.",
  SERVER_EXE_NOT_FOUND:
    "{{exe}} not found in {{path}}. Install the server from the Installation page, or check the server folder.",
  SERVER_STOP_TIMEOUT: "The server did not respond to the stop request.",
  STOP_BEFORE_RESTORE: "Stop the server before restoring a backup.",
  BACKUP_SOURCE_NOT_FOUND:
    "Nothing to back up: the world folder doesn't exist ({{path}}). Start the server once so it creates its world.",
  BACKUP_TIMEOUT:
    "The backup took too long and was cancelled (files locked by another program?).",
  BACKUP_FILE_NOT_FOUND: "Backup file not found: {{path}}",
  BACKUP_CORRUPTED:
    "{{name}} is corrupted or incomplete: the backup was probably interrupted while it was being created. Try opening it with 7-Zip to recover what can be.",
  PAL_API_DISABLED:
    "The Palworld REST API is off. Enable it on the Configuration page (RESTAPIEnabled), then restart the server.",
  PAL_API_HTTP:
    "The Palworld REST API answered with an error (HTTP {{status}}). A 401 means the admin password doesn't match.",
  PAL_API_TIMEOUT: "The Palworld REST API did not answer within 8 seconds.",
  PAL_API_UNREACHABLE:
    "Can't reach the Palworld REST API. Check that the server is running and the API port matches the configuration.",
  RCON_AUTH_FAILED:
    "RCON rejected the admin password. Check ServerAdminPassword on the Configuration page.",
  RCON_TIMEOUT: "RCON did not answer within 8 seconds.",
  RCON_UNREACHABLE:
    "Can't reach RCON on port {{port}}. Check that the server has finished starting and that RCON is enabled on the Configuration page.",
  ARK_MAP_INVALID:
    "Invalid map name: {{map}}. Letters, digits and “_” only, for example Svartalfheim_WP.",
  ARK_SAVE_DIR_INVALID:
    "Invalid world folder: {{name}}. Letters, digits and _ only, or empty for SavedArks.",
  ARK_MAX_PLAYERS_INVALID: "Invalid player count (1 to {{max}}).",
  ARK_MOD_ID_INVALID:
    "Invalid mod ID: {{id}}. It's the “Project ID” number shown on the mod's CurseForge page.",
  ARK_MOD_NOT_FOUND:
    "No ARK: Survival Ascended mod with ID {{id}} on CurseForge.",
  ARK_MOD_DUPLICATE: "Mod {{id}} is already in the list.",
  ARK_SETTING_INVALID: "Invalid value for {{key}}: {{value}}",
  ARK_SETTING_UNKNOWN: "Unknown setting: {{key}}",
  ARK_PROFILE_SERVER_RUNNING: "Stop the server to restore a player profile.",
  ARK_PROFILE_NOT_FOUND: "This profile backup no longer exists.",
  ARK_MODS_SERVER_RUNNING: "Stop the server to clean the mods folder.",
  ARK_MODS_CLEAN_FAILED:
    "Can't delete {{path}} ({{detail}}): a file may be open in another program.",
  ARK_PROFILE_READ_FAILED:
    "Can't read {{path}} ({{detail}}): check that the backup folder is reachable.",
  ARK_PROFILE_COPY_FAILED:
    "Can't copy {{path}} ({{detail}}): check that the folder exists and that you're allowed to write to it.",
  CURSEFORGE_FORBIDDEN:
    "CurseForge rejects this Nexum build's key for mod search.",
  CURSEFORGE_UNAVAILABLE:
    "This Nexum build has no CurseForge key: mod search isn't available.",
  ARK_PORTS_SAME:
    "The game port and the query port must be different (both are UDP).",
  NETWORK_ERROR:
    "Can't reach {{host}} ({{detail}}). Check your Internet connection.",
  HTTP_ERROR: "{{host}} answered with an error (HTTP {{status}}).",
  INVALID_RESPONSE: "Unexpected response from {{host}} (HTTP {{status}}).",
  TOO_MANY_REDIRECTS: "Too many redirects: download cancelled.",
  DOWNLOAD_TIMEOUT: "The download stalled and was cancelled. Try again.",
  PUBLIC_IP_FAILED: "Couldn't get your public IP ({{detail}}).",
  STEAMCMD_FAILED:
    "SteamCMD failed (code {{code}}). The installation log above shows why.",
  STEAMCMD_OLD_BUILD_DENIED:
    "SteamCMD couldn't update this old installation (code {{code}}). Install the server in an empty folder, then copy your saves and settings into it.",
  STEAMCMD_EXTRACT_FAILED: "Couldn't extract SteamCMD (code {{code}}).",
  FILE_NOT_FOUND: "File not found: {{path}}",
  INVALID_FILE_NAME: "Invalid file name.",
  MOD_NOT_FOUND: "Mod {{name}} not found on the mod registries.",
  MOD_CODE_INVALID:
    "Invalid format. Expected: Author-ModName-Version (e.g. denikson-BepInExPack_Valheim-5.4.2202).",
  MOD_FILES_IN_USE:
    "The files of mod {{name}} are in use (is the server running?). Stop the server and try again: the installed version was left unchanged.",
  BEPINEX_VERSION_UNAVAILABLE:
    "Couldn't get the BepInExPack_Valheim version from Thunderstore.",
  BEPINEX_ZIP_INVALID:
    "Unexpected BepInEx archive: BepInEx/core/BepInEx.dll is missing.",
  PROFILE_NO_R2X:
    "This profile has no export.r2x file: it's not an r2modman/Gale profile.",
  PROFILE_EMPTY: "This profile contains no mods.",
  PROFILE_UNRESOLVED:
    "Couldn't find this profile code on Thunderstore or Hexium. It may have expired: ask for a new one.",
  PROFILE_UNEXPECTED_RESPONSE: "Unexpected answer from the profile service.",
  PROFILE_INVALID_CODE: "Invalid profile code.",
  PROFILE_UNKNOWN_FORMAT: "Unknown profile format.",
  MODPACK_NO_MODS: "No active mod to share.",
  MODPACK_NO_CODE: "Thunderstore didn't return a profile code. Try again.",
  PORT_CONFLICT:
    "Port conflict with a server that is already running: {{list}}",
  VALHEIM_PASSWORD_IN_NAME:
    "The Valheim password must not appear in the server name.",
  VALHEIM_PASSWORD_TOO_SHORT:
    "The Valheim password must be at least 5 characters long (or empty).",
  DW_OWNER_ID_MISSING:
    "Enter your Player ID (OwnerId) on the Configuration page: the Dragonwilds server won't start without it. It's shown at the bottom of the game's Settings menu.",
  DW_OWNER_ID_INVALID:
    "Invalid Player ID: copy it as is from the game's Settings menu (letters and digits only).",
  CONFIG_LOCKED:
    "Stop the server before changing its configuration: it rewrites this file while running.",
  PORT_INVALID: "Invalid port (1 to 65535).",
  PORTS_SAME: "The game port and the beacon port must be different.",
  STOP_BEFORE_WORLD_CHANGE: "Stop the server before switching worlds.",
  WORLD_NOT_FOUND: "World not found: {{name}}",
  NOT_A_WORLD_SAVE: "This file is not a Dragonwilds world save.",
  BACKUP_BEFORE_UPDATE_FAILED:
    'Update cancelled: the world backup failed ({{msg}}). Check the backup folder, or turn off "Back up the world before every update" on the Backups page.',
  ODIN_EYE_NO_URL: "Enter the Odin-Eye address first.",
  ODIN_EYE_INVALID_URL:
    'Invalid Odin-Eye address "{{url}}". Expected format: http://127.0.0.1:21618',
  ODIN_EYE_UNREACHABLE:
    'Nothing answers at {{url}}. Check that the server is running and its world is loaded, that the BepInEx log contains "OdinEye running!", and that this address matches HttpServerAddress in BepInEx/config/org.bepinex.plugins.odineye.cfg.',
  ODIN_EYE_TIMEOUT:
    "{{url}} did not answer within 8 seconds. Check the address and that nothing (firewall, other program) blocks this port.",
  ODIN_EYE_HTTP:
    "{{url}} answered with an error (HTTP {{status}}). Check that this address is Odin-Eye's.",
  ODIN_EYE_NO_ENDPOINT:
    "Something answers at {{url}}, but it's not the Odin-Eye players API. Check the port, and that the plugin is up to date.",
  ENSHROUDED_CONFIG_INVALID:
    "enshrouded_server.json can't be read ({{detail}}): the server wouldn't start. Fix it, or delete it so the server creates a new one on its next start (a .backup copy is kept next to it).",
  ENSHROUDED_GROUP_INVALID:
    "Every group needs a name, and two groups can't share the same one.",
  ENSHROUDED_SLOTS_INVALID:
    "Invalid number of slots: between 1 and {{max}} players, and the groups' reserved slots can't add up to more than that.",
  TRANSFER_FILE_INVALID:
    "This file isn't a valid Nexum export, or it has been edited.",
  TRANSFER_FILE_TOO_NEW:
    "This file comes from a newer version of Nexum: update Nexum to import it.",
  TRANSFER_TARGET_RUNNING:
    "The server “{{name}}” uses these folders and is running: stop it or choose other folders.",
  TRANSFER_WRITE_FAILED:
    "Can't write {{path}} ({{detail}}): check that the folder exists and that you're allowed to write to it. No server was added.",
  STOP_BEFORE_EXPORT:
    "Stop the server before exporting it: its world must not change during the copy.",
};
