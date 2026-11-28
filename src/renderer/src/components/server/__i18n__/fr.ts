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
  serverWatchdog: {
    stuckStart_one:
      "Le serveur n'avait pas fini de démarrer après {{count}} minute : Nexum l'a tué et relancé à {{time}} (essai {{attempt}} sur {{max}}).",
    stuckStart_other:
      "Le serveur n'avait pas fini de démarrer après {{count}} minutes : Nexum l'a tué et relancé à {{time}} (essai {{attempt}} sur {{max}}).",
    stuckGaveUp_one:
      "Le serveur ne finit pas de démarrer ({{count}} minute), déjà relancé {{max}} fois en 30 minutes : Nexum l'a arrêté à {{time}} et ne le relance plus. Regardez ses logs.",
    stuckGaveUp_other:
      "Le serveur ne finit pas de démarrer ({{count}} minutes), déjà relancé {{max}} fois en 30 minutes : Nexum l'a arrêté à {{time}} et ne le relance plus. Regardez ses logs.",
    ramLimit:
      "La RAM du serveur est restée au-dessus de {{limit}} Go pendant 5 minutes ({{ram}} Go) : Nexum l'a redémarré à {{time}}, joueurs prévenus.",
    ramLimitNoWarning:
      "La RAM du serveur est restée au-dessus de {{limit}} Go pendant 5 minutes ({{ram}} Go) : Nexum l'a redémarré à {{time}} (le jeu ne permet pas de prévenir les joueurs).",
    viewLogs: "Voir les logs",
    dismiss: "Masquer",
  },
  serverMenu: {
    more: "Plus d'actions",
    saveNow: "Sauvegarder le monde maintenant",
    sendMessage: "Envoyer un message aux joueurs",
    kill: "Tuer le processus",
    killHelper: "Sans sauvegarder, si Arrêter ne répond plus",
    unavailable: {
      rconDisabled: "Activez RCON (page Configuration)",
      restApiDisabled: "Activez l'API REST (page Configuration)",
      noCommand: "Pas de commande pour ce jeu",
    },
    messageTitle: "Envoyer un message aux joueurs",
    messageLabel: "Message",
    messageHelper: "Affiché dans le chat du jeu.",
    messageAscii:
      "Le jeu affiche mal les accents : Nexum les retire à l'envoi.",
    messagePreview: "Envoyé :",
    playersOnline_one: "{{count}} joueur connecté.",
    playersOnline_other: "{{count}} joueurs connectés.",
    send: "Envoyer",
    cancel: "Annuler",
    killTitle: "Tuer « {{name}} » ?",
    killWarning:
      "Le serveur s'arrête tout de suite, sans prévenir les joueurs ni sauvegarder. Ce qui s'est passé depuis la dernière sauvegarde du jeu est perdu (jusqu'à 15 min pour ARK). À utiliser seulement si « Arrêter » ne répond plus.",
    notify: {
      saved: "Monde de « {{name}} » sauvegardé",
      saveFailed: "Impossible de sauvegarder le monde",
      messageSent: "Message envoyé aux joueurs",
      messageFailed: "Impossible d'envoyer le message",
      killed: "« {{name}} » a été tué",
    },
  },
  serverDashboard: {
    since: "depuis {{duration}}",
    viewLogs: "Voir les logs",
    players: "Joueurs connectés",
    ramServer: "RAM du serveur",
    ramOf: "sur {{total}} Go installés",
    ramUsedOf: "{{used}} / {{total}} Go",
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
      openDir: "Ouvrir le dossier des logs",
    },
  },
};
