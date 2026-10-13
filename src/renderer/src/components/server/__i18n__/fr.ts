export default {
  join: {
    title: "Rejoindre le serveur",
    local: "Même réseau",
    internet: "Depuis Internet",
    code: "Code de connexion crossplay",
    showPublicIp: "Afficher mon IP publique",
    publicIpTooltip:
      "Demande votre adresse IP publique au service ipify.org (seulement quand vous cliquez)",
    publicIpError:
      "Impossible d'obtenir votre IP publique. Vérifiez votre connexion Internet.",
    copy: "Copier",
    copied: "Copié",
    thisPc: "ce PC",
    hint: "Pour les amis hors de votre réseau : redirigez le(s) port(s) UDP {{range}} sur votre box vers {{ip}}, et appliquez les règles du pare-feu (page Réseau). La plupart des box ne permettent pas de rejoindre sa propre IP publique depuis chez soi : faites tester un ami.",
  },
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
    newLines: "Nouvelles lignes — revenir au direct",
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
