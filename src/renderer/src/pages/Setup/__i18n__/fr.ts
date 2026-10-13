export default {
  setup: {
    title: "Créer un serveur",
    subtitle:
      "Quelques étapes pour faire tourner votre serveur de jeu. Tout reste modifiable ensuite depuis le menu de gauche.",
    steps: {
      game: "Jeu",
      install: "Installation",
      config: "Configuration",
      network: "Pare-feu",
      start: "Démarrage",
    },
    help: {
      game: "Choisissez le jeu, puis si Nexum doit installer un nouveau serveur ou utiliser celui que vous avez déjà.",
      install:
        "Installez SteamCMD (l'outil de Steam pour les serveurs dédiés), puis le serveur du jeu. Le téléchargement peut prendre quelques minutes.",
      config:
        "Réglez le nom du serveur, le mot de passe et les paramètres du monde. N'oubliez pas d'enregistrer.",
      network:
        "Appliquez les règles du pare-feu Windows pour que les joueurs puissent atteindre le serveur (Windows demande une confirmation).",
      start:
        "Démarrez le serveur, puis partagez l'adresse ci-dessous avec vos amis.",
    },
    game: {
      which: "Quel jeu ?",
      mode: "Serveur",
      new: "Installer un nouveau serveur",
      existing: "J'ai déjà un serveur",
      name: "Nom du serveur dans Nexum",
      nameHelper:
        "Affiché seulement dans Nexum. Laissez vide pour reprendre le nom du dossier.",
      pathNew: "Dossier d'installation",
      pathNewHelper:
        "Le serveur sera installé ici (plusieurs Go). Choisissez un disque avec assez d'espace.",
      pathExisting: "Dossier du serveur",
      pathExistingHelper:
        "Le dossier qui contient l'exécutable du serveur. Nexum détecte le jeu.",
      browse: "Parcourir",
    },
    create: "Créer le serveur",
    next: "Suivant",
    back: "Retour",
    skip: "Passer",
    finish: "Terminer",
  },
};
