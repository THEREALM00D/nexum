export default {
  install: {
    title: "Installation",
    subtitle: "Installer ou mettre à jour le serveur {{game}} via SteamCMD",
    steamcmd: {
      label: "SteamCMD",
      installed: "Installé",
      notInstalled: "Non installé",
      checking: "Vérification...",
      statusOk: "OK",
      statusMissing: "Manquant",
      install: "Installer SteamCMD",
    },
    folder: {
      title: "Dossier d'installation",
      installGame: "Installer {{game}}",
      installing: "Installation...",
      update: "Mettre à jour",
    },
    update: {
      title: "Mise à jour disponible ?",
      installedBuild: "Build installé : {{build}}",
      check: "Vérifier",
      checking: "Connexion à Steam...",
      upToDate: "Le serveur est à jour.",
      cannotRead:
        "Impossible de lire le build installé — le serveur est-il bien installé dans ce dossier ?",
      available: "Mise à jour disponible",
      availableWithBuild: "Mise à jour disponible (build {{build}}).",
    },
    launchArgs: {
      title: "Arguments de lancement",
      publicLobby: "Lobby public (crossplay Xbox / PS)",
      publicLobbyTooltip:
        "Ajoute -publiclobby. Le serveur apparaît dans l'onglet Communauté de Palworld sur toutes les plateformes et est joignable par les joueurs Xbox. Un Lobby ID s'affiche dans les logs au démarrage.",
      performanceFlags: "Flags de performance multi-thread",
      performanceFlagsTooltip:
        "Ajoute -useperfthreads -NoAsyncLoadingThread -UseMultithreadForDS. Recommandé sur un CPU multi-cœurs pour une meilleure stabilité.",
      customArgs: "Arguments personnalisés",
      customArgsTooltip:
        "Arguments supplémentaires ajoutés à la ligne de commande de PalServer.exe (séparés par des espaces). Avancé.",
      saved:
        "Arguments de lancement enregistrés. Redémarrez le serveur pour appliquer.",
    },
    progress: "Progression",
  },
};
