export default {
  servers: {
    title: "Serveurs",
    subtitle:
      "Liste de tous vos serveurs dédiés. Cliquez sur un serveur pour le sélectionner comme actif.",
    emptyTitle: "Aucun serveur pour l'instant",
    emptyHint:
      "L'assistant installe le jeu, règle la configuration et ouvre les ports en quelques étapes.",
    launchWizard: "Lancer l'assistant",
    importFolder: "Importer un dossier existant",
    active: "Actif",
    addServer: "Ajouter un serveur",
    setupWizard: "Assistant de démarrage",
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
      dragonwilds: "RuneScape: Dragonwilds",
      enshrouded: "Enshrouded",
    },
    actions: {
      activate: "Activer",
      more: "Plus d'actions",
      openFolder: "Ouvrir le dossier",
      edit: "Modifier",
      delete: "Supprimer",
      deleteConfirm:
        "Supprimer le serveur « {{name}} » ? Les fichiers du jeu restent intacts, seules les configurations Nexum sont effacées.",
      deleteTypeToConfirm: "Tapez « {{name}} » pour confirmer",
    },
    transfer: {
      exportMenu: "Exporter pour un autre PC",
      exportStopFirst: "Arrêtez le serveur pour l'exporter",
      importButton: "Importer un serveur",
      exportTitle: "Exporter « {{name}} »",
      exportDescription:
        "Un fichier ZIP avec les réglages Nexum du serveur, son monde, les fichiers de configuration du jeu et la liste de ses mods (réinstallés sur l'autre PC). Le jeu n'y est pas : installez-le sur l'autre PC depuis la page Installation.",
      gameFilesWarning:
        "Les fichiers de configuration du jeu sont copiés tels quels, avec les mots de passe qu'ils contiennent (mot de passe admin Palworld, mots de passe des groupes Enshrouded…).",
      importTitle: "Importer un serveur",
      name: "Nom",
      contents: "Contenu du fichier ({{game}})",
      world: "Monde du serveur",
      noWorld: "Aucun monde",
      configFiles: "{{count}} fichier de configuration du jeu",
      configFiles_other: "{{count}} fichiers de configuration du jeu",
      mods: "{{count}} mod à réinstaller",
      mods_other: "{{count}} mods à réinstaller",
      replaceWorld: "Remplacer le monde déjà présent",
      replaceWorldHelper:
        "Des fichiers du même nom existent déjà dans le dossier des mondes. Décoché, le monde importé n'est pas copié.",
      done: "Serveur « {{name}} » importé.",
      worldSkipped:
        "Le monde n'a pas été copié : il en existait déjà un du même nom.",
      modsPending:
        "Installez le jeu, puis réinstallez les mods depuis la page Mods.",
    },
    dialog: {
      autoStart: "Démarrer automatiquement à l'ouverture de Nexum",
      autoStartHelper:
        "Avec « Lancer Nexum au démarrage de Windows » (page Paramètres), le serveur repart tout seul après un redémarrage du PC.",
      autoRestart: "Relancer automatiquement après un plantage",
      autoRestartHelper:
        "10 secondes après le plantage. Au plus 3 fois en 30 minutes, pour ne pas boucler sur un serveur qui plante dès le démarrage.",
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
