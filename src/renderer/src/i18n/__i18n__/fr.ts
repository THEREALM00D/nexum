import { APP_ERRORS_FR } from "@shared/appErrors/fr";

export default {
  common: {
    save: "Sauvegarder",
    cancel: "Annuler",
    delete: "Supprimer",
    confirm: "Confirmer",
    browse: "Parcourir",
    error: "Erreur",
    success: "Succès",
    language: "Langue",
    errorPrefix: "Erreur : {{msg}}",
    units: { b: "o", kb: "Ko", mb: "Mo", gb: "Go" },
    change: "Modifier",
    or: "OU",
    clearSearch: "Effacer la recherche",
    minimize: "Réduire",
    maximize: "Agrandir",
    restore: "Restaurer",
    close: "Fermer",
  },
  serverControls: {
    startFailed: "Impossible de démarrer le serveur",
    stopFailed: "Impossible d'arrêter le serveur",
    restartFailed: "Impossible de redémarrer le serveur",
  },
  appErrors: APP_ERRORS_FR,
  gameRequirements: {
    hint: "{{game}} demande un PC costaud : environ {{ram}} Go de RAM pour le serveur seul et {{disk}} Go d'espace disque libre.",
  },
  installDir: {
    warning:
      "Ce dossier est dans le dossier d'installation de Nexum ({{dir}}). Jusqu'à la version 0.12.3, Nexum vidait ce dossier à chaque mise à jour : choisissez un dossier en dehors pour protéger vos fichiers.",
  },
  gameUpdate: {
    available:
      "{{name}} : une mise à jour du serveur est disponible (build {{build}}). Les joueurs qui ont mis le jeu à jour ne pourront pas se connecter.",
    availableSteamLibrary:
      "{{name}} : une mise à jour du serveur est disponible (build {{build}}). Installé via la bibliothèque Steam : mettez-le à jour depuis Steam.",
    update: "Mettre à jour",
  },
  autoRestart: {
    gaveUp:
      "{{name}} : relance automatique abandonnée après {{crashes}} plantages en moins de {{minutes}} min. Consultez les logs des sessions plantées, puis démarrez le serveur à la main.",
    failed: "{{name}} n'a pas pu être relancé après son plantage : {{error}}",
    viewLogs: "Voir les logs",
  },
  autoStart: {
    failed: "{{name}} n'a pas pu démarrer automatiquement : {{error}}",
  },
  modUpdate: {
    available_one:
      "{{name}} : 1 mod a une mise à jour. Mettez-le à jour serveur arrêté.",
    available_other:
      "{{name}} : {{count}} mods ont une mise à jour. Mettez-les à jour serveur arrêté.",
    deprecated_one: "{{name}} : 1 mod a été déprécié par son auteur.",
    deprecated_other:
      "{{name}} : {{count}} mods ont été dépréciés par leurs auteurs.",
    open: "Voir les mods",
  },
  status: {
    running: "En ligne",
    starting: "Démarrage...",
    stopping: "Arrêt...",
    crashed: "Planté",
    stopped: "Arrêté",
  },
  backup: {
    title: "Sauvegardes",
    config: {
      title: "Configuration",
      dir: "Dossier de sauvegarde",
      dirOpen: "Ouvrir dans l'explorateur",
      keep: "Sauvegardes à conserver (rotation)",
      keepHelper:
        "0 = pas de rotation. Les sauvegardes d'avant mise à jour sont comptées à part.",
      auto: "Sauvegarde automatique",
      autoOff: "Désactivée",
      auto15: "Toutes les 15 minutes",
      auto30: "Toutes les 30 minutes",
      auto60: "Toutes les heures",
      auto180: "Toutes les 3 heures",
      auto360: "Toutes les 6 heures",
      auto720: "Toutes les 12 heures",
      auto1440: "Une fois par jour",
      beforeUpdate: "Sauvegarder le monde avant chaque mise à jour",
      beforeUpdateHelper:
        "Avant de mettre à jour le jeu (page Installation, redémarrage planifié) ou les mods. Si la sauvegarde échoue, la mise à jour n'est pas lancée.",
    },
    list: {
      title: "Sauvegardes ({{count}})",
      create: "Créer une sauvegarde",
      creating: "Sauvegarde...",
      none: "Aucune sauvegarde",
      restoreTooltip: "Restaurer (serveur arrêté requis)",
      deleteTooltip: "Supprimer",
      restoreConfirm:
        "Restaurer {{name}} ?\nLa sauvegarde actuelle sera écrasée.",
      deleteConfirm: "Supprimer {{name}} ?",
      beforeUpdate: "Avant mise à jour",
    },
    notify: {
      cannotLoad: "Impossible de charger les sauvegardes",
      created: "Sauvegarde créée : {{name}}",
      createFailed: "Échec de la sauvegarde",
      restored: "Sauvegarde restaurée : {{name}}",
      restoreFailed: "Échec de la restauration",
      deleted: "Sauvegarde supprimée",
      deleteFailed: "Impossible de supprimer la sauvegarde",
      configFailed: "Impossible d'enregistrer la configuration de sauvegarde",
      beforeUpdate: "Monde sauvegardé avant la mise à jour : {{name}}",
    },
  },
  schedule: {
    title: "Planification",
    subtitle: "Redémarrage automatique quotidien du serveur",
    enabled: "Activer le redémarrage planifié",
    time: "Heure (24h)",
    warning: "Avertissement (minutes avant)",
    warningHelper: "Délai entre l'annonce et l'arrêt (0 = immédiat)",
    message: "Message d'annonce",
    messageHelper:
      "{minutes} sera remplacé par le délai. Vide : message par défaut, dans la langue de Nexum.",
    messageDefault: "Le serveur va redémarrer dans {minutes} minutes",
    updateGame: "Mettre à jour le jeu au moment du redémarrage",
    updateGameHelper:
      "Si une mise à jour du serveur est disponible : arrêt, sauvegarde du monde, mise à jour avec SteamCMD, puis démarrage. Sans effet pour un serveur installé via la bibliothèque Steam.",
    save: "Enregistrer",
    notify: {
      saved: "Planification enregistrée",
      saveFailed: "Impossible d'enregistrer la planification",
    },
  },
};
