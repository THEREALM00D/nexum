export default {
  configBackup: {
    settings: {
      title: "Réglages",
      interval: "Sauvegarde automatique",
      intervalHelper:
        "{{files}}. Une copie n'est faite que si un fichier a changé.",
      intervalHelperNoFiles:
        "Une copie n'est faite que si un fichier a changé.",
      keep: "Sauvegardes à conserver",
      keepHelper: "De {{min}} à {{max}}.",
      beforeSave: "Sauvegarder avant chaque enregistrement",
      beforeSaveHelper:
        "Quand Nexum écrit un fichier de configuration (page Configuration, reprise d'une ligne de lancement…).",
      beforeStart: "Sauvegarder avant chaque démarrage",
      beforeStartHelper:
        "Le jeu, une mise à jour ou un mod réécrit souvent la configuration au démarrage.",
    },
    list: {
      title: "Sauvegardes de la configuration ({{count}})",
      empty:
        "Aucune sauvegarde. Cliquez sur Créer une sauvegarde, ou attendez la prochaine copie automatique.",
      detail: "{{files}} · {{size}}",
      diff: "Voir les différences avec les fichiers actuels",
      restore: "Restaurer (serveur arrêté requis)",
      restoreConfirm:
        "Restaurer cette sauvegarde de la configuration ?\nLa configuration actuelle est d'abord sauvegardée.",
      deleteConfirm: "Supprimer cette sauvegarde de la configuration ?",
    },
    reasons: {
      beforeSave: "Avant enregistrement",
      beforeStart: "Avant démarrage",
      beforeRestore: "Avant restauration",
    },
    diff: {
      title: "Différences avec la configuration actuelle",
      subtitle: "Sauvegarde du {{date}}, comparée aux fichiers d'aujourd'hui.",
      file: "Fichier",
      fileChanges_zero: "{{file}} · aucun",
      fileChanges_one: "{{file}} · {{count}} changement",
      fileChanges_other: "{{file}} · {{count}} changements",
      fileTooLarge: "{{file}} · trop gros",
      hidden_one: "{{count}} fichier identique n'est pas affiché.",
      hidden_other: "{{count}} fichiers identiques ne sont pas affichés.",
      identical: "Aucun fichier n'a changé depuis cette sauvegarde.",
      tooLarge:
        "Fichier trop gros ou binaire : pas de comparaison ligne à ligne.",
      legend:
        "En rouge : ce que la sauvegarde contient. En vert : ce qu'il y a aujourd'hui. Les mots de passe sont masqués.",
      close: "Fermer",
      restore: "Restaurer cette sauvegarde",
    },
    notify: {
      cannotLoad: "Impossible de lire les sauvegardes de la configuration",
      created: "Configuration sauvegardée",
      unchanged: "Rien n'a changé depuis la dernière sauvegarde",
      restored: "Configuration restaurée",
    },
  },
};
