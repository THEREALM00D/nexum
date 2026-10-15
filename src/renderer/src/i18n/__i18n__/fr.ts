export default {
  common: {
    save: "Sauvegarder",
    cancel: "Annuler",
    delete: "Supprimer",
    confirm: "Confirmer",
    browse: "Parcourir",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    language: "Langue",
    errorPrefix: "Erreur : {{msg}}",
    change: "Modifier",
    or: "OU",
    clearSearch: "Effacer la recherche",
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
      dirTooltip: "Choisir un dossier",
      dirOpen: "Ouvrir dans l'explorateur",
      keep: "Sauvegardes à conserver (rotation)",
      keepHelper: "0 = pas de rotation",
      auto: "Sauvegarde automatique",
      autoOff: "Désactivée",
      auto15: "Toutes les 15 minutes",
      auto30: "Toutes les 30 minutes",
      auto60: "Toutes les heures",
      auto180: "Toutes les 3 heures",
      auto360: "Toutes les 6 heures",
      auto720: "Toutes les 12 heures",
      auto1440: "Une fois par jour",
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
    messageHelper: "{minutes} sera remplacé par le délai",
    save: "Enregistrer",
    notify: {
      saved: "Planification enregistrée",
      saveFailed: "Impossible d'enregistrer la planification",
    },
  },
};
