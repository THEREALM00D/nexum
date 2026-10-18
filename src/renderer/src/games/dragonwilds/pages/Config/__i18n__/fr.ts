export default {
  dragonwildsConfig: {
    title: "Configuration",
    subtitle: "DedicatedServer.ini + arguments de lancement",
    notice:
      "Votre Player ID s'affiche en bas du menu Paramètres du jeu : sans lui, le serveur ne démarre pas. Le serveur charge le monde nommé dans « Nom du monde » ; pour choisir un autre monde ou reprendre un monde solo, passez par la page Sauvegardes.",
    groups: {
      server: "Serveur",
      access: "Propriétaire et administration",
      network: "Réseau",
      advanced: "Avancé",
    },
    policy: {
      Crossplay: "Crossplay (PC et consoles)",
      PC: "PC uniquement",
    },
    fields: {
      ServerName: {
        label: "Nom du serveur",
        description:
          "Affiché dans la colonne « Créé par » de la liste des mondes. Généré au hasard s'il est vide.",
      },
      DefaultWorldName: {
        label: "Nom du monde",
        description:
          "Monde chargé au démarrage (le nom du monde, pas celui de son fichier .sav), créé s'il n'existe pas. C'est aussi le nom que les joueurs cherchent dans la liste des mondes (sensible à la casse).",
      },
      WorldPassword: {
        label: "Mot de passe du monde",
        description:
          "Demandé aux joueurs pour rejoindre. Vide = monde ouvert à tous.",
      },
      OwnerId: {
        label: "Player ID du propriétaire",
        description:
          "Votre Player ID, en bas du menu Paramètres du jeu. Le propriétaire peut bannir et débannir tout le monde. Obligatoire : sans lui, le serveur ne démarre pas.",
      },
      AdminPassword: {
        label: "Mot de passe admin",
        description:
          "Saisi en jeu (Pause → Paramètres → Gestion du serveur) pour devenir admin : bannir les joueurs connectés. Le serveur le retire de son fichier après l'avoir lu ; Nexum le remet à chaque démarrage.",
      },
      Port: {
        label: "Port de jeu (UDP)",
        description:
          "7777 par défaut. Un 2e serveur sur ce PC doit utiliser un autre port (7778…).",
      },
      BeaconPort: {
        label: "Port beacon (UDP)",
        description:
          "8888 par défaut (port de jeu + 1111). À rediriger sur la box comme le port de jeu.",
      },
      PlatformPolicy: {
        label: "Plateformes acceptées",
        description:
          "Crossplay : joueurs PC et consoles. PC uniquement : seulement les joueurs PC.",
      },
      customArgs: {
        label: "Arguments supplémentaires",
        description:
          "Ajoutés à la ligne de commande du serveur, après -Port et -BeaconPort.",
      },
    },
  },
};
