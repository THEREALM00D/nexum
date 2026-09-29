export default {
  valheimMods: {
    title: "Mods",
    subtitle:
      "Gérez les mods de votre serveur Valheim via Thunderstore et Hexium",
    tabs: {
      installed: "Installés",
      browse: "Parcourir",
      configs: "Configs",
    },
    bepinex: {
      warning:
        "BepInEx non détecté dans le dossier serveur. La plupart des mods Valheim nécessitent BepInEx pour fonctionner.",
      ok: "BepInEx détecté",
      install: "Installer BepInEx",
      installing: "Installation…",
      success: "BepInEx installé avec succès",
    },
    installed: {
      empty:
        "Aucun mod installé. Parcourez Thunderstore/Hexium ou importez un profil r2modman.",
      remove: "Désinstaller",
      removeConfirm: "Désinstaller {{name}} ?",
      enabled: "Activé",
      disabled: "Désactivé",
      manual: "Manuel",
      installedAt: "Installé le {{date}}",
      updatedAt: "MàJ {{registry}} : {{date}}",
      version: "v{{version}}",
      loadFailed: "Impossible de charger les mods installés",
      restartRequired:
        "Redémarrez le serveur pour appliquer ce changement — BepInEx ne recharge les mods qu'au démarrage.",
    },
    thunderstore: {
      title: "Installer via un code",
      label: "Code de package",
      helper:
        "Format : Auteur-NomDuMod-Version (ex : denikson-BepInExPack_Valheim-5.4.2202)",
      importProfile: "Importer un profil",
      profileLabel: "Code de profil",
      profileHelper:
        "Collez le code exporté depuis Thunderstore, Hexium ou r2modman/Gale (Paramètres → Exporter le profil → Copier le code)",
      importProfileFile: "Importer depuis un fichier (.r2z)",
      install: "Installer",
      success: "{{name}} installé depuis {{registry}}",
      profileSuccess: "{{count}} mod(s) installé(s) depuis le profil",
      profileErrors: "{{count}} mod(s) en erreur — voir les notifications",
    },
    browse: {
      tabs: {
        trending: "Tendances",
        latest: "Nouveaux",
        updated: "Mis à jour",
      },
      search: "Rechercher…",
      searchBtn: "Rechercher",
      clearSearch: "Effacer",
      installLatest: "Installer la dernière version",
      openTooltip: "Ouvre la page du mod sur {{registry}}",
      viewFiles: "Versions",
      filesDialog: {
        title: "Versions de {{name}}",
        close: "Fermer",
        size: "{{size}} Ko",
        noFiles: "Aucune version disponible",
      },
      endorsements: "{{count}} étoiles",
      loading: "Chargement…",
      error: "Impossible de charger les mods {{registry}}",
    },
    folders: {
      plugins: "Dossier des mods",
      config: "Config des mods",
    },
    nxm: {
      installing: "Installation en cours…",
      success: "{{name}} installé avec succès",
      error: "Erreur d'installation : {{error}}",
    },
    deps: {
      title: "Dépendances requises",
      subtitle:
        "{{name}} nécessite {{count}} mod(s) non installé(s). Voulez-vous les installer ?",
      installAll: "Tout installer ({{count}})",
      skip: "Ignorer",
    },
    updates: {
      newVersion: "v{{version}} dispo",
      newVersionOnRegistry: "v{{version}} dispo sur {{registry}}",
      updateBtn: "Mettre à jour vers v{{version}}",
      updateBtnSourceChanged:
        "Mettre à jour vers v{{version}} — passera de {{from}} à {{to}}",
      refresh: "Vérifier les mises à jour",
      found: "{{count}} mise(s) à jour disponible(s)",
      none: "Tous les mods sont à jour",
      updateAll: "Tout mettre à jour ({{count}})",
    },
    configs: {
      empty:
        "Aucun fichier de config trouvé dans BepInEx/config/. Les mods en génèrent un au premier lancement du serveur.",
      noEntries: "Aucun paramètre reconnu dans ce fichier.",
      noMatch: "Aucun résultat.",
      searchFiles: "Rechercher un fichier de config…",
      searchSettings: "Rechercher un paramètre (nom, description, section)…",
      default: "Défaut : {{value}}",
      edit: "Éditer",
      close: "Fermer",
      save: "Enregistrer",
      saved: "{{name}} enregistré",
      loadFailed: "Impossible de lister les fichiers de config",
      readFailed: "Impossible de lire ce fichier de config",
      saveFailed: "Impossible d'enregistrer ce fichier de config",
      unsaved: {
        title: "Modifications non enregistrées",
        message:
          "Vous avez modifié {{name}} sans enregistrer. Quitter quand même ?",
        keepEditing: "Continuer l'édition",
        discard: "Quitter sans enregistrer",
      },
    },
  },
};
