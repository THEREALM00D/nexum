export default {
  logs: {
    title: "Logs serveur",
    lines: "{{count}} lignes",
    clear: "Effacer",
    empty: "Aucun log — démarrez le serveur pour voir les logs.",
    copy: "Copier",
    copyTooltip:
      "Copie tout le log, avec la version de Nexum et le jeu en tête (pratique pour un rapport de bug). Les adresses IP publiques, identifiants Steam et codes de connexion sont masqués.",
    copied:
      "Log copié. Adresses IP, identifiants Steam et codes de connexion masqués ; les noms des joueurs sont conservés.",
    copyError: "Impossible de copier le log dans le presse-papiers.",
    save: "Enregistrer en .txt",
    saved:
      "Log enregistré. Adresses IP, identifiants Steam et codes de connexion masqués ; les noms des joueurs sont conservés.",
    saveError: "Impossible d'enregistrer le log : {{error}}",
    showInFolder: "Afficher dans le dossier",
    session: {
      live: "Session en cours (direct)",
      crashed: "plantée",
      size: "{{size}} Ko",
      openDir: "Ouvrir le dossier des logs",
      truncated:
        "Affichage des {{count}} dernières lignes de cette session. Copier et Enregistrer exportent le fichier complet.",
    },
  },
};
