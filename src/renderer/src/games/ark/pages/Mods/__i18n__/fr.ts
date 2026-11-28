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
      search: "Rechercher (nom, auteur ou ID)",
      count_one: "{{count}} mod",
      count_other: "{{count}} mods",
      countFiltered: "{{shown}} sur {{total}}",
      noMatch: "Aucun mod ne correspond à la recherche.",
      hint: "Les mods se chargent dans l'ordre de la liste. Les joueurs les téléchargent en rejoignant le serveur. Retirer un mod retire aussi du monde ce qu'il ajoutait (créatures, structures, objets).",
      hintShow: "Rappel : ordre de chargement et retrait d'un mod",
      hintHide: "Masquer le rappel",
      unknownName: "Mod {{id}}",
      id: "ID {{id}}",
      by: "par {{authors}}",
      fileWithDate: "{{file}}, publié le {{date}}",
      notDownloaded: "Téléchargé au prochain démarrage du serveur",
      premium: "Payant",
      countPassive_one: "{{count}} passif",
      countPassive_other: "{{count}} passifs",
      countDisabled_one: "{{count}} désactivé",
      countDisabled_other: "{{count}} désactivés",
      state: "État du mod",
      states: { active: "Actif", passive: "Passif", disabled: "Désactivé" },
      stateHelp: {
        active: "Chargé par le serveur (-mods).",
        passive:
          "Passif (-passivemods) : ses données sont chargées, ses fonctions non. Par exemple, garder dans un cluster les créatures d'un mod sans qu'elles apparaissent sur cette carte, tout en pouvant les transférer.",
        disabled: "Pas chargé par le serveur. Reste dans la liste.",
      },
      moveUp: "Monter",
      moveDown: "Descendre",
      open: "Ouvrir sur CurseForge",
      remove: "Retirer de la liste",
    },
    downloaded: {
      hint: "Le serveur garde les fichiers d'un mod retiré de la liste, ou installé avant Nexum. Ils ne sont pas chargés.",
      add: "Ajouter",
      titleWithSize_one:
        "Téléchargé par le serveur, pas dans la liste · {{count}} mod · {{size}}",
      titleWithSize_other:
        "Téléchargés par le serveur, pas dans la liste · {{count}} mods · {{size}}",
    },
    cleanup: {
      open: "Nettoyer le dossier des mods",
      title: "Nettoyer le dossier des mods ?",
      notListed_one: "{{count}} mod hors liste",
      notListed_other: "{{count}} mods hors liste",
      notListedHint_one:
        "{{names}}. S'il revient dans la liste, le serveur le retéléchargera au démarrage.",
      notListedHint_other:
        "{{names}}. Si l'un d'eux revient dans la liste, le serveur le retéléchargera au démarrage.",
      temp: "Restes de téléchargement",
      tempHint: "Dossier de travail .temp du serveur.",
      nothing:
        "Rien à supprimer : tous les mods téléchargés sont utilisés (liste, arguments de lancement, autres serveurs du même dossier).",
      safe: "Seulement les fichiers téléchargés. Le monde et ce que les mods y ont ajouté ne sont pas touchés. Le serveur supprime lui-même l'ancienne version d'un mod mis à jour.",
      stopFirst: "Arrêtez le serveur pour nettoyer : il utilise ces fichiers.",
      cancel: "Annuler",
      confirm: "Libérer {{size}}",
      done: "{{size}} libérés",
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
        "Pas compatible cross-plateforme : le serveur ne démarre pas avec ce mod, sauf avec Plateformes acceptées sur PC (Configuration, onglet Réglages de jeu ; les joueurs sur console ne peuvent alors plus le rejoindre).",
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
