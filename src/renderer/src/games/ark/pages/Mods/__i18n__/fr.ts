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
    tabs: {
      list: "Liste du serveur",
      browse: "Parcourir CurseForge",
    },
    browse: {
      search: "Rechercher un mod…",
      sort: "Trier par",
      sorts: {
        popular: "Popularité",
        updated: "Mis à jour récemment",
        downloads: "Téléchargements",
        name: "Nom",
      },
      category: "Catégorie",
      allCategories: "Toutes les catégories",
      downloads: "{{formatted}} téléchargement",
      downloads_other: "{{formatted}} téléchargements",
      updatedOn: "mis à jour le {{date}}",
      add: "Ajouter",
      added: "Ajouté",
      cosmetic: "Cosmétique",
      cosmeticHint:
        "Mod cosmétique pour les joueurs : il ne s'installe pas sur un serveur et l'empêcherait de démarrer.",
      pcOnly: "PC seulement",
      pcOnlyHint:
        "Pas compatible cross-plateforme : le serveur ne démarre pas avec ce mod, sauf avec -ServerPlatform=PC dans les arguments de lancement (les joueurs sur console ne peuvent alors plus le rejoindre).",
      retry: "Réessayer",
    },
    categories: {
      6073: "Conversion totale",
      6074: "Créatures",
      6075: "Modes de jeu",
      6076: "Général",
      6077: "Cartes",
      6078: "Tenues",
      6079: "Rééquilibrage",
      6080: "Structures",
      6081: "Visuels et sons",
      6082: "Armes",
      6844: "Cosmétiques",
      7108: "Gagnants de l'ARKathon",
    },
  },
};
