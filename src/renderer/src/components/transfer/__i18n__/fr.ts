// Textes partagés de « Changer de PC » (export / import des réglages et
// d'un serveur), utilisés par les pages Paramètres et Serveurs.
export default {
  transfer: {
    export: "Exporter",
    import: "Importer",
    exportedAt: "Exporté le {{date}}",
    passwords: {
      label: "Inclure les mots de passe",
      helper:
        "Mot de passe du serveur Valheim et mot de passe admin Dragonwilds. Décoché, il faudra les ressaisir sur le nouveau PC.",
      warning:
        "Le fichier contiendra les mots de passe en clair : ne le partagez pas et supprimez-le après l'import.",
      missing:
        "Ce fichier ne contient pas les mots de passe : ressaisissez-les dans la page Config des serveurs concernés.",
    },
    paths: {
      server: "Dossier du serveur",
      backupDir: "Dossier des sauvegardes",
      backupDirHelper: "Vide = dossier par défaut de Nexum",
      savedir: "Dossier des données du jeu (-savedir)",
      savedirHelper: "Vide = dossier par défaut du jeu",
      logFile: "Fichier de log (-logFile)",
      notInstalledHelper:
        "Le serveur sera importé quand même : installez le jeu depuis la page Installation.",
      duplicate: "Déjà présent",
      duplicateHelper:
        "Un serveur de Nexum utilise déjà ce dossier : l'importer en créerait un second.",
    },
    saved: "Fichier enregistré : {{name}}",
    showInFolder: "Afficher",
  },
};
