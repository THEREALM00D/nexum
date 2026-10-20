export default {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirm: "Confirm",
    browse: "Browse",
    error: "Error",
    success: "Success",
    language: "Language",
    errorPrefix: "Error: {{msg}}",
    change: "Change",
    or: "OR",
    clearSearch: "Clear search",
  },
  serverControls: {
    startFailed: "Couldn't start the server",
    stopFailed: "Couldn't stop the server",
    restartFailed: "Couldn't restart the server",
  },
  appErrors: {
    NO_SERVER_PATH: "No server folder configured.",
    NO_ACTIVE_SERVER: "No server selected. Pick one in the sidebar.",
    SERVER_NOT_FOUND: "This server no longer exists ({{id}}).",
    UNKNOWN_GAME: "Unknown game: {{game}}",
    SERVER_ALREADY_RUNNING: "The server is already running.",
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
    NETWORK_ERROR:
      "Can't reach {{host}} ({{detail}}). Check your Internet connection.",
    HTTP_ERROR: "{{host}} answered with an error (HTTP {{status}}).",
    INVALID_RESPONSE: "Unexpected response from {{host}} (HTTP {{status}}).",
    TOO_MANY_REDIRECTS: "Too many redirects: download cancelled.",
    DOWNLOAD_TIMEOUT: "The download stalled and was cancelled. Try again.",
    PUBLIC_IP_FAILED: "Couldn't get your public IP ({{detail}}).",
    STEAMCMD_FAILED:
      "SteamCMD failed (code {{code}}). The installation log above shows why.",
    STEAMCMD_EXTRACT_FAILED: "Couldn't extract SteamCMD (code {{code}}).",
    FILE_NOT_FOUND: "File not found: {{path}}",
    INVALID_FILE_NAME: "Invalid file name.",
    MOD_NOT_FOUND: "Mod {{name}} not found on the mod registries.",
    MOD_CODE_INVALID:
      "Invalid format. Expected: Author-ModName-Version (e.g. denikson-BepInExPack_Valheim-5.4.2202).",
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
  },
  installDir: {
    warning:
      "This folder is inside Nexum's install folder ({{dir}}). Up to version 0.12.3, Nexum emptied that folder on every update: choose a folder outside it to keep your files safe.",
  },
  gameUpdate: {
    available:
      "{{name}}: a server update is available (build {{build}}). Players who updated their game won't be able to join.",
    availableSteamLibrary:
      "{{name}}: a server update is available (build {{build}}). Installed through the Steam library: update it from Steam.",
    update: "Update",
  },
  modUpdate: {
    available_one:
      "{{name}}: 1 mod has an update. Update it while the server is stopped.",
    available_other:
      "{{name}}: {{count}} mods have an update. Update them while the server is stopped.",
    deprecated_one: "{{name}}: 1 mod was deprecated by its author.",
    deprecated_other:
      "{{name}}: {{count}} mods were deprecated by their authors.",
    open: "See mods",
  },
  status: {
    running: "Online",
    starting: "Starting...",
    stopping: "Stopping...",
    crashed: "Crashed",
    stopped: "Stopped",
  },
  backup: {
    title: "Backups",
    config: {
      title: "Configuration",
      dir: "Backup folder",
      dirTooltip: "Choose a folder",
      dirOpen: "Open in explorer",
      keep: "Backups to keep (rotation)",
      keepHelper: "0 = no rotation. Pre-update backups are counted separately.",
      auto: "Automatic backup",
      autoOff: "Disabled",
      auto15: "Every 15 minutes",
      auto30: "Every 30 minutes",
      auto60: "Every hour",
      auto180: "Every 3 hours",
      auto360: "Every 6 hours",
      auto720: "Every 12 hours",
      auto1440: "Once a day",
      beforeUpdate: "Back up the world before every update",
      beforeUpdateHelper:
        "Before updating the game (Installation page, scheduled restart) or the mods. If the backup fails, the update does not run.",
    },
    list: {
      title: "Backups ({{count}})",
      create: "Create a backup",
      creating: "Backing up...",
      none: "No backup",
      restoreTooltip: "Restore (server must be stopped)",
      deleteTooltip: "Delete",
      restoreConfirm:
        "Restore {{name}}?\nThe current save will be overwritten.",
      deleteConfirm: "Delete {{name}}?",
      beforeUpdate: "Before update",
    },
    notify: {
      cannotLoad: "Unable to load backups",
      created: "Backup created: {{name}}",
      createFailed: "Backup failed",
      restored: "Backup restored: {{name}}",
      restoreFailed: "Restore failed",
      deleted: "Backup deleted",
      deleteFailed: "Unable to delete the backup",
      configFailed: "Unable to save the backup configuration",
      beforeUpdate: "World backed up before the update: {{name}}",
    },
  },
  schedule: {
    title: "Schedule",
    subtitle: "Automatic daily server restart",
    enabled: "Enable scheduled restart",
    time: "Time (24h)",
    warning: "Warning (minutes before)",
    warningHelper:
      "Delay between the announcement and the shutdown (0 = immediate)",
    message: "Announcement message",
    messageHelper: "{minutes} will be replaced by the delay",
    updateGame: "Update the game at restart time",
    updateGameHelper:
      "If a server update is available: shutdown, world backup, update with SteamCMD, then start. No effect for a server installed through the Steam library.",
    save: "Save",
    notify: {
      saved: "Schedule saved",
      saveFailed: "Unable to save the schedule",
    },
  },
};
