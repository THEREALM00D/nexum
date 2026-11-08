export default {
  valheimDashboard: {
    noServerPath: "Aucun chemin configuré",
    noApi:
      "Suivi des joueurs désactivé : Valheim n'a pas d'API, la page Logs affiche les connexions. Pour le nombre de joueurs en ligne et l'historique, installez le plugin Odin-Eye et renseignez son adresse dans Configuration → Réseau.",
    odinEye: {
      idle: "Suivi des joueurs par Odin-Eye ({{url}}) : il démarrera avec le serveur.",
      waiting:
        "En attente d'Odin-Eye ({{url}}) : le plugin démarre une fois le monde chargé.",
      connected: "Odin-Eye connecté ({{url}}) : suivi des joueurs actif.",
      error:
        "Odin-Eye ne répond pas — {{reason}} Le nombre de joueurs et l'historique ne sont pas suivis. Vous pouvez tester l'adresse dans Configuration → Réseau.",
    },
    players: {
      unknown:
        "Inconnu — configurez le plugin Odin-Eye (Configuration → Réseau) pour suivre les joueurs",
    },
  },
};
