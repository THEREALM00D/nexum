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
          "Nexum s'ouvre réduit dans la barre des tâches, puis démarre les serveurs marqués « Démarrer automatiquement ».",
        unsupported:
          "Disponible uniquement dans l'application installée (pas en mode développement).",
        on: "Nexum se lancera au démarrage de Windows",
        off: "Nexum ne se lancera plus au démarrage de Windows",
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
