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
    updates: { title: "Mises à jour" },
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
