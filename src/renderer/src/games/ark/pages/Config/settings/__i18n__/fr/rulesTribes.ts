export default {
  PreventOfflinePvP: {
    label: "Protection hors ligne (ORP)",
    description:
      "Protège les bases et créatures des tribus déconnectées (PvE et PvP).",
  },
  PreventOfflinePvPInterval: {
    label: "Délai avant la protection hors ligne",
    description:
      "Secondes après la déconnexion avant que la protection s'active.",
  },
  PvPDinoDecay: {
    label: "Abandon des créatures en PvP",
    description:
      "Les créatures se dégradent en PvP pendant la protection hors ligne.",
  },
  PvPStructureDecay: {
    label: "Dégradation des structures en PvP",
    description:
      "Les structures se dégradent en PvP pendant la protection hors ligne.",
  },
  EnablePvPGamma: {
    label: "Commande gamma en PvP",
    description: "Autorise la commande console gamma en PvP.",
  },
  DisablePvEGamma: {
    label: "Bloquer la commande gamma en PvE",
    description: "Interdit la commande console gamma en PvE.",
  },
  IgnorePVPMountedWeaponryRestrictions: {
    label: "Armes sur monture en PvP",
    description:
      "Les joueurs montés peuvent utiliser des armes sur certaines créatures en PvP.",
  },
  bDisableFriendlyFire: {
    label: "Sans tir allié",
    description:
      "Pas de dégâts entre membres d'une tribu, leurs créatures et leurs structures.",
  },
  bPvEDisableFriendlyFire: {
    label: "Sans tir allié en PvE",
    description: "Désactive le tir allié sur les serveurs PvE.",
  },
  bPvEAllowTribeWar: {
    label: "Guerres de tribus en PvE",
    description: "Faux interdit les déclarations de guerre officielles en PvE.",
  },
  bPvEAllowTribeWarCancel: {
    label: "Annuler une guerre",
    description: "Autorise l'annulation d'une guerre acceptée avant son début.",
  },
  bAutoPvETimer: {
    label: "PvE à horaires",
    description:
      "Alterne PvE et PvP selon les heures de début et de fin ci-dessous.",
  },
  bAutoPvEUseSystemTime: {
    label: "Heure du serveur pour le PvE",
    description:
      "Utilise l'heure du PC plutôt que l'heure du jeu pour les horaires de PvE.",
  },
  AutoPvEStartTimeSeconds: {
    label: "Début du PvE",
    description: "Heure de début, en secondes depuis minuit (0 à 86400).",
  },
  AutoPvEStopTimeSeconds: {
    label: "Fin du PvE",
    description: "Heure de fin, en secondes depuis minuit (0 à 86400).",
  },
  PreventOfflinePvPConnectionInvincibleInterval: {
    label: "Invincibilité à la connexion",
    description:
      "Secondes pendant lesquelles un joueur qui se connecte ne prend pas de dégâts.",
  },
  bIncreasePvPRespawnInterval: {
    label: "Allonger la réapparition en PvP",
    description:
      "Le délai de réapparition augmente pour un joueur tué plusieurs fois.",
  },
  IncreasePvPRespawnIntervalBaseAmount: {
    label: "Délai de réapparition ajouté",
    description: "Secondes ajoutées à la réapparition en PvP.",
  },
  IncreasePvPRespawnIntervalCheckPeriod: {
    label: "Fenêtre des morts répétées",
    description:
      "Période (secondes) pendant laquelle les morts répétées allongent le délai.",
  },
  IncreasePvPRespawnIntervalMultiplier: {
    label: "Multiplicateur du délai de réapparition",
    description: "Multiplie le temps ajouté à chaque mort répétée.",
  },
  PreventTribeAlliances: {
    label: "Interdire les alliances",
    description: "Les tribus ne peuvent pas s'allier.",
  },
  TribeNameChangeCooldown: {
    label: "Délai entre changements de nom de tribu",
    description: "Minutes entre deux changements de nom.",
  },
  TribeLogDestroyedEnemyStructures: {
    label: "Journal des structures ennemies détruites",
    description:
      "La destruction d'une structure ennemie apparaît dans le journal de la tribu visée.",
  },
  PreventOutOfTribePinCodeUse: {
    label: "Codes réservés à la tribu",
    description:
      "Les joueurs hors de la tribu ne peuvent pas utiliser les codes des structures.",
  },
  MaxNumberOfPlayersInTribe: {
    label: "Joueurs maximum par tribu",
    description: "1 désactive les tribus ; 0 = sans limite.",
  },
  MaxAlliancesPerTribe: {
    label: "Alliances maximum par tribu",
    description: "Nombre d'alliances qu'une tribu peut former ou rejoindre.",
  },
  MaxTribesPerAlliance: {
    label: "Tribus maximum par alliance",
    description: "Nombre de tribus dans une alliance.",
  },
  MaxTribeLogs: {
    label: "Entrées du journal de tribu",
    description: "Nombre d'entrées affichées dans le journal de chaque tribu.",
  },
  TribeSlotReuseCooldown: {
    label: "Délai de réutilisation d'une place de tribu",
    description:
      "Secondes pendant lesquelles la place d'un membre parti reste bloquée.",
  },
  TribeTowerBonusMultiplier: {
    label: "Bonus de la tour de tribu",
    description: "Multiplicateur du bonus de la tour de tribu.",
  },
};
