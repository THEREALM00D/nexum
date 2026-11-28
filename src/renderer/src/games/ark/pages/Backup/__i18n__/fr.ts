export default {
  arkBackup: {
    subtitle:
      "Gérez les sauvegardes du monde ARK (carte choisie, sans les copies .arkrbf et .bak que le jeu garde à côté)",
    openWorldFolder: "Ouvrir le dossier du monde",
    autoNote:
      "Serveur lancé avec RCON activé : Nexum demande au serveur de sauvegarder (SaveWorld) juste avant. Sans RCON, la sauvegarde contient la dernière sauvegarde automatique du jeu (toutes les 15 min par défaut).",
    profiles: {
      tab: "Profils des joueurs",
      settings: {
        title: "Réglages",
        interval: "Sauvegarde des profils",
        intervalHelper:
          "Profils (.arkprofile) et tribus (.arktribe), séparés du monde. Aussi à chaque déconnexion d'un joueur (RCON activé). Un profil qui n'a pas changé n'est pas recopié.",
        keep: "Sauvegardes à garder par joueur",
        keepHelper: "De {{min}} à {{max}}.",
        announce: "Annoncer chaque sauvegarde en jeu",
        announceHelper: "Un court message dans le chat (RCON).",
      },
      title: "Profils sauvegardés ({{count}})",
      search: "Filtrer par joueur ou ID",
      backupNow: "Sauvegarder maintenant",
      summary_one: "{{count}} sauvegarde · {{when}}",
      summary_other: "{{count}} sauvegardes · {{when}}",
      emptyEnabled:
        "Aucun profil sauvegardé. La première sauvegarde a lieu à l'intervalle choisi, ou quand un joueur se déconnecte.",
      emptyDisabled:
        "Aucun profil sauvegardé. Choisissez un intervalle de sauvegarde, ou cliquez sur Sauvegarder maintenant.",
      noMatch: "Aucun joueur ne correspond.",
      restoreTooltip: "Restaurer ce profil (serveur arrêté requis)",
      stopToRestore: "Arrêtez le serveur pour restaurer un profil.",
      restore: {
        title: "Restaurer le profil de {{name}} ?",
        body: "Version du {{date}}. Le niveau, l'expérience et les engrammes reviennent à cette version. Le personnage dans le monde, son inventaire, sa tribu et les autres joueurs ne changent pas.",
        backupFirst:
          "Le profil actuel est d'abord sauvegardé, pour pouvoir revenir en arrière.",
        cancel: "Annuler",
        confirm: "Restaurer",
      },
      notify: {
        cannotLoad: "Impossible de lire les profils sauvegardés",
        saved_one: "{{count}} profil sauvegardé",
        saved_other: "{{count}} profils sauvegardés",
        unchanged: "Aucun profil n'a changé depuis la dernière sauvegarde",
        restored: "Profil de {{name}} restauré",
      },
    },
  },
};
