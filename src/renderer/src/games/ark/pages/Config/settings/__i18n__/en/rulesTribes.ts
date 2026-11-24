export default {
  PreventOfflinePvP: {
    label: "Offline raid protection (ORP)",
    description:
      "Protects the bases and creatures of offline tribes (PvE and PvP).",
  },
  PreventOfflinePvPInterval: {
    label: "Delay before offline protection",
    description: "Seconds after logging off before the protection starts.",
  },
  PvPDinoDecay: {
    label: "Creature decay in PvP",
    description: "Creatures decay in PvP while offline protection is active.",
  },
  PvPStructureDecay: {
    label: "Structure decay in PvP",
    description: "Structures decay in PvP while offline protection is active.",
  },
  EnablePvPGamma: {
    label: "Gamma command in PvP",
    description: "Allows the gamma console command in PvP.",
  },
  DisablePvEGamma: {
    label: "Block gamma command in PvE",
    description: "Forbids the gamma console command in PvE.",
  },
  IgnorePVPMountedWeaponryRestrictions: {
    label: "Weapons while mounted in PvP",
    description: "Mounted players can use weapons on some creatures in PvP.",
  },
  bDisableFriendlyFire: {
    label: "No friendly fire",
    description:
      "No damage between tribe members, their creatures and their structures.",
  },
  bPvEDisableFriendlyFire: {
    label: "No friendly fire in PvE",
    description: "Turns off friendly fire on PvE servers.",
  },
  bPvEAllowTribeWar: {
    label: "Tribe wars in PvE",
    description: "False forbids official war declarations in PvE.",
  },
  bPvEAllowTribeWarCancel: {
    label: "Cancel a war",
    description: "Allows cancelling an accepted war before it starts.",
  },
  bAutoPvETimer: {
    label: "Scheduled PvE",
    description:
      "Switches between PvE and PvP using the start and end times below.",
  },
  bAutoPvEUseSystemTime: {
    label: "Server clock for PvE",
    description:
      "Uses the PC's clock instead of in-game time for the PvE schedule.",
  },
  AutoPvEStartTimeSeconds: {
    label: "PvE start",
    description: "Start time, in seconds after midnight (0 to 86400).",
  },
  AutoPvEStopTimeSeconds: {
    label: "PvE end",
    description: "End time, in seconds after midnight (0 to 86400).",
  },
  PreventOfflinePvPConnectionInvincibleInterval: {
    label: "Invincibility on login",
    description: "Seconds during which a player who logs in takes no damage.",
  },
  bIncreasePvPRespawnInterval: {
    label: "Longer PvP respawn",
    description: "The respawn delay grows for a player killed several times.",
  },
  IncreasePvPRespawnIntervalBaseAmount: {
    label: "Added respawn delay",
    description: "Seconds added to PvP respawn.",
  },
  IncreasePvPRespawnIntervalCheckPeriod: {
    label: "Repeated death window",
    description:
      "Period (seconds) during which repeated deaths extend the delay.",
  },
  IncreasePvPRespawnIntervalMultiplier: {
    label: "Respawn delay multiplier",
    description: "Multiplies the time added for each repeated death.",
  },
  PreventTribeAlliances: {
    label: "Forbid alliances",
    description: "Tribes can't form alliances.",
  },
  TribeNameChangeCooldown: {
    label: "Tribe rename cooldown",
    description: "Minutes between two name changes.",
  },
  TribeLogDestroyedEnemyStructures: {
    label: "Log destroyed enemy structures",
    description:
      "Destroying an enemy structure shows up in the target tribe's log.",
  },
  PreventOutOfTribePinCodeUse: {
    label: "Tribe-only pin codes",
    description: "Players outside the tribe can't use structure pin codes.",
  },
  MaxNumberOfPlayersInTribe: {
    label: "Max players per tribe",
    description: "1 turns tribes off; 0 = no limit.",
  },
  MaxAlliancesPerTribe: {
    label: "Max alliances per tribe",
    description: "Number of alliances a tribe can form or join.",
  },
  MaxTribesPerAlliance: {
    label: "Max tribes per alliance",
    description: "Number of tribes in an alliance.",
  },
  MaxTribeLogs: {
    label: "Tribe log entries",
    description: "Entries shown in each tribe's log.",
  },
  TribeSlotReuseCooldown: {
    label: "Tribe slot reuse cooldown",
    description: "Seconds a departed member's slot stays locked.",
  },
  TribeTowerBonusMultiplier: {
    label: "Tribe tower bonus",
    description: "Multiplier of the tribe tower bonus.",
  },
};
