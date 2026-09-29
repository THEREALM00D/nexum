export default {
  valheimConfig: {
    title: "Configuration du serveur",
    subtitle: "Arguments de lancement de valheim_server.exe",
    openServerFolder: "Ouvrir le dossier du serveur",
    save: "Sauvegarder",
    saved: "Sauvegardé !",
    noServerPath: "Configurez le chemin du serveur dans l'onglet Installation.",
    sections: {
      general: "Général",
      world: "Monde",
      modifiers: "Modificateurs de monde",
      network: "Réseau",
      advanced: "Avancé",
      administration: "Administration",
    },
    modifiers: {
      description:
        "Ajuste la difficulté du monde. Un preset écrase tous les modificateurs déjà appliqués sur ce monde ; les réglages individuels ci-dessous s'appliquent ensuite par-dessus pour un ajustement fin.",
      default: "Ne pas modifier",
      presetHint:
        "Un monde existant garde ses modificateurs précédents tant qu'aucun preset n'est choisi — un champ individuel laissé vide ne les réinitialise pas.",
      presetNames: {
        Normal: "Normal",
        Casual: "Débutant",
        Easy: "Facile",
        Hard: "Difficile",
        Hardcore: "Hardcore",
        Immersive: "Immersif",
        Hammer: "Marteau",
      },
      combat: {
        label: "Combat",
        veryeasy: "Très facile",
        easy: "Facile",
        hard: "Difficile",
        veryhard: "Très difficile",
      },
      deathpenalty: {
        label: "Pénalité de mort (perte de compétences)",
        description:
          "Contrôle uniquement la perte de niveau de compétences à la mort — les objets non équipés tombent toujours au sol (mécanique du jeu, aucun modificateur ne l'empêche). Seuls l'armure, les accessoires et l'arme en main au moment de la mort sont conservés.",
        casual: "Aucune perte de compétences",
        veryeasy: "Très légère",
        easy: "Légère",
        hard: "Sévère",
        hardcore: "Perte totale (objets + compétences)",
      },
      resources: {
        label: "Ressources",
        muchless: "Très peu",
        less: "Peu",
        more: "Beaucoup",
        muchmore: "Bien plus",
        most: "Énormément",
      },
      raids: {
        label: "Raids",
        none: "Aucun",
        muchless: "Très rares",
        less: "Rares",
        more: "Fréquents",
        muchmore: "Très fréquents",
      },
      portals: {
        label: "Portails",
        casual: "Libre",
        hard: "Restreint",
        veryhard: "Très restreint",
      },
    },
    fields: {
      name: {
        label: "Nom du serveur",
        description: "Nom affiché dans la liste des serveurs Steam.",
      },
      world: {
        label: "Nom du monde",
        description: "Nom du fichier de monde (sans extension).",
        detected:
          "{{count}} monde(s) détecté(s) sur disque — cliquez pour choisir.",
      },
      password: {
        label: "Mot de passe",
        description:
          "Laissez vide pour un serveur sans mot de passe (min. 5 caractères si défini).",
        tooShort:
          "Trop court : Valheim exige au moins 5 caractères, sinon le serveur refuse de démarrer.",
      },
      port: {
        label: "Port",
        description:
          "Port de jeu UDP. Le port query est automatiquement port+1.",
      },
      public: {
        label: "Serveur public (Steam)",
        description:
          "Rend le serveur visible dans la liste communautaire Steam.",
      },
      savedir: {
        label: "Dossier de sauvegardes",
        description:
          "Chemin personnalisé pour les mondes. Vide = %LOCALAPPDATA%\\..\\LocalLow\\IronGate\\Valheim.",
      },
      worldSeed: {
        label: "Seed du monde",
        description: "Graine de génération du monde. Vide = aléatoire.",
      },
      worldSize: {
        label: "Taille du monde",
        default: "Défaut",
        small: "Petite",
        medium: "Moyenne",
        large: "Grande",
        yolo: "Yolo (très grande)",
      },
      crossplay: {
        label: "Crossplay (Xbox)",
        description: "Active le crossplay entre PC et Xbox via le réseau Xbox.",
      },
      logFile: {
        label: "Fichier de log",
        description:
          "Chemin vers un fichier de log personnalisé. Vide = comportement par défaut.",
      },
      customArgs: {
        label: "Arguments supplémentaires",
        description: "Arguments additionnels ajoutés à la ligne de commande.",
      },
      odinEyeUrl: {
        label: "URL Odin-Eye (suivi des joueurs)",
        description:
          "Nécessite le plugin BepInEx Odin-Eye installé sur le serveur (voir sparcopt.github.io/odin-eye). Renseignez l'adresse configurée dans HttpServerAddress, ex: http://127.0.0.1:21618. Vide = suivi des joueurs désactivé. Ne jamais exposer ce port publiquement (pas d'authentification côté plugin).",
      },
    },
    administration: {
      description:
        "Fichiers de contrôle d'accès (un SteamID64 par ligne). Situés dans le dossier de sauvegardes.",
      adminList: "Administrateurs (adminlist.txt)",
      adminListHelper:
        "Accès aux commandes admin en jeu (/kick, /ban, /debugmode…)",
      bannedList: "Bannis (bannedlist.txt)",
      bannedListHelper: "Joueurs bloqués à la connexion.",
      permittedList: "Liste blanche (permittedlist.txt)",
      permittedListHelper:
        "Si non vide, seuls ces joueurs peuvent se connecter.",
      save: "Sauvegarder",
      saved: "Sauvegardé !",
      saveFailed: "Impossible de sauvegarder la liste",
      loadFailed: "Impossible de charger la liste",
    },
  },
};
