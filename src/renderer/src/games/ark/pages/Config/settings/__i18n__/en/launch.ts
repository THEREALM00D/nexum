export default {
  ServerPlatform: {
    label: "Accepted platforms",
    description:
      'ALL: PC and consoles (default). PC: PC only, needed for "PC only" mods.',
  },
  clusterid: {
    label: "Cluster ID",
    description:
      "Same value on several servers to transfer survivors, creatures and items.",
  },
  ClusterDirOverride: {
    label: "Cluster folder",
    description: "Shared transfer folder (needs a cluster ID).",
  },
  NoTransferFromFiltering: {
    label: "Block non-cluster transfers",
    description:
      "Prevents transfers from singleplayer or servers without a cluster.",
  },
  culture: {
    label: "Server language",
    description:
      "Language code of server messages (en, fr, de…). Doesn't change the players' language.",
  },
  ActiveEvent: {
    label: "Event",
    description: "Turns on a seasonal event.",
  },
  ForceRespawnDinos: {
    label: "Recreate wild creatures",
    description: "⚠️ Deletes every wild creature at each start.",
  },
  NoDinos: {
    label: "No wild creatures",
    description: "No more wild creatures spawn (existing ones stay).",
  },
  NoWildBabies: {
    label: "No wild babies",
    description: "Wild babies no longer spawn.",
  },
  NoDinosExceptForcedSpawn: {
    label: "Creatures: forced spawns only",
    description: "Only forced spawns happen.",
  },
  NoDinosExceptStreamingSpawn: {
    label: "Creatures: streaming spawns only",
    description: "Only spawns from area streaming happen.",
  },
  NoDinosExceptManualSpawn: {
    label: "Creatures: manual spawns only",
    description: "Only manually spawned creatures appear.",
  },
  NoDinosExceptWaterSpawn: {
    label: "Creatures: aquatic only",
    description: "Only aquatic creatures spawn.",
  },
  ForceAllowCaveFlyers: {
    label: "Flyers in caves",
    description: "Allows flying creatures in caves.",
  },
  AllowFlyerSpeedLeveling: {
    label: "Flyer speed (option)",
    description: "Allows flyer speed points (see also Creatures).",
  },
  imprintlimit: {
    label: "Imprint limit",
    description:
      "Deletes creatures above this imprint percentage (101 recommended).",
  },
  UseTameEffectivenessClamp: {
    label: "Clamp taming effectiveness",
    description: "Taming effectiveness doesn't go over 100%.",
  },
  AutoDestroyStructures: {
    label: "Auto-destroy structures",
    description: "Turns on destruction of old structures (delay: Structures).",
  },
  EnableIdlePlayerKick: {
    label: "Kick idle players",
    description: "Turns on idle player kicks (delay: Administration).",
  },
  exclusivejoin: {
    label: "Whitelist (option)",
    description: "Only whitelisted players can join.",
  },
  pvedisallowtribewar: {
    label: "Forbid wars in PvE",
    description: "Tribes can't declare war in PvE.",
  },
  pveallowtribewar: {
    label: "Allow wars in PvE",
    description: "Tribes can declare war in PvE.",
  },
  DisableRailgunPVP: {
    label: "No Tek railgun in PvP",
    description: "Turns off the Tek railgun on PvP servers.",
  },
  DisableCustomCosmetics: {
    label: "No custom cosmetics",
    description: "Turns off players' cosmetic mods.",
  },
  DoCustomCosmeticValidation: {
    label: "Validate cosmetics",
    description: "Validates players' cosmetic mods.",
  },
  DisableCustomFoldersInTributeInventories: {
    label: "No folders in transfers",
    description: "Forbids folders in the transfer inventory.",
  },
  MinimumTimeBetweenInventoryRetrieval: {
    label: "Inventory retrieval cooldown",
    description:
      "Seconds before an inventory can be retrieved again after death.",
  },
  TotalConversionMod: {
    label: "Total conversion mod",
    description: "ID of the total conversion mod to load.",
  },
  servergamelog: {
    label: "Admin log",
    description: "Saves admin actions (and RCON) to dated files.",
  },
  servergamelogincludetribelogs: {
    label: "Tribe logs in the log",
    description: "Adds tribe logs to the server log.",
  },
  ServerRCONOutputTribeLogs: {
    label: "Tribe logs over RCON",
    description: "Sends tribe logs over RCON (needs the previous option).",
  },
  NotifyAdminCommandsInChat: {
    label: "Admin commands in admin chat",
    description: "Admin commands are shown to admins only.",
  },
  AllowChatSpam: {
    label: "Allow chat spam",
    description: "Turns off chat spam protection.",
  },
  webalarm: {
    label: "Web alarms",
    description: "Web notifications for tribe events (alarms, births…).",
  },
  UseDynamicConfig: {
    label: "Dynamic config",
    description: "Turns on dynamic config (URL: Administration).",
  },
  MaxNumOfSaveBackups: {
    label: "Game save backups",
    description: "Number of save backups kept by the game.",
  },
  GBUsageToForceRestart: {
    label: "Restart above X GB",
    description:
      "Saves and restarts the server above this many GB of RAM; 0 turns it off.",
  },
  usestore: {
    label: "Separate profiles",
    description: "Saves character profiles to separate files.",
  },
  converttostore: {
    label: "Convert to separate profiles",
    description: "Converts data at the next save (needs Separate profiles).",
  },
  BackupTransferPlayerDatas: {
    label: "Back up profiles",
    description: "Keeps copies of profiles (needs Separate profiles).",
  },
  disableCharacterTracker: {
    label: "No character tracking",
    description: "Turns off character tracking.",
  },
  UseItemDupeCheck: {
    label: "Item anti-dupe",
    description: "Extra protection against item duplication.",
  },
  EnableVictoryCoreDupeCheck: {
    label: "Creature anti-dupe",
    description: "Extra check against creature duplication.",
  },
  ForceDupeLog: {
    label: "Dupe log",
    description: "Forces the duplication log.",
  },
  DisableDupeLogDeletes: {
    label: "Keep the dupe log",
    description: 'Prevents "Dupe log" from taking effect.',
  },
  ignoredupeditems: {
    label: "Ignore duped items",
    description: "Doesn't remove duped items that are found.",
  },
  noundermeshchecking: {
    label: "No under-mesh protection",
    description: "Turns off protection against going under the terrain.",
  },
  noundermeshkilling: {
    label: "No under-mesh kills",
    description: "Players under the terrain are teleported instead of killed.",
  },
  forcedisablemeshchecking: {
    label: "No terrain checking",
    description: "Turns off terrain checking when vegetation grows back.",
  },
  UnstasisDinoObstructionCheck: {
    label: "Creatures in walls",
    description:
      "Stops creatures from going through walls and terrain when they wake.",
  },
  UseServerNetSpeedCheck: {
    label: "Network speed check",
    description: "Drops extra player movement data on each tick.",
  },
  BattlEyeServerRecheck: {
    label: "Recheck BattlEye",
    description: "Checks BattlEye status on each tick (official servers).",
  },
  insecure: {
    label: "No VAC",
    description: "Turns off Valve Anti-Cheat (VAC).",
  },
  StasisKeepControllers: {
    label: "Keep AI in memory",
    description: "Better performance on big maps, more memory used.",
  },
  AlwaysTickDedicatedSkeletalMeshes: {
    label: "Animate all creatures",
    description: "Turns off the animation optimization of idle creatures.",
  },
  disabledinonetrangescaling: {
    label: "Fixed creature network range",
    description:
      "Creature network range no longer depends on the player count.",
  },
  NoHangDetection: {
    label: "No hang detection",
    description:
      "The server doesn't stop if starting takes more than 45 minutes.",
  },
  NoAI: {
    label: "No AI",
    description: "⚠️ Creatures have no AI anymore (tests only).",
  },
  nosound: {
    label: "No sound",
    description: "Turns off server sound.",
  },
  noperfthreads: {
    label: "No performance threads",
    description: "Turns off performance threads.",
  },
  onethread: {
    label: "Single thread",
    description: "⚠️ Turns off multithreading (tests only).",
  },
};
