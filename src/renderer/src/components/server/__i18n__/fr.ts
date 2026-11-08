export default {
  join: {
    title: "Rejoindre le serveur",
    local: "Même réseau",
    internet: "Depuis Internet",
    code: "Code de connexion crossplay",
    searchName: "Nom à chercher dans le jeu",
    showPublicIp: "Afficher mon IP publique",
    publicIpTooltip:
      "Demande votre adresse IP publique au service ipify.org (seulement quand vous cliquez)",
    publicIpError:
      "Impossible d'obtenir votre IP publique. Vérifiez votre connexion Internet.",
    copy: "Copier",
    copied: "Copié",
    thisPc: "ce PC",
    notRunning:
      "Démarrez le serveur : les adresses à partager apparaîtront ici.",
    hint: "Pour les amis hors de votre réseau : redirigez le(s) port(s) UDP {{range}} sur votre box vers {{ip}}, et appliquez les règles du pare-feu (page Réseau). La plupart des box ne permettent pas de rejoindre sa propre IP publique depuis chez soi : faites tester un ami.",
  },
  serverDashboard: {
    since: "depuis {{duration}}",
    viewLogs: "Voir les logs",
    players: "Joueurs connectés",
    ramServer: "RAM du serveur",
    ramOf: "sur {{total}} GB installés",
    onlineFor: "En ligne depuis",
    nextRestart: "Prochain redémarrage planifié : {{time}}",
    thisPc: "Ce PC",
    cpu: "CPU",
    ram: "RAM",
    poweredOnFor: "Allumé depuis",
  },
  logs: {
    title: "Logs serveur",
    latest: "Derniers logs",
    viewAll: "Tout voir",
    lines: "{{count}} lignes",
    clear: "Effacer",
    empty: "Aucun log — démarrez le serveur pour voir les logs.",
    copy: "Copier",
    copyTooltip:
      "Copie tout le log, avec la version de Nexum et le jeu en tête (pratique pour un rapport de bug). Les adresses IP publiques, identifiants des joueurs (Steam, EOS), mots de passe et codes de connexion sont masqués.",
    copied:
      "Log copié. Adresses IP, identifiants des joueurs, mots de passe et codes de connexion masqués ; les noms des joueurs sont conservés.",
    copyError: "Impossible de copier le log dans le presse-papiers.",
    save: "Enregistrer en .txt",
    saved:
      "Log enregistré. Adresses IP, identifiants des joueurs, mots de passe et codes de connexion masqués ; les noms des joueurs sont conservés.",
    saveError: "Impossible d'enregistrer le log : {{error}}",
    showInFolder: "Afficher dans le dossier",
    newLines: "Nouvelles lignes — revenir au direct",
    session: {
      live: "Session en cours (direct)",
      crashed: "plantée",
      size: "{{size}} Ko",
      openDir: "Ouvrir le dossier des logs",
    },
  },
};
