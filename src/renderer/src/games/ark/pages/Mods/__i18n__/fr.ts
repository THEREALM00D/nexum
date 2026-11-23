export default {
  arkMods: {
    title: "Mods",
    subtitle:
      "Mods CurseForge du serveur. Le serveur les télécharge et les met à jour lui-même à chaque démarrage.",
    add: {
      label: "ID du mod (Project ID)",
      help: "Le « Project ID » est affiché sur la page du mod sur CurseForge, dans « About Project ».",
      helpUnchecked:
        "Le « Project ID » est affiché sur la page du mod sur CurseForge, dans « About Project ». Vérifiez-le : un ID inconnu empêche le serveur de démarrer.",
      button: "Ajouter",
    },
    notices: {
      running:
        "Le serveur est lancé : les changements de cette page s'appliquent au prochain démarrage.",
      args: "Les arguments de lancement (page Configuration) contiennent encore des mods : {{ids}}.",
      argsButton: "Déplacer dans la liste",
    },
    list: {
      empty: "Aucun mod. Ajoutez un mod avec son ID.",
      hint: "Les mods se chargent dans l'ordre de la liste. Les joueurs les téléchargent en rejoignant le serveur. Retirer un mod retire aussi du monde ce qu'il ajoutait (créatures, structures, objets).",
      unknownName: "Mod {{id}}",
      id: "ID {{id}}",
      by: "par {{authors}}",
      fileWithDate: "{{file}}, publié le {{date}}",
      notDownloaded: "Téléchargé au prochain démarrage du serveur",
      premium: "Payant",
      toggle: "Activer le mod",
      enabled: "Activé",
      disabled: "Désactivé : pas chargé par le serveur",
      moveUp: "Monter",
      moveDown: "Descendre",
      open: "Ouvrir sur CurseForge",
      remove: "Retirer de la liste",
    },
    downloaded: {
      title: "Téléchargés par le serveur, pas dans la liste",
      hint: "Le serveur garde les fichiers d'un mod retiré de la liste, ou installé avant Nexum. Ils ne sont pas chargés.",
      add: "Ajouter",
    },
  },
};
