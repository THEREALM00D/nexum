export default {
  settings: {
    title: "Paramètres",
    subtitle:
      "Réglages de l'application. Les réglages d'un serveur se trouvent dans sa fenêtre, page Serveurs.",
    startup: {
      title: "Démarrage",
      description:
        "Pour que vos serveurs repartent tout seuls après un redémarrage du PC, activez ce réglage et cochez « Démarrer automatiquement » dans la fenêtre de chaque serveur (page Serveurs).",
      launchAtLogin: {
        label: "Lancer Nexum au démarrage de Windows",
        helper:
          "Nexum démarre en arrière-plan (icône près de l'horloge, ou réduit dans la barre des tâches), puis démarre les serveurs marqués « Démarrer automatiquement ».",
        unsupported:
          "Disponible uniquement dans l'application installée (pas en mode développement).",
        on: "Nexum se lancera au démarrage de Windows",
        off: "Nexum ne se lancera plus au démarrage de Windows",
      },
      closeToTray: {
        label: "Garder Nexum dans la zone de notification à la fermeture",
        helper:
          "Fermer la fenêtre garde Nexum près de l'horloge, pour que les sauvegardes et redémarrages planifiés continuent. Clic droit sur l'icône pour piloter vos serveurs ou quitter.",
        on: "Fermer la fenêtre gardera Nexum dans la zone de notification",
        off: "Fermer la fenêtre quittera Nexum",
      },
    },
    language: { title: "Langue" },
    updates: {
      title: "Mises à jour",
      beta: {
        label: "Recevoir les versions bêta",
        helper:
          "Pour tester les nouveautés avant tout le monde. Une bêta peut contenir des bugs : faites une sauvegarde de vos mondes et signalez les problèmes sur Discord. En désactivant, vous restez sur la bêta installée jusqu'à la prochaine version stable.",
        on: "Les versions bêta vous seront proposées",
        off: "Seules les versions stables vous seront proposées",
      },
    },
    transfer: {
      title: "Changer de PC",
      description:
        "Emportez vos serveurs et leurs réglages Nexum sur un autre PC. Pour emporter aussi le monde et la configuration du jeu d'un serveur : page Serveurs, menu « ⋯ » du serveur.",
      exportButton: "Exporter les réglages",
      importButton: "Importer des réglages",
      exportDescription:
        "Un fichier avec vos serveurs et leurs réglages Nexum (lancement, sauvegardes, redémarrage planifié, démarrage et relance automatiques), les réglages de l'app et vos règles de pare-feu perso. Sans les fichiers du jeu, les mondes ni les sauvegardes.",
      servers: "Serveurs",
      serversHelper:
        "Chaque serveur est ajouté à la liste, jamais à la place d'un serveur existant. Vérifiez ses dossiers sur ce PC.",
      noServers: "Aucun serveur dans ce fichier.",
      appSettings: "Réglages de l'app",
      appSettingsHelper:
        "Langue, zone de notification, versions bêta, lancement au démarrage de Windows.",
      firewall: "Règles de pare-feu perso ({{count}})",
      firewallHelper: "Ajoutées à la liste de la page Réseau.",
      applyFirewall: "Les créer aussi dans le pare-feu de Windows",
      applyFirewallHelper:
        "Windows demandera une autorisation, une seule fois.",
      done: "Import terminé : {{count}} serveur ajouté.",
      done_other: "Import terminé : {{count}} serveurs ajoutés.",
      firewallFailed:
        "Les règles de pare-feu n'ont pas été créées dans Windows ({{error}}). Créez-les depuis la page Réseau.",
    },
    help: {
      title: "Aide et à propos",
      docs: "Documentation",
      bug: "Signaler un bug",
      privacy: "Confidentialité",
      license:
        "Nexum est un logiciel libre et gratuit, sous licence GPL-3.0. Aucune télémétrie, aucun compte.",
    },
  },
};
