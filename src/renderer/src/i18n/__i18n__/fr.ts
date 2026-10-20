export default {
  common: {
    save: "Sauvegarder",
    cancel: "Annuler",
    delete: "Supprimer",
    confirm: "Confirmer",
    browse: "Parcourir",
    error: "Erreur",
    success: "Succès",
    language: "Langue",
    errorPrefix: "Erreur : {{msg}}",
    change: "Modifier",
    or: "OU",
    clearSearch: "Effacer la recherche",
  },
  serverControls: {
    startFailed: "Impossible de démarrer le serveur",
    stopFailed: "Impossible d'arrêter le serveur",
    restartFailed: "Impossible de redémarrer le serveur",
  },
  appErrors: {
    NO_SERVER_PATH: "Aucun dossier de serveur configuré.",
    NO_ACTIVE_SERVER:
      "Aucun serveur sélectionné. Choisissez-en un dans la barre latérale.",
    SERVER_NOT_FOUND: "Ce serveur n'existe plus ({{id}}).",
    UNKNOWN_GAME: "Jeu inconnu : {{game}}",
    SERVER_ALREADY_RUNNING: "Le serveur est déjà lancé.",
    SERVER_NOT_RUNNING: "Le serveur n'est pas lancé.",
    SERVER_EXE_NOT_FOUND:
      "{{exe}} introuvable dans {{path}}. Installez le serveur depuis la page Installation, ou vérifiez le dossier du serveur.",
    SERVER_STOP_TIMEOUT: "Le serveur n'a pas répondu à la demande d'arrêt.",
    STOP_BEFORE_RESTORE:
      "Arrêtez le serveur avant de restaurer une sauvegarde.",
    BACKUP_SOURCE_NOT_FOUND:
      "Rien à sauvegarder : le dossier du monde n'existe pas ({{path}}). Démarrez le serveur une fois pour qu'il crée son monde.",
    BACKUP_TIMEOUT:
      "La sauvegarde a pris trop longtemps et a été annulée (fichiers verrouillés par un autre programme ?).",
    BACKUP_FILE_NOT_FOUND: "Fichier de sauvegarde introuvable : {{path}}",
    BACKUP_CORRUPTED:
      "{{name}} est corrompu ou incomplet : la sauvegarde a probablement été interrompue pendant sa création. Essayez de l'ouvrir avec 7-Zip pour récupérer ce qui peut l'être.",
    PAL_API_DISABLED:
      "L'API REST de Palworld est désactivée. Activez-la dans la page Configuration (RESTAPIEnabled), puis redémarrez le serveur.",
    PAL_API_HTTP:
      "L'API REST de Palworld a répondu par une erreur (HTTP {{status}}). Un 401 signifie que le mot de passe admin ne correspond pas.",
    PAL_API_TIMEOUT: "L'API REST de Palworld n'a pas répondu en 8 secondes.",
    PAL_API_UNREACHABLE:
      "Impossible de joindre l'API REST de Palworld. Vérifiez que le serveur tourne et que le port de l'API correspond à la configuration.",
    NETWORK_ERROR:
      "Impossible de joindre {{host}} ({{detail}}). Vérifiez votre connexion Internet.",
    HTTP_ERROR: "{{host}} a répondu par une erreur (HTTP {{status}}).",
    INVALID_RESPONSE: "Réponse inattendue de {{host}} (HTTP {{status}}).",
    TOO_MANY_REDIRECTS: "Trop de redirections : téléchargement annulé.",
    DOWNLOAD_TIMEOUT:
      "Le téléchargement s'est bloqué et a été annulé. Réessayez.",
    PUBLIC_IP_FAILED: "Impossible d'obtenir votre IP publique ({{detail}}).",
    STEAMCMD_FAILED:
      "Échec de SteamCMD (code {{code}}). Le journal d'installation ci-dessus indique pourquoi.",
    STEAMCMD_EXTRACT_FAILED: "Impossible d'extraire SteamCMD (code {{code}}).",
    FILE_NOT_FOUND: "Fichier introuvable : {{path}}",
    INVALID_FILE_NAME: "Nom de fichier invalide.",
    MOD_NOT_FOUND: "Mod {{name}} introuvable sur les registres de mods.",
    MOD_CODE_INVALID:
      "Format invalide. Attendu : Auteur-NomDuMod-Version (ex : denikson-BepInExPack_Valheim-5.4.2202).",
    BEPINEX_VERSION_UNAVAILABLE:
      "Impossible d'obtenir la version de BepInExPack_Valheim depuis Thunderstore.",
    BEPINEX_ZIP_INVALID:
      "Archive BepInEx inattendue : BepInEx/core/BepInEx.dll est absent.",
    PROFILE_NO_R2X:
      "Ce profil n'a pas de fichier export.r2x : ce n'est pas un profil r2modman/Gale.",
    PROFILE_EMPTY: "Ce profil ne contient aucun mod.",
    PROFILE_UNRESOLVED:
      "Code de profil introuvable sur Thunderstore et Hexium. Il a peut-être expiré : demandez-en un nouveau.",
    PROFILE_UNEXPECTED_RESPONSE: "Réponse inattendue du service de profils.",
    PROFILE_INVALID_CODE: "Code de profil invalide.",
    PROFILE_UNKNOWN_FORMAT: "Format de profil non reconnu.",
    MODPACK_NO_MODS: "Aucun mod actif à partager.",
    MODPACK_NO_CODE:
      "Thunderstore n'a pas renvoyé de code de profil. Réessayez.",
    PORT_CONFLICT: "Conflit de ports avec un serveur déjà lancé : {{list}}",
    VALHEIM_PASSWORD_IN_NAME:
      "Le mot de passe Valheim ne doit pas apparaître dans le nom du serveur.",
    VALHEIM_PASSWORD_TOO_SHORT:
      "Le mot de passe Valheim doit faire au moins 5 caractères (ou être vide).",
    DW_OWNER_ID_MISSING:
      "Renseignez votre Player ID (OwnerId) dans la page Configuration : sans lui, le serveur Dragonwilds ne démarre pas. Il s'affiche en bas du menu Paramètres du jeu.",
    DW_OWNER_ID_INVALID:
      "Player ID invalide : copiez-le tel quel depuis le menu Paramètres du jeu (lettres et chiffres uniquement).",
    CONFIG_LOCKED:
      "Arrêtez le serveur avant de modifier sa configuration : il réécrit ce fichier pendant qu'il tourne.",
    PORT_INVALID: "Port invalide (1 à 65535).",
    PORTS_SAME: "Le port de jeu et le port beacon doivent être différents.",
    STOP_BEFORE_WORLD_CHANGE: "Arrêtez le serveur avant de changer de monde.",
    WORLD_NOT_FOUND: "Monde introuvable : {{name}}",
    NOT_A_WORLD_SAVE:
      "Ce fichier n'est pas une sauvegarde de monde Dragonwilds.",
    BACKUP_BEFORE_UPDATE_FAILED:
      "Mise à jour annulée : la sauvegarde du monde a échoué ({{msg}}). Vérifiez le dossier de sauvegarde, ou désactivez « Sauvegarder le monde avant chaque mise à jour » dans la page Sauvegardes.",
  },
  installDir: {
    warning:
      "Ce dossier est dans le dossier d'installation de Nexum ({{dir}}). Jusqu'à la version 0.12.3, Nexum vidait ce dossier à chaque mise à jour : choisissez un dossier en dehors pour protéger vos fichiers.",
  },
  gameUpdate: {
    available:
      "{{name}} : une mise à jour du serveur est disponible (build {{build}}). Les joueurs qui ont mis le jeu à jour ne pourront pas se connecter.",
    availableSteamLibrary:
      "{{name}} : une mise à jour du serveur est disponible (build {{build}}). Installé via la bibliothèque Steam : mettez-le à jour depuis Steam.",
    update: "Mettre à jour",
  },
  modUpdate: {
    available_one:
      "{{name}} : 1 mod a une mise à jour. Mettez-le à jour serveur arrêté.",
    available_other:
      "{{name}} : {{count}} mods ont une mise à jour. Mettez-les à jour serveur arrêté.",
    deprecated_one: "{{name}} : 1 mod a été déprécié par son auteur.",
    deprecated_other:
      "{{name}} : {{count}} mods ont été dépréciés par leurs auteurs.",
    open: "Voir les mods",
  },
  status: {
    running: "En ligne",
    starting: "Démarrage...",
    stopping: "Arrêt...",
    crashed: "Planté",
    stopped: "Arrêté",
  },
  backup: {
    title: "Sauvegardes",
    config: {
      title: "Configuration",
      dir: "Dossier de sauvegarde",
      dirTooltip: "Choisir un dossier",
      dirOpen: "Ouvrir dans l'explorateur",
      keep: "Sauvegardes à conserver (rotation)",
      keepHelper:
        "0 = pas de rotation. Les sauvegardes d'avant mise à jour sont comptées à part.",
      auto: "Sauvegarde automatique",
      autoOff: "Désactivée",
      auto15: "Toutes les 15 minutes",
      auto30: "Toutes les 30 minutes",
      auto60: "Toutes les heures",
      auto180: "Toutes les 3 heures",
      auto360: "Toutes les 6 heures",
      auto720: "Toutes les 12 heures",
      auto1440: "Une fois par jour",
      beforeUpdate: "Sauvegarder le monde avant chaque mise à jour",
      beforeUpdateHelper:
        "Avant de mettre à jour le jeu (page Installation, redémarrage planifié) ou les mods. Si la sauvegarde échoue, la mise à jour n'est pas lancée.",
    },
    list: {
      title: "Sauvegardes ({{count}})",
      create: "Créer une sauvegarde",
      creating: "Sauvegarde...",
      none: "Aucune sauvegarde",
      restoreTooltip: "Restaurer (serveur arrêté requis)",
      deleteTooltip: "Supprimer",
      restoreConfirm:
        "Restaurer {{name}} ?\nLa sauvegarde actuelle sera écrasée.",
      deleteConfirm: "Supprimer {{name}} ?",
      beforeUpdate: "Avant mise à jour",
    },
    notify: {
      cannotLoad: "Impossible de charger les sauvegardes",
      created: "Sauvegarde créée : {{name}}",
      createFailed: "Échec de la sauvegarde",
      restored: "Sauvegarde restaurée : {{name}}",
      restoreFailed: "Échec de la restauration",
      deleted: "Sauvegarde supprimée",
      deleteFailed: "Impossible de supprimer la sauvegarde",
      configFailed: "Impossible d'enregistrer la configuration de sauvegarde",
      beforeUpdate: "Monde sauvegardé avant la mise à jour : {{name}}",
    },
  },
  schedule: {
    title: "Planification",
    subtitle: "Redémarrage automatique quotidien du serveur",
    enabled: "Activer le redémarrage planifié",
    time: "Heure (24h)",
    warning: "Avertissement (minutes avant)",
    warningHelper: "Délai entre l'annonce et l'arrêt (0 = immédiat)",
    message: "Message d'annonce",
    messageHelper: "{minutes} sera remplacé par le délai",
    updateGame: "Mettre à jour le jeu au moment du redémarrage",
    updateGameHelper:
      "Si une mise à jour du serveur est disponible : arrêt, sauvegarde du monde, mise à jour avec SteamCMD, puis démarrage. Sans effet pour un serveur installé via la bibliothèque Steam.",
    save: "Enregistrer",
    notify: {
      saved: "Planification enregistrée",
      saveFailed: "Impossible d'enregistrer la planification",
    },
  },
};
