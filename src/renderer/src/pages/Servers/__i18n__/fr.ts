export default {
  servers: {
    title: "Serveurs",
    subtitle:
      "Liste de tous vos serveurs dédiés. Cliquez sur un serveur pour le sélectionner comme actif.",
    empty:
      "Aucun serveur configuré. Ajoutez votre premier serveur pour commencer.",
    active: "Actif",
    addServer: "Ajouter un serveur",
    columns: {
      name: "Nom",
      game: "Jeu",
      path: "Chemin",
      status: "Statut",
      actions: "",
    },
    status: {
      running: "En ligne",
      starting: "Démarrage...",
      stopping: "Arrêt...",
      crashed: "Planté",
      stopped: "Arrêté",
    },
    serverActions: {
      start: "Démarrer",
      stop: "Arrêter",
      restart: "Redémarrer",
    },
    games: {
      palworld: "Palworld",
      valheim: "Valheim",
      astroneer: "Astroneer",
    },
    actions: {
      activate: "Activer",
      edit: "Modifier",
      delete: "Supprimer",
      deleteConfirm:
        "Supprimer le serveur « {{name}} » ? Les fichiers du jeu restent intacts, seules les configurations Nexum sont effacées.",
      deleteTypeToConfirm: "Tapez « {{name}} » pour confirmer",
    },
    dialog: {
      autoStart: "Démarrer automatiquement à l'ouverture de Nexum",
      autoStartHelper:
        "Avec « Lancer Nexum au démarrage de Windows » (page Paramètres), le serveur repart tout seul après un redémarrage du PC.",
      addTitle: "Nouveau serveur",
      editTitle: "Modifier le serveur",
      name: "Nom",
      nameHelper: "Ex. : FREEPORT, PvE Casual, Test",
      path: "Dossier du serveur",
      pathHelper:
        "Dossier contenant l'exécutable du serveur — nouvelle installation ou existante, ex : E:\\Server\\Palworld_Freeport",
      pathBrowse: "Parcourir",
      gameType: "Jeu",
      color: "Couleur",
      save: "Enregistrer",
      cancel: "Annuler",
      exeFound: "Serveur {{game}} détecté dans ce dossier",
      exeMissing:
        "Aucun exécutable de serveur connu trouvé dans ce dossier — vérifiez le chemin ou le jeu sélectionné",
      exeChecking: "Vérification…",
    },
    notify: {
      created: "Serveur « {{name}} » ajouté.",
      updated: "Serveur « {{name}} » modifié.",
      deleted: "Serveur supprimé.",
      activated: "« {{name}} » est maintenant le serveur actif.",
      pathRequired: "Le chemin du serveur est obligatoire.",
      nameRequired: "Le nom du serveur est obligatoire.",
      startFailed: "Démarrage échoué : {{error}}",
      stopFailed: "Arrêt échoué : {{error}}",
      restartFailed: "Redémarrage échoué : {{error}}",
    },
  },
};
